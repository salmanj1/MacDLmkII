import { useCallback, useEffect, useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Mode } from '../data/commonParams';
import { midiCC } from '../data/midi';
import { buildModelSelectMessages, type MidiMessage } from '../data/midiMessages';

const isTauriRuntime =
  typeof window !== 'undefined' &&
  typeof (window as unknown as { __TAURI_IPC__?: unknown }).__TAURI_IPC__ !==
    'undefined';

type MidiBridge = {
  ports: string[];
  selectedPort: number | null;
  channel: number;
  error: string | null;
  ready: boolean;
  clock: {
    running: boolean;
    bpm: number | null;
    followEnabled: boolean;
    enableFollow: () => Promise<void>;
    disableFollow: () => Promise<void>;
  };
  refreshOutputs: () => Promise<void>;
  selectPort: (index: number) => Promise<void>;
  setChannel: (channel: number) => void;
  sendMessages: (messages: MidiMessage[]) => Promise<void>;
  sendModelSelect: (mode: Mode, detent: number) => Promise<void>;
  sendCC: (control: number, value: number) => Promise<void>;
  sendProgramChange: (program: number) => Promise<void>;
};

const useMidiBridge = (): MidiBridge => {
  const [ports, setPorts] = useState<string[]>([]);
  const [selectedPort, setSelectedPort] = useState<number | null>(null);
  const [channel, setChannelState] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [clockRunning, setClockRunning] = useState(false);
  const [clockBpm, setClockBpm] = useState<number | null>(null);
  const [clockFollowEnabled, setClockFollowEnabled] = useState(false);

  const ready = useMemo(() => isTauriRuntime, []);

  const refreshOutputs = useCallback(async () => {
    if (!ready) return;
    try {
      const list = await invoke<string[]>('list_midi_outputs');
      setPorts(list);
      setError(null);
    } catch (err) {
      setError((err as Error).message ?? 'Failed to list MIDI outputs');
      setSelectedPort(null);
    }
  }, [ready]);

  const selectPort = useCallback(
    async (index: number) => {
      if (!ready) return;
      try {
        const selected = await invoke<number | null>('select_midi_output', {
          index
        });
        setSelectedPort(selected ?? null);
        setError(null);
        setClockFollowEnabled(false);
        setClockRunning(false);
        setClockBpm(null);
      } catch (err) {
        setError((err as Error).message ?? 'Failed to select MIDI output');
        setSelectedPort(null);
        await refreshOutputs();
      }
    },
    [ready, refreshOutputs]
  );

  const setChannel = useCallback((next: number) => {
    const clamped = Math.min(16, Math.max(1, Math.floor(next || 1)));
    setChannelState(clamped);
  }, []);

  const pollClock = useCallback(async () => {
    if (!ready || !clockFollowEnabled) return;
    try {
      const [running, bpm] = await invoke<[boolean, number | null]>('midi_clock_status');
      setClockRunning(running);
      setClockBpm(bpm);
    } catch (err) {
      console.warn('Clock poll failed', err);
    }
  }, [clockFollowEnabled, ready]);

  useEffect(() => {
    if (!clockFollowEnabled) return;
    const interval = setInterval(() => {
      pollClock();
    }, 500);
    return () => clearInterval(interval);
  }, [clockFollowEnabled, pollClock]);

  const enableClockFollow = useCallback(async () => {
    if (!ready || selectedPort === null) return;
    await invoke('enable_midi_clock_follow', { index: selectedPort });
    setClockFollowEnabled(true);
  }, [ready, selectedPort]);

  const disableClockFollow = useCallback(async () => {
    if (!ready) return;
    await invoke('disable_midi_clock_follow');
    setClockFollowEnabled(false);
    setClockRunning(false);
    setClockBpm(null);
  }, [ready]);

  const sendMessages = useCallback(
    async (messages: MidiMessage[]) => {
      if (!ready || selectedPort === null) return;
      try {
        for (const msg of messages) {
          if (msg.type === 'cc') {
            await invoke('send_midi_cc', {
              channel,
              control: msg.control,
              value: msg.value
            });
          } else if (msg.type === 'pc') {
            await invoke('send_midi_pc', { channel, program: msg.program });
          }
        }
        setError(null);
      } catch (err) {
        setError((err as Error).message ?? 'Failed to send MIDI message');
        await refreshOutputs();
      }
    },
    [channel, ready, refreshOutputs, selectedPort]
  );

  const sendModelSelect = useCallback(
    async (mode: Mode, detent: number) => {
      if (!ready || selectedPort === null) return;
      const messages = buildModelSelectMessages(mode, detent);
      await sendMessages(messages);
    },
    [ready, selectedPort, sendMessages]
  );

  const sendCC = useCallback(
    async (control: number, value: number) => {
      if (!ready || selectedPort === null) return;
      try {
        await invoke('send_midi_cc', {
          channel,
          control,
          value
        });
        setError(null);
      } catch (err) {
        setError((err as Error).message ?? 'Failed to send MIDI CC');
        await refreshOutputs();
      }
    },
    [channel, ready, refreshOutputs, selectedPort]
  );

  const sendProgramChange = useCallback(
    async (program: number) => {
      if (!ready || selectedPort === null) return;
      try {
        await invoke('send_midi_pc', { channel, program });
        setError(null);
      } catch (err) {
        setError((err as Error).message ?? 'Failed to send MIDI program change');
        await refreshOutputs();
      }
    },
    [channel, ready, refreshOutputs, selectedPort]
  );

  useEffect(() => {
    refreshOutputs();
  }, [refreshOutputs]);

  return {
    ports,
    selectedPort,
    channel,
    error,
    ready,
    clock: {
      running: clockRunning,
      bpm: clockBpm,
      followEnabled: clockFollowEnabled,
      enableFollow: enableClockFollow,
      disableFollow: disableClockFollow
    },
    refreshOutputs,
    selectPort,
    setChannel,
    sendMessages,
    sendModelSelect,
    sendCC,
    sendProgramChange
  };
};

export default useMidiBridge;

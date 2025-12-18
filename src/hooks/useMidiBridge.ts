import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Mode } from '../data/commonParams';
import { buildModelSelectMessages, type MidiMessage } from '../data/midiMessages';

// Tauri 2 exposes `__TAURI_INTERNALS__`; Tauri 1 used `__TAURI_IPC__`.
// Check both so dev/runtime detection works across versions.
const isTauriRuntime =
  typeof window !== 'undefined' &&
  Boolean(
    (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ ??
      (window as unknown as { __TAURI_IPC__?: unknown }).__TAURI_IPC__
  );

type MidiBridge = {
  ports: string[];
  selectedPort: number | null;
  channel: number;
  error: string | null;
  lastCommand: { type: 'cc'; control: number } | { type: 'pc'; program: number } | null;
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

type QueueEntry =
  | {
      type: 'cc';
      channel: number;
      control: number;
      value: number;
      resolve: () => void;
      reject: (error: Error) => void;
    }
  | {
      type: 'pc';
      channel: number;
      program: number;
      resolve: () => void;
      reject: (error: Error) => void;
    };

const useMidiBridge = (): MidiBridge => {
  const [ports, setPorts] = useState<string[]>([]);
  const [selectedPort, setSelectedPort] = useState<number | null>(null);
  const [channel, setChannelState] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<
    { type: 'cc'; control: number } | { type: 'pc'; program: number } | null
  >(null);
  const [clockRunning, setClockRunning] = useState(false);
  const [clockBpm, setClockBpm] = useState<number | null>(null);
  const [clockFollowEnabled, setClockFollowEnabled] = useState(false);
  const queueRef = useRef<QueueEntry[]>([]);
  const processingRef = useRef(false);

  const ready = useMemo(() => isTauriRuntime, []);

  const refreshOutputs = useCallback(async () => {
    if (!ready) return;
    try {
      const list = await invoke<string[]>('list_midi_outputs');
      setPorts(list);
      setSelectedPort((prev) =>
        prev !== null && prev < list.length ? prev : null
      );
      setError(null);
      setLastCommand(null);
    } catch (err) {
      setError((err as Error).message ?? 'Failed to list MIDI outputs');
      setSelectedPort(null);
      setLastCommand(null);
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
        setLastCommand(null);
        setClockFollowEnabled(false);
        setClockRunning(false);
        setClockBpm(null);
      } catch (err) {
        setError((err as Error).message ?? 'Failed to select MIDI output');
        setSelectedPort(null);
        setLastCommand(null);
        await refreshOutputs();
      }
    },
    [ready, refreshOutputs]
  );

  const setChannel = useCallback((next: number) => {
    const clamped = Math.min(16, Math.max(1, Math.floor(next || 1)));
    setChannelState(clamped);
  }, []);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    if (!ready || selectedPort === null) return;
    processingRef.current = true;

    try {
      while (queueRef.current.length > 0) {
        const next = queueRef.current.shift();
        if (!next) break;
        try {
          if (next.type === 'cc') {
            await invoke('send_midi_cc', {
              channel: next.channel,
              control: next.control,
              value: next.value
            });
          } else {
            await invoke('send_midi_pc', {
              channel: next.channel,
              program: next.program
            });
          }
          next.resolve();
        } catch (err) {
          const message =
            (err as Error).message ?? 'Failed to send MIDI message';
          setError(message);
          if (next.type === 'cc') {
            setLastCommand({ type: 'cc', control: next.control });
          } else {
            setLastCommand({ type: 'pc', program: next.program });
          }
          next.reject(new Error(message));
          queueRef.current.forEach((entry) => entry.reject(new Error(message)));
          queueRef.current = [];
          await refreshOutputs();
          break;
        }
      }
    } finally {
      processingRef.current = false;
    }
  }, [ready, refreshOutputs, selectedPort]);

  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      processQueue();
    }, 80);
    return () => clearInterval(interval);
  }, [processQueue, ready]);

  const fetchClockStatus = useCallback(async () => {
    if (!ready) return;
    try {
      const [running, bpm] = await invoke<[boolean, number | null]>(
        'midi_clock_status'
      );
      setClockRunning(running);
      setClockBpm(bpm);
    } catch (err) {
      console.warn('Clock poll failed', err);
    }
  }, [ready]);

  const pollClock = useCallback(async () => {
    if (!clockFollowEnabled) return;
    await fetchClockStatus();
  }, [clockFollowEnabled, fetchClockStatus]);

  useEffect(() => {
    if (!clockFollowEnabled) return;
    const interval = setInterval(() => {
      pollClock();
    }, 500);
    return () => clearInterval(interval);
  }, [clockFollowEnabled, pollClock]);

  const enableClockFollow = useCallback(async () => {
    if (!ready || selectedPort === null) return;
    try {
      await invoke('enable_midi_clock_follow', { index: selectedPort });
      setClockFollowEnabled(true);
      await fetchClockStatus();
      setError(null);
      setLastCommand(null);
    } catch (err) {
      setError((err as Error).message ?? 'Failed to enable MIDI clock follow');
      setLastCommand(null);
    }
  }, [fetchClockStatus, ready, selectedPort]);

  const disableClockFollow = useCallback(async () => {
    if (!ready) return;
    try {
      await invoke('disable_midi_clock_follow');
      setClockFollowEnabled(false);
      setClockRunning(false);
      setClockBpm(null);
      setError(null);
      setLastCommand(null);
    } catch (err) {
      setError((err as Error).message ?? 'Failed to disable MIDI clock follow');
      setLastCommand(null);
    }
  }, [ready]);

  const sendMessages = useCallback(
    async (messages: MidiMessage[]) => {
      if (!ready || selectedPort === null) return;
      const tasks = messages.map(
        (msg) =>
          new Promise<void>((resolve, reject) => {
            if (msg.type === 'cc') {
              queueRef.current.push({
                type: 'cc',
                channel,
                control: msg.control,
                value: msg.value,
                resolve,
                reject
              });
            } else {
              queueRef.current.push({
                type: 'pc',
                channel,
                program: msg.program,
                resolve,
                reject
              });
            }
          })
      );
      setError(null);
      setLastCommand(null);
      try {
        await processQueue();
        await Promise.all(tasks);
      } catch {
        // Errors are surfaced via state; callers treat sends as fire-and-forget.
      }
    },
    [channel, processQueue, ready, selectedPort]
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
      await sendMessages([{ type: 'cc', control, value }]);
    },
    [ready, selectedPort, sendMessages]
  );

  const sendProgramChange = useCallback(
    async (program: number) => {
      if (!ready || selectedPort === null) return;
      await sendMessages([{ type: 'pc', program }]);
    },
    [ready, selectedPort, sendMessages]
  );

  useEffect(() => {
    refreshOutputs();
  }, [refreshOutputs]);

  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      refreshOutputs();
    }, 2000);
    return () => clearInterval(interval);
  }, [ready, refreshOutputs]);

  return {
    ports,
    selectedPort,
    channel,
    error,
    lastCommand,
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

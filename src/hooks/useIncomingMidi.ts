import { useEffect } from 'react';
import { logMidiMessage, type MidiMessageType, type MidiDirection } from '../state/useMidiDebugger';
import { invoke } from '@tauri-apps/api/core';

// Basic decoder for status byte
const decodeStatus = (status: number): { type: MidiMessageType; summary: string } => {
  const high = status & 0xf0;
  if (high === 0xc0) return { type: 'pc', summary: `Program Change` };
  if (high === 0xb0) return { type: 'cc', summary: `Control Change` };
  if (status === 0xf8) return { type: 'clock', summary: 'Clock' };
  if (status === 0xfa) return { type: 'clock', summary: 'Start' };
  if (status === 0xfb) return { type: 'clock', summary: 'Continue' };
  if (status === 0xfc) return { type: 'clock', summary: 'Stop' };
  if (status === 0xf0) return { type: 'sysex', summary: 'SysEx' };
  return { type: 'other', summary: `0x${status.toString(16)}` };
};

// Tauri listen wrapper
const listenToMidiIn = (handler: (data: number[]) => void) => {
  try {
    // This assumes a Tauri command emits 'midi_in' with raw bytes array.
    // Replace with the actual event name if different.
    const unlistenPromise = (window as any).__TAURI_EVENT_EMITTER__?.listen?.('midi_in', (event: any) => {
      if (Array.isArray(event?.payload)) handler(event.payload as number[]);
    });
    return () => {
      if (typeof unlistenPromise?.then === 'function') {
        unlistenPromise.then((unsub: any) => unsub && unsub());
      }
    };
  } catch {
    return () => {};
  }
};

export const useIncomingMidi = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;
    const unsubscribe = listenToMidiIn((bytes) => {
      if (!bytes || bytes.length === 0) return;
      const status = bytes[0];
      const { type, summary } = decodeStatus(status);
      logMidiMessage({
        direction: 'in',
        type,
        summary,
        detail: bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ')
      });
    });
    return () => unsubscribe();
  }, [enabled]);
};

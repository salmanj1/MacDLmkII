import { useSyncExternalStore } from 'react';

export type MidiMessageType = 'pc' | 'cc' | 'sysex' | 'clock' | 'other';
export type MidiDirection = 'out' | 'in' | 'error';

export type MidiLogEntry = {
  id: number;
  ts: number;
  direction: MidiDirection;
  type: MidiMessageType;
  summary: string;
  detail?: string;
};

type DebuggerState = {
  entries: MidiLogEntry[];
  filters: Record<MidiMessageType | MidiDirection, boolean>;
};

let counter = 0;

const createDebuggerStore = () => {
  let state: DebuggerState = {
    entries: [],
    filters: {
      pc: true,
      cc: true,
      sysex: true,
      clock: true,
      other: true,
      out: true,
      in: true,
      error: true
    }
  };

  const subscribers = new Set<() => void>();

  const notify = () => subscribers.forEach((fn) => fn());

  const push = (entry: Omit<MidiLogEntry, 'id'>) => {
    const next: MidiLogEntry = { ...entry, id: ++counter };
    // keep last 1000 for perf
    state = { ...state, entries: [...state.entries, next].slice(-1000) };
    notify();
  };

  const toggleFilter = (key: MidiMessageType | MidiDirection) => {
    state = {
      ...state,
      filters: { ...state.filters, [key]: !state.filters[key] }
    };
    notify();
  };

  const clear = () => {
    state = { ...state, entries: [] };
    notify();
  };

  const subscribe = (fn: () => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  const getState = () => state;

  return {
    subscribe,
    getState,
    logMessage: (entry: Omit<MidiLogEntry, 'id' | 'ts'> & { ts?: number }) =>
      push({ ...entry, ts: entry.ts ?? Date.now() }),
    toggleFilter,
    clear
  };
};

const store = createDebuggerStore();

export const logMidiMessage = store.logMessage;
export const clearMidiLog = store.clear;
export const toggleMidiLogFilter = store.toggleFilter;
export const useMidiDebugger = () =>
  useSyncExternalStore(store.subscribe, store.getState, store.getState);

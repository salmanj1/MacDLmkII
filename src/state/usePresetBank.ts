import { useSyncExternalStore } from 'react';

export type Preset = {
  id: number; // 0-127
  name: string;
  tags: string[];
  description?: string;
  parameters: {
    time: number;
    tweak: number;
    tweez: number;
    mix: number;
    repeats: number;
    delayType: string;
    reverbType?: string;
  };
  lastModified: string; // ISO string for persistence
  isEmpty: boolean;
  snapshot?: unknown;
};

type BankState = {
  presets: Preset[];
  filter: string;
  selectedId: number | null;
};

const STORAGE_KEY = 'dl4mkii-preset-bank';

const buildInitialBank = (): Preset[] =>
  Array.from({ length: 128 }, (_, idx) => ({
    id: idx,
    name: `Preset ${idx + 1}`,
    tags: [],
    description: '',
    parameters: {
      time: 64,
      tweak: 64,
      tweez: 64,
      mix: 64,
      repeats: 64,
      delayType: 'MkII',
      reverbType: undefined
    },
    lastModified: new Date().toISOString(),
    isEmpty: true
  }));

const loadFromStorage = (): Preset[] | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as Preset[];
  } catch {
    return null;
  }
};

const saveToStorage = (presets: Preset[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // ignore
  }
};

const createStore = () => {
  let state: BankState = {
    presets: loadFromStorage() ?? buildInitialBank(),
    filter: '',
    selectedId: null
  };

  const subscribers = new Set<() => void>();
  const notify = () => subscribers.forEach((fn) => fn());

  const setPresets = (next: Preset[]) => {
    state = { ...state, presets: next };
    saveToStorage(next);
    notify();
  };

  const setFilter = (filter: string) => {
    state = { ...state, filter };
    notify();
  };

  const select = (id: number | null) => {
    state = { ...state, selectedId: id };
    notify();
  };

  const updatePreset = (id: number, updater: (prev: Preset) => Preset) => {
    const next = state.presets.map((p) => (p.id === id ? updater(p) : p));
    setPresets(next);
  };

  const duplicatePreset = (sourceId: number, targetId: number) => {
    const source = state.presets.find((p) => p.id === sourceId);
    if (!source) return;
    updatePreset(targetId, () => ({
      ...source,
      id: targetId,
      name: `${source.name} Copy`,
      lastModified: new Date().toISOString(),
      isEmpty: false
    }));
  };

  const setTags = (id: number, tags: string[]) => {
    updatePreset(id, (prev) => ({
      ...prev,
      tags,
      isEmpty: false,
      lastModified: new Date().toISOString()
    }));
  };

  const swapPresets = (a: number, b: number) => {
    const next = [...state.presets];
    const idxA = next.findIndex((p) => p.id === a);
    const idxB = next.findIndex((p) => p.id === b);
    if (idxA < 0 || idxB < 0) return;
    [next[idxA], next[idxB]] = [next[idxB], next[idxA]];
    // reassign ids to keep position identity
    next[idxA] = { ...next[idxA], id: a };
    next[idxB] = { ...next[idxB], id: b };
    setPresets(next);
  };

  const replaceBank = (presets: Preset[]) => {
    // normalize length to 128
    const normalized = Array.from({ length: 128 }, (_, idx) => {
      const found = presets.find((p) => p.id === idx);
      return (
        found ?? {
          id: idx,
          name: `Preset ${idx + 1}`,
          tags: [],
          description: '',
          parameters: {
            time: 64,
            tweak: 64,
            tweez: 64,
            mix: 64,
            repeats: 64,
            delayType: 'MkII',
            reverbType: undefined
          },
          lastModified: new Date().toISOString(),
          isEmpty: true
        }
      );
    });
    setPresets(normalized);
  };

  const subscribe = (fn: () => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  const getState = () => state;

  return {
    subscribe,
    getState,
    actions: {
      setFilter,
      select,
      updatePreset,
      duplicatePreset,
      swapPresets,
      setTags,
      replaceBank
    }
  };
};

const store = createStore();

export const usePresetBank = () =>
  useSyncExternalStore(store.subscribe, store.getState, store.getState);

export const presetBankActions = store.actions;

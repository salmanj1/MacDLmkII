// Lightweight global store for the 128-slot preset bank: names, tags, params, import/export.
// PMs can scan this file to see what persists and how presets are updated/duplicated/reordered.
import { useSyncExternalStore } from 'react';
import { defaultSubdivision, findSubdivisionByValue, normalizeSubdivisionValue } from '../data/subdivisions';
import { normalizeRoutingValue } from '../data/routing';

export type Preset = {
  id: number; // 0-127
  name: string;
  tags: string[];
  description?: string;
  parameters: {
    delayType: string;
    delayTime: number;
    delayRepeats: number;
    delayTweak: number;
    delayTweez: number;
    delayMix: number;
    tempoBpm?: number | null;
    subdivision?: { label: string; value: number };
    reverbType?: string;
    reverbDecay?: number;
    reverbTweak?: number;
    reverbTweez?: number;
    reverbMix?: number;
    reverbRouting?: number;
    routing?: number;
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

const normalizePreset = (preset: Preset): Preset => {
  const subdivisionVal = normalizeSubdivisionValue(preset.parameters.subdivision?.value);
  const subdivision = findSubdivisionByValue(subdivisionVal);
  const routingSource =
    preset.parameters.reverbRouting ?? preset.parameters.routing;
  const normalizedRouting =
    typeof routingSource === 'number' ? normalizeRoutingValue(routingSource) : undefined;

  return {
    ...preset,
    parameters: {
      ...preset.parameters,
      subdivision: subdivision ? { label: subdivision.label, value: subdivision.value } : undefined,
      reverbRouting: normalizedRouting ?? preset.parameters.reverbRouting,
      routing: normalizedRouting ?? preset.parameters.routing
    }
  };
};

const buildInitialBank = (): Preset[] =>
  Array.from({ length: 128 }, (_, idx) => ({
    id: idx,
    name: `Preset ${idx + 1}`,
    tags: [],
    description: '',
    parameters: {
      delayType: 'MkII',
      delayTime: 64,
      delayRepeats: 64,
      delayTweak: 64,
      delayTweez: 64,
      delayMix: 64,
      tempoBpm: 120,
      subdivision: { label: defaultSubdivision.label, value: defaultSubdivision.value },
      reverbType: undefined,
      reverbDecay: undefined,
      reverbTweak: undefined,
      reverbTweez: undefined,
      reverbMix: undefined,
      reverbRouting: undefined,
      routing: undefined
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
    return (parsed as Preset[]).map(normalizePreset);
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

const syncSnapshotsToLocalStorage = (presets: Preset[]) => {
  if (typeof localStorage === 'undefined') return;
  presets.forEach((preset) => {
    const key = `macdlmkii-preset-${preset.id}`;
    try {
      if (preset.snapshot) {
        localStorage.setItem(key, JSON.stringify(preset.snapshot));
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      // ignore snapshot sync errors
    }
  });
};

const createStore = () => {
  let state: BankState = {
    presets: (loadFromStorage() ?? buildInitialBank()).map(normalizePreset),
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
      return normalizePreset(
        found ?? {
          id: idx,
          name: `Preset ${idx + 1}`,
          tags: [],
          description: '',
          parameters: {
            delayType: 'MkII',
            delayTime: 64,
            delayRepeats: 64,
            delayTweak: 64,
            delayTweez: 64,
            delayMix: 64,
            tempoBpm: 120,
            subdivision: { label: defaultSubdivision.label, value: defaultSubdivision.value },
            reverbType: undefined,
            reverbDecay: undefined,
            reverbTweak: undefined,
            reverbTweez: undefined,
            reverbMix: undefined,
            reverbRouting: undefined,
            routing: undefined
          },
          lastModified: new Date().toISOString(),
          isEmpty: true
        }
      );
    });
    syncSnapshotsToLocalStorage(normalized);
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

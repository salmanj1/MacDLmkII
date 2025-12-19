// Canonical subdivision map for tempo-synced delay times.
// Provides typed metadata for visual rendering, MIDI mapping, and math helpers.
export type SubdivisionFamily = 'straight' | 'dotted' | 'triplet';
export type SubdivisionId =
  | '1/8T'
  | '1/8'
  | '1/8.'
  | '1/4T'
  | '1/4'
  | '1/4.'
  | '1/2T'
  | '1/2'
  | '1/2.';

export type Subdivision = {
  id: SubdivisionId;
  label: string;
  family: SubdivisionFamily;
  multiplier: number; // Relative to a quarter note; 1 = quarter, 0.5 = eighth.
  midiValue: number; // CC payload for delayNotes when subdivision mode is active.
  noteSymbol: string;
};

export const subdivisions: Subdivision[] = [
  {
    id: '1/8T',
    label: '1/8T',
    family: 'triplet',
    multiplier: 1 / 3,
    noteSymbol: '♪',
    midiValue: 0
  },
  {
    id: '1/8',
    label: '1/8',
    family: 'straight',
    multiplier: 0.5,
    noteSymbol: '♪',
    midiValue: 1
  },
  {
    id: '1/8.',
    label: '1/8.',
    family: 'dotted',
    multiplier: 0.75,
    noteSymbol: '♪',
    midiValue: 2
  },
  {
    id: '1/4T',
    label: '1/4T',
    family: 'triplet',
    multiplier: 2 / 3,
    noteSymbol: '♩',
    midiValue: 3
  },
  {
    id: '1/4',
    label: '1/4',
    family: 'straight',
    multiplier: 1,
    noteSymbol: '♩',
    midiValue: 4
  },
  {
    id: '1/4.',
    label: '1/4.',
    family: 'dotted',
    multiplier: 1.5,
    noteSymbol: '♩',
    midiValue: 5
  },
  {
    id: '1/2T',
    label: '1/2T',
    family: 'triplet',
    multiplier: 4 / 3,
    noteSymbol: '𝅗𝅥',
    midiValue: 6
  },
  {
    id: '1/2',
    label: '1/2',
    family: 'straight',
    multiplier: 2,
    noteSymbol: '𝅗𝅥',
    midiValue: 7
  },
  {
    id: '1/2.',
    label: '1/2.',
    family: 'dotted',
    multiplier: 3,
    noteSymbol: '𝅗𝅥',
    midiValue: 8
  }
];

export const subdivisionsById = subdivisions.reduce<Record<SubdivisionId, Subdivision>>(
  (acc, entry) => {
    acc[entry.id] = entry;
    return acc;
  },
  {} as Record<SubdivisionId, Subdivision>
);

export const midiValueForSubdivision = (id: SubdivisionId) =>
  subdivisionsById[id]?.midiValue ?? null;

export const bpmToMs = (bpm: number) => 60000 / Math.max(1, bpm);

export const delayMsForSubdivision = (bpm: number, subdivision: SubdivisionId) => {
  const target = subdivisionsById[subdivision];
  if (!target) return 0;
  return Math.round(bpmToMs(bpm) * target.multiplier);
};

export const defaultSubdivision =
  subdivisions.find((entry) => entry.label === '1/4') ?? subdivisions[0];

const legacySubdivisionValueMap: Record<number, number> = {
  12: 0,
  25: 1,
  38: 2,
  50: 3,
  64: 4,
  75: 5,
  89: 6,
  102: 7,
  116: 8
};

export const normalizeSubdivisionValue = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return defaultSubdivision.value;
  if (value in legacySubdivisionValueMap) return legacySubdivisionValueMap[value];
  const exact = subdivisions.find((entry) => entry.value === value);
  if (exact) return value;
  return defaultSubdivision.value;
};

export const findSubdivisionByValue = (value: number) => {
  const normalized = normalizeSubdivisionValue(value);
  return subdivisions.find((entry) => entry.value === normalized) ?? defaultSubdivision;
};

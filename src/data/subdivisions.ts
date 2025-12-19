// Canonical subdivision map for tempo-synced delay times.
// Provides typed metadata for visual rendering, MIDI mapping, and math helpers.
export type SubdivisionFamily = 'straight' | 'dotted' | 'triplet';
export type SubdivisionId =
  | '1/16T'
  | '1/16'
  | '1/16.'
  | '1/8T'
  | '1/8'
  | '1/8.'
  | '1/4T'
  | '1/4'
  | '1/4.'
  | '1/2T'
  | '1/2'
  | '1/2.'
  | '1/1';

export type Subdivision = {
  id: SubdivisionId;
  label: string;
  family: SubdivisionFamily;
  multiplier: number; // Relative to a quarter note; 1 = quarter, 0.5 = eighth.
  midiValue: number; // CC payload for delayNotes when subdivision mode is active.
  noteSymbol: string;
};

const anchorMidiPoints: Array<{ multiplier: number; midi: number }> = [
  { multiplier: 1 / 3, midi: 12 }, // 1/8T
  { multiplier: 0.5, midi: 25 }, // 1/8
  { multiplier: 0.75, midi: 38 }, // 1/8.
  { multiplier: 2 / 3, midi: 50 }, // 1/4T
  { multiplier: 1, midi: 64 }, // 1/4
  { multiplier: 1.5, midi: 75 }, // 1/4.
  { multiplier: 4 / 3, midi: 89 }, // 1/2T
  { multiplier: 2, midi: 102 }, // 1/2
  { multiplier: 3, midi: 116 } // 1/2.
];

const interpolateMidiValue = (multiplier: number) => {
  const points = [...anchorMidiPoints].sort(
    (a, b) => a.multiplier - b.multiplier
  );

  if (multiplier <= points[0].multiplier) {
    const [a, b] = points;
    const slope = (b.midi - a.midi) / (b.multiplier - a.multiplier);
    return Math.max(0, Math.round(a.midi + (multiplier - a.multiplier) * slope));
  }

  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    if (multiplier >= current.multiplier && multiplier <= next.multiplier) {
      const slope = (next.midi - current.midi) / (next.multiplier - current.multiplier);
      return Math.round(current.midi + (multiplier - current.multiplier) * slope);
    }
  }

  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const slope = (last.midi - prev.midi) / (last.multiplier - prev.multiplier);
  return Math.min(127, Math.round(last.midi + (multiplier - last.multiplier) * slope));
};

const buildSubdivision = (
  id: SubdivisionId,
  label: string,
  family: SubdivisionFamily,
  multiplier: number,
  noteSymbol: string,
  midiOverride?: number
): Subdivision => ({
  id,
  label,
  family,
  multiplier,
  noteSymbol,
  midiValue: midiOverride ?? interpolateMidiValue(multiplier)
});

export const subdivisions: Subdivision[] = [
  buildSubdivision('1/16T', '1/16T', 'triplet', 1 / 6, '𝅘𝅥𝅯'),
  buildSubdivision('1/16', '1/16', 'straight', 0.25, '𝅘𝅥𝅯'),
  buildSubdivision('1/16.', '1/16.', 'dotted', 0.375, '𝅘𝅥𝅯'),
  buildSubdivision('1/8T', '1/8T', 'triplet', 1 / 3, '♪', 12),
  buildSubdivision('1/8', '1/8', 'straight', 0.5, '♪', 25),
  buildSubdivision('1/8.', '1/8.', 'dotted', 0.75, '♪', 38),
  buildSubdivision('1/4T', '1/4T', 'triplet', 2 / 3, '♩', 50),
  buildSubdivision('1/4', '1/4', 'straight', 1, '♩', 64),
  buildSubdivision('1/4.', '1/4.', 'dotted', 1.5, '♩', 75),
  buildSubdivision('1/2T', '1/2T', 'triplet', 4 / 3, '𝅗𝅥', 89),
  buildSubdivision('1/2', '1/2', 'straight', 2, '𝅗𝅥', 102),
  buildSubdivision('1/2.', '1/2.', 'dotted', 3, '𝅗𝅥', 116),
  buildSubdivision('1/1', '1/1', 'straight', 4, '𝅝')
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

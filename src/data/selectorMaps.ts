import { DetentMeta, Mode } from './commonParams';

export const detentsByMode: Record<Mode, DetentMeta[]> = {
  'MkII Delay': [
    { label: 'Sun Echo', description: 'Tape saturated repeats' },
    { label: 'Glass BBD', description: 'Clean analog with hi-fi tilt' },
    { label: 'Circuit Bend', description: 'Glitchy clocked feedback' }
  ],
  'Legacy Delay': [
    { label: 'Digital 80s', description: 'Pristine studio rack' },
    { label: 'Reverse Pulse', description: 'Backwards shimmer rhythm' },
    { label: 'Lo-Fi Loop', description: 'Crunchy looper vibe' }
  ],
  'Secret Reverb': [
    { label: 'Chamber A', description: 'Bright concert shell' },
    { label: 'Pad Bloom', description: 'Swelling mod plate' },
    { label: 'Noir Spring', description: 'Amp spring with drip' }
  ]
};

export const clampDetent = (mode: Mode, detent: number) => {
  const limit = detentsByMode[mode].length - 1;
  return Math.max(0, Math.min(limit, detent));
};

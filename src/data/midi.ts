import type { Mode } from './commonParams';

export const midiCC = {
  delaySelected: 1,
  reverbSelected: 2,
  expressionPedal: 3,
  presetBypass: 4,
  looperMode: 9,
  delayTime: 11,
  delayNotes: 12,
  delayRepeats: 13,
  delayTweak: 14,
  delayTweez: 15,
  delayMix: 16,
  reverbDecay: 17,
  reverbTweak: 18,
  reverbRouting: 19,
  reverbMix: 20,
  tapTempo: 64
} as const;

// Values mirror the DL4II_Control enums so CC payloads match the hardware.
const mk2ModelValues = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 30 // Looper
];

const legacyModelValues = [
  15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30 // Looper
];

const reverbModelValues = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 // Reverb Off
];

export const modelValueForMode = (mode: Mode, detent: number) => {
  const source =
    mode === 'Secret Reverb'
      ? reverbModelValues
      : mode === 'Legacy Delay'
        ? legacyModelValues
        : mk2ModelValues;
  return source[detent] ?? detent;
};

// Knob control ordering for mapping UI knobs to CCs and labels.
export const delayControls = [
  { id: 'time', cc: midiCC.delayTime, label: 'Time' },
  { id: 'repeats', cc: midiCC.delayRepeats, label: 'Repeats' },
  { id: 'tweak', cc: midiCC.delayTweak, label: 'Tweak' },
  { id: 'tweez', cc: midiCC.delayTweez, label: 'Tweez' },
  { id: 'mix', cc: midiCC.delayMix, label: 'Mix' }
] as const;

export const reverbControls = [
  { id: 'decay', cc: midiCC.reverbDecay, label: 'Decay' },
  { id: 'tweak', cc: midiCC.reverbTweak, label: 'Tweak' },
  { id: 'routing', cc: midiCC.reverbRouting, label: 'Routing' },
  { id: 'mix', cc: midiCC.reverbMix, label: 'Mix' }
] as const;

export const tapSubdivisions = [
  { label: '1/8T', value: 12 },
  { label: '1/8', value: 25 },
  { label: '1/8.', value: 38 },
  { label: '1/4T', value: 50 },
  { label: '1/4', value: 64 },
  { label: '1/4.', value: 75 },
  { label: '1/2T', value: 89 },
  { label: '1/2', value: 102 },
  { label: '1/2.', value: 116 }
] as const;

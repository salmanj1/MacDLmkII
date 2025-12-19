import type { Mode } from './commonParams';

export type ParameterDisplay = {
  id: 'time' | 'repeats' | 'tweak' | 'tweez' | 'mix';
  primaryLabel: string;
  secondaryLabel?: string;
  unit: 'ms' | '%' | 'ratio' | 'generic';
  formatter?: (value: number) => string;
};

const percent = (value: number) => `${Math.round((value / 127) * 100)}%`;
const millis = (value: number) => `${Math.round((value / 127) * 2500)} ms`;

const defaultParams: ParameterDisplay[] = [
  { id: 'time', primaryLabel: 'Time', unit: 'ms', formatter: millis },
  { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
  { id: 'tweak', primaryLabel: 'Tweak', unit: 'generic' },
  { id: 'tweez', primaryLabel: 'Tweez', unit: 'generic' },
  { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
];

type ModelKey = string;

export const parameterMappings: Record<Mode, Record<ModelKey, ParameterDisplay[]>> = {
  'MkII Delay': {
    default: defaultParams,
    'Vintage Digital': [
      { id: 'time', primaryLabel: 'Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Feedback', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Bit Depth', secondaryLabel: 'Filter', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Sample Rate', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Crisscross: [
      { id: 'time', primaryLabel: 'Left Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Feedback', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Right Time', unit: 'ms', formatter: millis },
      { id: 'tweez', primaryLabel: 'Pan Width', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Euclidean: [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Density', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Cluster Offset', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Swing', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Dual Delay': [
      { id: 'time', primaryLabel: 'Left Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Left Feedback', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Right Time', unit: 'ms', formatter: millis },
      { id: 'tweez', primaryLabel: 'Right Feedback', unit: '%', formatter: percent },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Pitch Echo': [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Feedback', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Pitch A', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Pitch B', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    ADT: [
      { id: 'time', primaryLabel: 'Delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Detune', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Wow/Flutter', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Ducked: [
      { id: 'time', primaryLabel: 'Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Feedback', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Threshold', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Attack/Release', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Harmony: [
      { id: 'time', primaryLabel: 'Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Feedback', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Voice A', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Voice B', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Heliosphere: [
      { id: 'time', primaryLabel: 'Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Feedback', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Mod Depth', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Flutter', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Transistor: [
      { id: 'time', primaryLabel: 'Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Feedback', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Flutter', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Drive', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Cosmos: [
      { id: 'time', primaryLabel: 'Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Mod Depth', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Flutter', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ]
  },
  'Legacy Delay': {
    default: [
      { id: 'time', primaryLabel: 'Time/Subdiv', secondaryLabel: 'Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Bass', secondaryLabel: 'Chorus', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Treble', secondaryLabel: 'Wow/Flutter', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ]
  },
  'Secret Reverb': {
    default: [
      { id: 'time', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Tone', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Mod', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Room: [
      { id: 'time', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Tone', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Diffusion', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Plate: [
      { id: 'time', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Tone', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Damping', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Particle Verb': [
      { id: 'time', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Mod', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Glitch Size', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Double Tank': [
      { id: 'time', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Tone', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Damping', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Octo: [
      { id: 'time', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Shimmer Level', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Shimmer Tone', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Tile: [
      { id: 'time', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Tone', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Damping', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Cave': [
      { id: 'time', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Tone', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Mod', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Searchlights': [
      { id: 'time', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Lo Cut', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Hi Cut', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Hot Springs': [
      { id: 'time', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Tone', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Drip/Lo Cut', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Ganymede': [
      { id: 'time', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Lo Cut', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Hi Cut', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Chamber': [
      { id: 'time', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Tone', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Diffusion', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Hall': [
      { id: 'time', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Tone', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Mod', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Glitz': [
      { id: 'time', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Shimmer', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Shimmer Tone', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Reverb Off': [
      { id: 'time', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Tone', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Mod', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ]
  }
};

export const getParameterSet = (mode: Mode, model?: string): ParameterDisplay[] => {
  const byMode = parameterMappings[mode];
  if (!byMode) return defaultParams;
  if (model) {
    if (byMode[model]) return byMode[model];
    const lc = model.toLowerCase();
    const matchKey = Object.keys(byMode).find((k) => k.toLowerCase() === lc);
    if (matchKey) return byMode[matchKey];
  }
  return byMode.default ?? defaultParams;
};

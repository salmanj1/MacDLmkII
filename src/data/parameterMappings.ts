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
    ]
  }
};

export const getParameterSet = (mode: Mode, model?: string): ParameterDisplay[] => {
  const byMode = parameterMappings[mode];
  if (!byMode) return defaultParams;
  if (model && byMode[model]) return byMode[model];
  return byMode.default ?? defaultParams;
};

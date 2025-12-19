// Maps each delay/reverb model to the labels/units shown in the Parameters panel.
// This drives what the PM sees for Time/Repeats/Tweak/Tweez/Mix per model.
import type { Mode } from './commonParams';

export type ParameterDisplay = {
  id: 'time' | 'repeats' | 'tweak' | 'tweez' | 'mix';
  primaryLabel: string;
  secondaryLabel?: string;
  unit: 'ms' | '%' | 'ratio' | 'generic' | 'routing';
  formatter?: (value: number) => string;
};

const percent = (value: number) => `${Math.round((value / 127) * 100)}%`;
const millis = (value: number) => `${Math.round((value / 127) * 2500)} ms`;
const semitones = (value: number) => {
  const st = Math.round((value / 127) * 26) - 13;
  return `${st > 0 ? '+' : ''}${st} st`;
};
const cents = (value: number) => {
  const c = Math.round((value / 127) * 100) - 50;
  return `${c > 0 ? '+' : ''}${c} cents`;
};
const key = (value: number) => {
  const keys = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
  return keys[Math.floor((value / 127) * 12)];
};
const headSelect = (value: number) => {
  const heads = Math.floor((value / 127) * 7) + 1;
  return `Head ${heads}`;
};
const routing = (value: number) => {
  if (value < 43) return 'Rev→Dly';
  if (value < 86) return 'Parallel';
  return 'Dly→Rev';
};

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
      { id: 'tweak', primaryLabel: 'Bit/Sample Quality', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Mod Depth', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Crisscross: [
      { id: 'time', primaryLabel: 'Left Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Feedback', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Delay Time B', unit: 'ms', formatter: millis },
      { id: 'tweez', primaryLabel: 'Cross Amount', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Euclidean: [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Density', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Step Fill', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Rotate', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Dual Delay': [
      { id: 'time', primaryLabel: 'Left Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Left Feedback', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'R Delay Time', unit: 'ms', formatter: millis },
      { id: 'tweez', primaryLabel: 'R Feedback', unit: '%', formatter: percent },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Pitch Echo': [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Feedback', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Pitch Interval', unit: 'generic', formatter: semitones },
      { id: 'tweez', primaryLabel: 'Pitch Cents', unit: 'generic', formatter: cents },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    ADT: [
      { id: 'time', primaryLabel: 'Delay', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Distortion', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Deck 2 Mod Depth', unit: 'generic' },
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
      { id: 'tweak', primaryLabel: 'Key (A-G#)', unit: 'generic', formatter: key },
      { id: 'tweez', primaryLabel: 'Scale', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Heliosphere: [
      { id: 'time', primaryLabel: 'Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Feedback', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Reverb Mix+Decay', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Mod Depth', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Transistor: [
      { id: 'time', primaryLabel: 'Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Feedback', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Headroom', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Wow/Flutter', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Cosmos: [
      { id: 'time', primaryLabel: 'Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Heads Select', unit: 'generic', formatter: headSelect },
      { id: 'tweez', primaryLabel: 'Wow/Flutter', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Multi Pass': [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Tap Pattern', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Delay Mode', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Adriatic: [
      { id: 'time', primaryLabel: 'Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Mod Rate', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Mod Depth', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Elephant Man': [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Mod Depth', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Chorus/Vibrato', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Glitch: [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Pitch Slice/Drift/Shuffle', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Pitch Slice/Drift/Shuffle', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Looper: [
      { id: 'time', primaryLabel: 'Time', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Echo Mod', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Echo Volume', unit: '%', formatter: percent },
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
    ],
    Digital: [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Bass', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Treble', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Digital W/ Mod': [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Mod Rate', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Mod Depth', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Echo Platter': [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Wow/Flutter', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Drive', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Stereo: [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'R Delay Time', unit: 'ms', formatter: millis },
      { id: 'tweez', primaryLabel: 'R Repeats', unit: '%', formatter: percent },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Ping Pong': [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Time Offset', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Stereo Spread', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Reverse: [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Mod Rate', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Mod Depth', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Dynamic: [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Threshold', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Ducking', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Auto-Vol': [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Mod Depth', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Swell Time', unit: 'ms', formatter: millis },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Tube Echo': [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Wow/Flutter', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Drive', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Tape Echo': [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Bass', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Treble', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Multi-Head': [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Heads 1/2', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Heads 3/4', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Sweep: [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Sweep Rate', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Sweep Depth', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Analog: [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Bass', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Treble', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Analog W/ Mod': [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Mod Rate', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Mod Depth', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Lo Res Delay': [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Tone', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Resolution', unit: 'generic' },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Looper: [
      { id: 'time', primaryLabel: 'Time/Subdiv', unit: 'ms', formatter: millis },
      { id: 'repeats', primaryLabel: 'Repeats', unit: '%', formatter: percent },
      { id: 'tweak', primaryLabel: 'Echo Mod', unit: 'generic' },
      { id: 'tweez', primaryLabel: 'Echo Volume', unit: '%', formatter: percent },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ]
  },
  'Secret Reverb': {
    default: [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Model Tweak', unit: 'generic' },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Room: [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Plate: [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Particle Verb': [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Condition', unit: 'generic' },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Double Tank': [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Mod Depth', unit: 'generic' },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Octo: [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Intensity', unit: 'generic' },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Tile: [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Ducking: [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    Plateaux: [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Pitch Modes', unit: 'generic' },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Cave': [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Searchlights': [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Mod Intensity', unit: 'generic' },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Hot Springs': [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Spring Count', unit: 'generic' },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Ganymede': [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Mod Depth', unit: 'generic' },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Chamber': [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Hall': [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Pre-delay', unit: 'ms', formatter: millis },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Glitz': [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Mod Depth', unit: 'generic' },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
      { id: 'mix', primaryLabel: 'Mix', unit: '%', formatter: percent }
    ],
    'Reverb Off': [
      { id: 'repeats', primaryLabel: 'Decay', unit: 'generic' },
      { id: 'tweak', primaryLabel: 'Bypass', unit: 'generic' },
      {
        id: 'tweez',
        primaryLabel: 'Routing',
        secondaryLabel: 'Reverb/Delay',
        unit: 'routing',
        formatter: routing
      },
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

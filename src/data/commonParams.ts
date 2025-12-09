export type Mode = 'MkII Delay' | 'Legacy Delay' | 'Secret Reverb';

export const modes: Mode[] = ['MkII Delay', 'Legacy Delay', 'Secret Reverb'];

export type DetentMeta = {
  label: string;
  description: string;
};

export const notSpecified = 'Not specified in manual';

export type KnobBehavior = {
  label: string;
  behaviorCCW: string;
  behaviorCW: string;
};

export type EffectInfo = {
  id: string;
  mode: Mode;
  detent: number;
  selectorIndex: number;
  model: string;
  inspiration: string;
  description: string;
  tweak: KnobBehavior;
  tweez: KnobBehavior;
  rangeNote: string;
  notes: string[];
};

export const knobBehavior = {
  dragPixelsPerDetent: 18,
  wheelDeltaStep: 60
};

export const commonKnobBehaviors: Record<
  string,
  { behaviorCCW: string; behaviorCW: string }
> = {
  bass: {
    behaviorCCW: 'Reduces low frequencies',
    behaviorCW: 'Boosts low frequencies'
  },
  treble: {
    behaviorCCW: 'Reduces high frequencies',
    behaviorCW: 'Boosts high frequencies'
  },
  'mod rate': {
    behaviorCCW: 'Slows modulation rate',
    behaviorCW: 'Speeds up modulation rate'
  },
  'mod depth': {
    behaviorCCW: 'Decreases modulation depth',
    behaviorCW: 'Increases modulation depth'
  },
  'wow & flutter': {
    behaviorCCW: 'Less tape warble',
    behaviorCW: 'More tape warble'
  },
  predelay: {
    behaviorCCW: 'Shorter predelay time',
    behaviorCW: 'Longer predelay time'
  },
  decay: {
    behaviorCCW: 'Shorter decay',
    behaviorCW: 'Longer decay'
  },
  drive: {
    behaviorCCW: 'Cleaner/less saturation',
    behaviorCW: 'Hotter/more saturation'
  },
  threshold: {
    behaviorCCW: 'Lower threshold (effect triggers sooner)',
    behaviorCW: 'Higher threshold (effect ducks more)'
  },
  release: {
    behaviorCCW: 'Faster release',
    behaviorCW: 'Slower release'
  },
  attack: {
    behaviorCCW: 'Faster attack',
    behaviorCW: 'Slower attack'
  }
};

export const getCommonKnobBehavior = (label: string) =>
  commonKnobBehaviors[label.toLowerCase()] ?? null;

export type Mode = 'MkII Delay' | 'Legacy Delay' | 'Secret Reverb';

export const modes: Mode[] = ['MkII Delay', 'Legacy Delay', 'Secret Reverb'];

export type DetentMeta = {
  label: string;
  description: string;
};

export type EffectInfo = {
  mode: Mode;
  detent: number;
  model: string;
  inspiration: string;
  description: string;
  tweak: {
    ccw: string;
    cw: string;
  };
};

export const knobBehavior = {
  dragPixelsPerDetent: 18,
  wheelDeltaStep: 60
};

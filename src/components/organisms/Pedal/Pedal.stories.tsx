import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import Pedal from './Pedal';
import type { EffectInfo, Mode } from '../../../data/commonParams';
import { modes } from '../../../data/commonParams';
import fullEffects from '../../../data/effects.full.json';
import { mergeEffects } from '../../../data/effects';

const merged = mergeEffects(fullEffects);
const effectsByMode = modes.reduce<Record<Mode, EffectInfo[]>>(
  (acc, mode) => ({
    ...acc,
    [mode]: merged.filter((effect) => effect.mode === mode)
  }),
  {
    'MkII Delay': [],
    'Legacy Delay': [],
    'Secret Reverb': []
  }
);

const getEffect = (mode: Mode, detent: number) =>
  effectsByMode[mode].find((effect) => effect.detent === detent);

const meta: Meta<typeof Pedal> = {
  title: 'Organisms/Pedal',
  component: Pedal,
  tags: ['autodocs'],
  parameters: {
    controls: { hideNoControlsWarning: true }
  }
};

export default meta;

type Story = StoryObj<typeof Pedal>;

export const InteractivePedal: Story = {
  render: () => {
    const [mode, setMode] = useState<Mode>(modes[0]);
    const [detent, setDetent] = useState(0);

    const currentEffect = useMemo<EffectInfo | undefined>(
      () => getEffect(mode, detent),
      [mode, detent]
    );

    return (
      <Pedal
        mode={mode}
        detent={detent}
        currentEffect={currentEffect}
        onModeChange={(next) => {
          setMode(next);
          setDetent(0);
        }}
        onDetentChange={setDetent}
      />
    );
  }
};

export const WithoutCurrentEffect: Story = {
  args: {
    mode: modes[0],
    detent: 0,
    onModeChange: () => {},
    onDetentChange: () => {},
    currentEffect: undefined
  }
};

export const EmptyState: Story = {
  args: {
    mode: modes[0],
    detent: 0,
    onModeChange: () => {},
    onDetentChange: () => {},
    currentEffect: undefined
  }
};

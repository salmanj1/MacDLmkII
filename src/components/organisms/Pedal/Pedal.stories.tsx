import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import Pedal from './Pedal';
import type { EffectInfo, Mode } from '../../../data/commonParams';
import { modes } from '../../../data/commonParams';

const baseEffect: EffectInfo = {
  id: 'pedal-demo',
  mode: 'MkII Delay',
  detent: 0,
  selectorIndex: 0,
  model: 'Vintage Digital',
  inspiration: '90s rack units',
  description: 'Bright, precise repeats with gentle high-end roll-off.',
  tweak: {
    label: 'Mod Rate',
    behaviorCCW: 'Slows modulation',
    behaviorCW: 'Speeds modulation'
  },
  tweez: {
    label: 'Mod Depth',
    behaviorCCW: 'Light wobble',
    behaviorCW: 'Deep wobble'
  },
  rangeNote: 'Bit Depth 6–24 bit; Sample Rate 8–48 kHz; modulation depth via Tweez.',
  tweakRange: 'Bit Depth 6–24 bit; Sample Rate 8–48 kHz.',
  tweezRange: 'Modulation depth via Tweez.',
  notes: ['Tap tempo friendly', 'Keeps articulation intact']
};

const meta: Meta<typeof Pedal> = {
  title: 'Organisms/Pedal',
  component: Pedal,
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof Pedal>;

export const InteractivePedal: Story = {
  render: () => {
    const [mode, setMode] = useState<Mode>(modes[0]);
    const [detent, setDetent] = useState(1);

    const currentEffect = useMemo<EffectInfo>(() => {
      const label = `Model ${detent + 1}`;
      return {
        ...baseEffect,
        mode,
        detent,
        selectorIndex: detent,
        model: `${baseEffect.model} ${detent + 1}`,
        inspiration: `${baseEffect.inspiration} (${label})`
      };
    }, [detent, mode]);

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

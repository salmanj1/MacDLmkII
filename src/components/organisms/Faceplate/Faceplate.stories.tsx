import type { Meta, StoryObj } from '@storybook/react';
import { useMemo, useState } from 'react';
import Faceplate from './Faceplate';
import type { EffectInfo, Mode } from '../../../data/commonParams';
import { modes } from '../../../data/commonParams';

const baseEffect: EffectInfo = {
  id: 'faceplate-demo',
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
  rangeNote: '10ms–1s',
  notes: ['Tap tempo friendly', 'Keeps articulation intact']
};

const meta: Meta<typeof Faceplate> = {
  title: 'Organisms/Faceplate',
  component: Faceplate,
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof Faceplate>;

export const InteractiveFaceplate: Story = {
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
      <Faceplate
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
    onDetentChange: () => {}
  }
};

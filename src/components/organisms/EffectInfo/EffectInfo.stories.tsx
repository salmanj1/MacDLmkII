import type { Meta, StoryObj } from '@storybook/react';
import EffectInfo from './EffectInfo';
import type { EffectInfo as EffectInfoType } from '../../../data/commonParams';

const sampleEffect: EffectInfoType = {
  id: 'sample',
  mode: 'MkII Delay',
  detent: 1,
  selectorIndex: 1,
  model: 'Vintage Digital',
  inspiration: '90s rack units',
  description:
    'Bright, precise repeats with a gentle roll-off that mirrors early digital delays. Great for rhythmic parts.',
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
  notes: ['Syncs well with tap tempo', 'Keeps articulation intact']
};

const meta: Meta<typeof EffectInfo> = {
  title: 'Organisms/EffectInfo',
  component: EffectInfo,
  tags: ['autodocs'],
  args: {
    effect: sampleEffect
  }
};

export default meta;

type Story = StoryObj<typeof EffectInfo>;

export const WithSelection: Story = {};

export const EmptyState: Story = {
  args: { effect: undefined }
};

export const Loading: Story = {
  args: { loading: true, effect: undefined }
};

export const MissingFields: Story = {
  args: {
    effect: {
      ...sampleEffect,
      inspiration: 'Not specified in manual',
      description: 'Not specified in manual',
      rangeNote: 'Not specified in manual',
      tweak: { label: 'Mod Rate', behaviorCCW: 'Not specified in manual', behaviorCW: 'Not specified in manual' },
      tweez: { label: 'Mod Depth', behaviorCCW: 'Not specified in manual', behaviorCW: 'Not specified in manual' },
      notes: ['Not specified in manual']
    }
  }
};

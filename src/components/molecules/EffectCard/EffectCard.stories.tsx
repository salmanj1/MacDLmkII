import type { Meta, StoryObj } from '@storybook/react-vite';
import EffectCard from './EffectCard';
import type { EffectInfo } from '../../../data/commonParams';

const demoEffect: EffectInfo = {
  id: 'demo',
  mode: 'MkII Delay',
  detent: 0,
  selectorIndex: 0,
  model: 'Vintage Digital',
  inspiration: '90s rack units',
  description: 'Bright, precise repeats with gentle high-end roll-off.',
  tweak: {
    label: 'Bit Depth & Sample Rate',
    behaviorCCW: 'Lower Bit Depth & Sample Rate',
    behaviorCW: 'Higher Bit Depth & Sample Rate'
  },
  tweez: {
    label: 'Mod Depth',
    behaviorCCW: 'Lower Mod Depth',
    behaviorCW: 'Higher Mod Depth'
  },
  rangeNote: 'Bit Depth 6–24 bit; Sample Rate 8–48 kHz; modulation depth via Tweez.',
  tweakRange: 'Bit Depth 6–24 bit; Sample Rate 8–48 kHz.',
  tweezRange: 'Modulation depth via Tweez.',
  notes: ['Tap tempo friendly']
};

const meta: Meta<typeof EffectCard> = {
  title: 'Molecules/EffectCard',
  component: EffectCard,
  args: {
    effect: demoEffect,
    mode: 'MkII Delay',
    currentDetent: 0,
    onSelect: () => {}
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof EffectCard>;

export const Default: Story = {};

export const Inactive: Story = {
  args: {
    currentDetent: 2
  }
};

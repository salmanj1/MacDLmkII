import type { Meta, StoryObj } from '@storybook/react-vite';
import EffectCard from './EffectCard';
import type { EffectInfo } from '../../../data/commonParams';
import fullEffects from '../../../data/effects.full.json';
import { mergeEffects } from '../../../data/effects';

const merged = mergeEffects(fullEffects);
const primaryEffect: EffectInfo | undefined = merged.find(
  (effect) => effect.mode === 'MkII Delay' && effect.detent === 0
);
const altEffect: EffectInfo | undefined = merged.find(
  (effect) => effect.mode === 'MkII Delay' && effect.detent === 3
);

const meta: Meta<typeof EffectCard> = {
  title: 'Molecules/EffectCard',
  component: EffectCard,
  args: {
    effect: primaryEffect ?? merged[0],
    mode: primaryEffect?.mode ?? 'MkII Delay',
    currentDetent: primaryEffect?.detent ?? 0,
    onSelect: () => {}
  },
  tags: ['autodocs'],
  parameters: {
    controls: { hideNoControlsWarning: true }
  }
};

export default meta;

type Story = StoryObj<typeof EffectCard>;

export const Default: Story = {};

export const Inactive: Story = {
  args: {
    effect: altEffect ?? merged[1],
    currentDetent: 0
  }
};

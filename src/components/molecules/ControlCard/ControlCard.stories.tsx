import type { Meta, StoryObj } from '@storybook/react-vite';
import ControlCard from './ControlCard';
import type { EffectInfo } from '../../../data/commonParams';
import fullEffects from '../../../data/effects.full.json';
import { mergeEffects } from '../../../data/effects';

const merged = mergeEffects(fullEffects);
const primaryEffect: EffectInfo | undefined = merged.find(
  (effect) => effect.model === 'VINTAGE DIGITAL'
);

const meta: Meta<typeof ControlCard> = {
  title: 'Molecules/ControlCard',
  component: ControlCard,
  args: {
    title: primaryEffect?.tweak.label ?? 'Tweak',
    label: primaryEffect?.tweak.label ?? 'Bit Depth & Sample Rate',
    range: primaryEffect?.tweakRange ?? 'Bit Depth 6–24 bit; Sample Rate 8–48 kHz.',
    behaviorCCW:
      primaryEffect?.tweak.behaviorCCW ?? 'Lower Bit Depth & Sample Rate',
    behaviorCW:
      primaryEffect?.tweak.behaviorCW ?? 'Higher Bit Depth & Sample Rate'
  },
  tags: ['autodocs'],
  parameters: {
    controls: { hideNoControlsWarning: true }
  }
};

export default meta;

type Story = StoryObj<typeof ControlCard>;

export const Default: Story = {};

export const Tweez: Story = {
  args: primaryEffect
    ? {
        title: 'Tweez',
        label: primaryEffect.tweez.label,
        range: primaryEffect.tweezRange,
        behaviorCCW: primaryEffect.tweez.behaviorCCW,
        behaviorCW: primaryEffect.tweez.behaviorCW
      }
    : {}
};

export const WithoutRange: Story = {
  args: {
    range: undefined
  }
};

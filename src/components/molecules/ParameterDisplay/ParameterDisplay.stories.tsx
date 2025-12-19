import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import ParameterDisplay from './ParameterDisplay';

const meta: Meta<typeof ParameterDisplay> = {
  title: 'Molecules/ParameterDisplay',
  component: ParameterDisplay,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'User-facing Parameters panel that mirrors knob values, labels, and inspiration/notes. Changing sliders sends the same updates as turning the pedal knobs.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof ParameterDisplay>;

export const DelayAndReverb: Story = {
  render: () => {
    const delayValues = {
      time: 64,
      repeats: 64,
      tweak: 48,
      tweez: 80,
      mix: 64
    };
    const reverbValues = {
      decay: 70,
      tweak: 32,
      tweez: 0,
      mix: 64,
      routing: 0
    };

    // In Storybook we don’t wire MIDI; this is a static preview for PMs/UX.
    return (
      <ParameterDisplay
        mode="MkII Delay"
        modelName="Vintage Digital"
        values={delayValues}
        delayDescription="Line 6 early-digital rack flavor with bit depth and sample-rate controls."
        delayInspiration="Line 6 original"
        reverbModelName="Room"
        reverbValues={reverbValues}
        reverbDescription="Line 6 original small room."
        reverbInspiration="Line 6 original"
        reverbNotes="Pre-delay on Tweak, Routing on Tweez."
        onDelayChange={() => {}}
        onReverbChange={() => {}}
      />
    );
  }
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import ControlCard from './ControlCard';

const meta: Meta<typeof ControlCard> = {
  title: 'Molecules/ControlCard',
  component: ControlCard,
  args: {
    title: 'Tweak',
    label: 'Bit Depth & Sample Rate',
    range: 'Bit Depth 6–24 bit; Sample Rate 8–48 kHz.',
    behaviorCCW: 'Lower Bit Depth & Sample Rate',
    behaviorCW: 'Higher Bit Depth & Sample Rate'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof ControlCard>;

export const Default: Story = {};

export const WithoutRange: Story = {
  args: {
    range: undefined
  }
};

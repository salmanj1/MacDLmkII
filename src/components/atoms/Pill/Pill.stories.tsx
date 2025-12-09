import type { Meta, StoryObj } from '@storybook/react-vite';
import Pill from './Pill';

const meta: Meta<typeof Pill> = {
  title: 'Atoms/Pill',
  component: Pill,
  tags: ['autodocs'],
  args: {
    children: 'DL4 MkII'
  }
};

export default meta;

type Story = StoryObj<typeof Pill>;

export const Glow: Story = {
  args: {
    tone: 'glow'
  }
};

export const Muted: Story = {
  args: {
    tone: 'muted',
    children: 'Selector #4'
  }
};

export const Inverse: Story = {
  args: {
    tone: 'inverse',
    children: 'Pedal faceplate view'
  }
};

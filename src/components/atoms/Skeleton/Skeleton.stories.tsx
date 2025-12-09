import type { Meta, StoryObj } from '@storybook/react-vite';
import Skeleton from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Atoms/Skeleton',
  component: Skeleton,
  args: {
    width: '160px',
    height: '20px',
    rounded: false
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {};

export const Rounded: Story = {
  args: {
    rounded: true,
    width: '80px',
    height: '80px'
  }
};

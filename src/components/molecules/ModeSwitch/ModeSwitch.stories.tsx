import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import ModeSwitch from './ModeSwitch';
import type { Mode } from '../../../data/commonParams';
import { modes } from '../../../data/commonParams';

const meta: Meta<typeof ModeSwitch> = {
  title: 'Molecules/ModeSwitch',
  component: ModeSwitch,
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof ModeSwitch>;

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<Mode>(modes[0]);
    return <ModeSwitch value={value} onChange={setValue} />;
  }
};

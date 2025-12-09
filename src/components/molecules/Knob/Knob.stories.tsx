import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import Knob from './Knob';
import type { Mode } from '../../../data/commonParams';
import { modes } from '../../../data/commonParams';

const meta: Meta<typeof Knob> = {
  title: 'Molecules/Knob',
  component: Knob,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered'
  }
};

export default meta;

type Story = StoryObj<typeof Knob>;

export const DetentSelector: Story = {
  render: () => {
    const [mode] = useState<Mode>(modes[0]);
    const [detent, setDetent] = useState(0);
    return <Knob mode={mode} detent={detent} onDetentChange={setDetent} />;
  }
};

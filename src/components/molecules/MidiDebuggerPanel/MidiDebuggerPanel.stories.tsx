import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import MidiDebuggerPanel from './MidiDebuggerPanel';
import { logMidiMessage, clearMidiLog } from '../../../state/useMidiDebugger';

const meta: Meta<typeof MidiDebuggerPanel> = {
  title: 'Molecules/MidiDebuggerPanel',
  component: MidiDebuggerPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Live MIDI log for troubleshooting: filters by type/direction, copy/export lines, and clear the buffer. Intended for dev/support use.'
      }
    },
    layout: 'centered'
  }
};

export default meta;
type Story = StoryObj<typeof MidiDebuggerPanel>;

export const WithSampleLog: Story = {
  render: () => {
    useEffect(() => {
      clearMidiLog();
      logMidiMessage({
        direction: 'out',
        type: 'pc',
        summary: 'Program Change #1'
      });
      logMidiMessage({
        direction: 'out',
        type: 'cc',
        summary: 'CC 11 (Time) -> 64',
        detail: 'Delay Time set to mid'
      });
      logMidiMessage({
        direction: 'in',
        type: 'cc',
        summary: 'CC 64 (Tap) -> 127',
        detail: 'Tap tempo received'
      });
      logMidiMessage({
        direction: 'error',
        type: 'other',
        summary: 'Port disconnected'
      });
    }, []);

    return <MidiDebuggerPanel />;
  }
};

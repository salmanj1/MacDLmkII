import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import PresetBankPanel from './PresetBankPanel';
import { presetBankActions } from '../../../state/usePresetBank';

const meta: Meta<typeof PresetBankPanel> = {
  title: 'Organisms/PresetBankPanel',
  component: PresetBankPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Full 128-slot preset bank browser. Users can search, load a slot (sends PC), save current state, import/export JSON, rename, tag, drag-to-reorder, and mark unsaved changes.'
      }
    },
    layout: 'centered'
  }
};

export default meta;
type Story = StoryObj<typeof PresetBankPanel>;

export const FewSamplePresets: Story = {
  render: () => {
    useEffect(() => {
      presetBankActions.replaceBank([
        {
          id: 0,
          name: 'Preset 1',
          tags: ['Ambient'],
          description: 'HELIOsphere delay + PLATE reverb',
          parameters: {
            delayType: 'Heliosphere',
            delayTime: 64,
            delayRepeats: 64,
            delayTweak: 48,
            delayTweez: 70,
            delayMix: 64,
            tempoBpm: 120,
            subdivision: { label: '1/4', value: 64 },
            reverbType: 'Plate',
            reverbDecay: 60,
            reverbTweak: 32,
            reverbTweez: 0,
            reverbMix: 64,
            reverbRouting: 0,
            routing: 0
          },
          lastModified: new Date().toISOString(),
          isEmpty: false,
          snapshot: {}
        },
        {
          id: 1,
          name: 'Preset 2',
          tags: ['Rhythmic'],
          description: 'ADRIATIC delay + GANYMEDE reverb',
          parameters: {
            delayType: 'Adriatic',
            delayTime: 80,
            delayRepeats: 50,
            delayTweak: 60,
            delayTweez: 40,
            delayMix: 64,
            tempoBpm: 100,
            subdivision: { label: '1/8.', value: 75 },
            reverbType: 'Ganymede',
            reverbDecay: 70,
            reverbTweak: 45,
            reverbTweez: 0,
            reverbMix: 64,
            reverbRouting: 0,
            routing: 0
          },
          lastModified: new Date().toISOString(),
          isEmpty: false,
          snapshot: {}
        }
      ]);
    }, []);

    return (
      <div style={{ width: 420 }}>
        <PresetBankPanel
          onLoad={(id) => console.log('Load preset slot', id + 1)}
          onSaveCurrent={() => console.log('Save current to selected slot')}
          presetDirty
        />
      </div>
    );
  }
};

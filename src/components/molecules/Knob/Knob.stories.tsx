import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import Knob from './Knob';
import ModeSwitch from '../ModeSwitch/ModeSwitch';
import type { EffectInfo, Mode } from '../../../data/commonParams';
import { modes } from '../../../data/commonParams';
import fullEffects from '../../../data/effects.full.json';
import { mergeEffects } from '../../../data/effects';

const meta: Meta<typeof Knob> = {
  title: 'Molecules/Knob',
  component: Knob,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: { hideNoControlsWarning: true }
  }
};

export default meta;

type Story = StoryObj<typeof Knob>;

export const DetentSelector: Story = {
  render: () => {
    const effects = useMemo(() => mergeEffects(fullEffects), []);
    const effectsByMode = useMemo(
      () =>
        modes.reduce<Record<Mode, EffectInfo[]>>(
          (acc, mode) => ({
            ...acc,
            [mode]: effects.filter((effect) => effect.mode === mode)
          }),
          {
            'MkII Delay': [],
            'Legacy Delay': [],
            'Secret Reverb': []
          }
        ),
      [effects]
    );

    const [mode, setMode] = useState<Mode>(modes[0]);
    const [detent, setDetent] = useState(0);

    const currentEffect = effectsByMode[mode].find(
      (effect) => effect.detent === detent
    );

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '32rem',
          textAlign: 'center'
        }}
      >
        <ModeSwitch value={mode} onChange={(next) => {
          setMode(next);
          setDetent(0);
        }} />
        <Knob mode={mode} detent={detent} onDetentChange={setDetent} />
        <div>
          <div style={{ fontWeight: 700 }}>
            {currentEffect?.model ?? 'Select a model'}
          </div>
          <div style={{ color: '#cbd5e1', marginTop: '0.25rem' }}>
            {currentEffect?.description ?? 'Rotate the selector to browse detents.'}
          </div>
        </div>
      </div>
    );
  }
};

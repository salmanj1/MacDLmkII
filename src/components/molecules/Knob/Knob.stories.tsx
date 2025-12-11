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
        <div
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '0.75rem',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
            color: '#e2e8f0'
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
            {currentEffect?.model ?? 'Select a model'}
          </div>
          <div style={{ color: '#cbd5e1', marginTop: '0.25rem' }}>
            {currentEffect?.description ?? 'Rotate the selector to browse detents.'}
          </div>
          <div
            style={{
              marginTop: '0.75rem',
              display: 'grid',
              gap: '0.35rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
              textAlign: 'left'
            }}
          >
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Mode</div>
              <div style={{ fontWeight: 700 }}>{mode}</div>
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Detent</div>
              <div style={{ fontWeight: 700 }}>
                {detent + 1} / {effectsByMode[mode].length}
              </div>
            </div>
            {currentEffect?.inspiration ? (
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Inspiration</div>
                <div style={{ fontWeight: 700 }}>{currentEffect.inspiration}</div>
              </div>
            ) : null}
            {currentEffect ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                  Controls
                </div>
                <div style={{ fontWeight: 700 }}>
                  Tweak: {currentEffect.tweak.label}
                </div>
                <div style={{ fontWeight: 700 }}>
                  Tweez: {currentEffect.tweez.label}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
};

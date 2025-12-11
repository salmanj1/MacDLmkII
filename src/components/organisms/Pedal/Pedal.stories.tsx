import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import Pedal from './Pedal';
import type { EffectInfo, Mode } from '../../../data/commonParams';
import { modes } from '../../../data/commonParams';
import fullEffects from '../../../data/effects.full.json';
import { mergeEffects } from '../../../data/effects';

const merged = mergeEffects(fullEffects);
const effectsByMode = modes.reduce<Record<Mode, EffectInfo[]>>(
  (acc, mode) => ({
    ...acc,
    [mode]: merged.filter((effect) => effect.mode === mode)
  }),
  {
    'MkII Delay': [],
    'Legacy Delay': [],
    'Secret Reverb': []
  }
);

const getEffect = (mode: Mode, detent: number) =>
  effectsByMode[mode].find((effect) => effect.detent === detent);

const meta: Meta<typeof Pedal> = {
  title: 'Organisms/Pedal',
  component: Pedal,
  tags: ['autodocs'],
  parameters: {
    controls: { hideNoControlsWarning: true }
  }
};

export default meta;

type Story = StoryObj<typeof Pedal>;

export const InteractivePedal: Story = {
  render: () => {
    const [mode, setMode] = useState<Mode>(modes[0]);
    const [detent, setDetent] = useState(0);

    const currentEffect = useMemo<EffectInfo | undefined>(
      () => getEffect(mode, detent),
      [mode, detent]
    );

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.25rem',
          alignItems: 'start'
        }}
      >
        <Pedal
          mode={mode}
          detent={detent}
          currentEffect={currentEffect}
          onModeChange={(next) => {
            setMode(next);
            setDetent(0);
          }}
          onDetentChange={setDetent}
        />

        <div
          style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(148, 163, 184, 0.35)',
            color: '#e2e8f0',
            boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
            position: 'sticky',
            top: '1.5rem'
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
            {currentEffect?.model ?? 'Select a model'}
          </div>
          <div style={{ color: '#cbd5e1', marginTop: '0.25rem' }}>
            {currentEffect?.description ?? 'Use the selector to browse detents.'}
          </div>
          <div
            style={{
              marginTop: '0.75rem',
              display: 'grid',
              gap: '0.35rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))'
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
          </div>
          {currentEffect ? (
            <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.35rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Controls</div>
              <div style={{ fontWeight: 700 }}>Tweak: {currentEffect.tweak.label}</div>
              <div style={{ fontWeight: 700 }}>Tweez: {currentEffect.tweez.label}</div>
              {currentEffect.rangeNote ? (
                <div style={{ color: '#cbd5e1' }}>{currentEffect.rangeNote}</div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
};

export const WithoutCurrentEffect: Story = {
  args: {
    mode: modes[0],
    detent: 0,
    onModeChange: () => {},
    onDetentChange: () => {},
    currentEffect: undefined
  }
};

export const EmptyState: Story = {
  args: {
    mode: modes[0],
    detent: 0,
    onModeChange: () => {},
    onDetentChange: () => {},
    currentEffect: undefined
  }
};

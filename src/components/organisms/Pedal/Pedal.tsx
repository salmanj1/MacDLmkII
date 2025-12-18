import { useEffect, useMemo, useRef, useState } from 'react';
import Knob from '../../molecules/Knob/Knob';
import FootswitchRail from '../../molecules/FootswitchRail/FootswitchRail';
import LinearKnob from '../../molecules/LinearKnob/LinearKnob';
import type { Mode } from '../../../data/commonParams';
import { delayControls, reverbControls } from '../../../data/midi';
import {
  altButtonPosition,
  delayKnobPositions,
  faceplateSize,
  footswitchPositions,
  reverbSelectorPosition,
  reverbKnobPositions,
  selectorPosition,
  virtualSetPosition
} from './layout';
import styles from './Pedal.module.less';

const toPercent = (pos: { x: number; y: number }) => ({
  left: `${(pos.x / faceplateSize.width) * 100}%`,
  top: `${(pos.y / faceplateSize.height) * 100}%`
});

type PedalProps = {
  mode: Mode;
  detent: number;
  reverbDetent: number;
  onModeChange: (mode: Mode) => void;
  onDetentChange: (detent: number) => void;
  onReverbDetentChange: (detent: number) => void;
  onFootswitchPress?: (id: string) => void;
  onFootswitchHold?: (id: string) => void;
  footswitchStatus?: Record<'A' | 'B' | 'C' | 'Tap' | 'Set', 'off' | 'on' | 'dim' | 'armed'>;
  onControlChange?: (id: string, value: number, domain: 'delay' | 'reverb') => void;
  controlValues?: {
    delay: Record<(typeof delayControls)[number]['id'], number>;
    reverb: Record<(typeof reverbControls)[number]['id'], number>;
  };
  controlLabels?: {
    tweak?: string;
    tweez?: string;
    reverbTweak?: string;
    routing?: string;
  };
  footswitchHints?: Record<'A' | 'B' | 'C' | 'Tap' | 'Set', string>;
  debugLayout?: boolean;
};

/**
 * Pedal surface that holds the selector knob, mode toggle, and supporting UI
 * chrome (detent window + footswitch rail).
 */
const Pedal = ({
  mode,
  detent,
  reverbDetent,
  onModeChange,
  onDetentChange,
  onReverbDetentChange,
  onFootswitchPress,
  onFootswitchHold,
  footswitchStatus,
  onControlChange,
  controlValues,
  controlLabels,
  footswitchHints,
  debugLayout = false
}: PedalProps) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [debugPositions, setDebugPositions] = useState({
    selector: selectorPosition,
    reverbSelector: reverbSelectorPosition,
    altButton: altButtonPosition,
    delay: delayKnobPositions,
    reverb: reverbKnobPositions
  });
  const [debugSizes, setDebugSizes] = useState({ alt: 32 });
  const dragRef = useRef<{
    kind: 'selector' | 'reverbSelector' | 'alt' | 'delay' | 'reverb';
    index?: number;
    startX: number;
    startY: number;
    origin: { x: number; y: number };
    originSize?: number;
  } | null>(null);

  const altActive = mode === 'Legacy Delay';

  const handleAltToggle = () => {
    if (mode === 'Secret Reverb') return;
    onModeChange(altActive ? 'MkII Delay' : 'Legacy Delay');
  };

  const footswitches = [
    {
      id: 'A',
      label: 'A',
      hint: footswitchHints?.A,
      status: footswitchStatus?.A
    },
    {
      id: 'B',
      label: 'B',
      hint: footswitchHints?.B,
      status: footswitchStatus?.B
    },
    {
      id: 'C',
      label: 'C',
      hint: footswitchHints?.C,
      status: footswitchStatus?.C
    },
    {
      id: 'Tap',
      label: 'Tap',
      hint: footswitchHints?.Tap,
      status: footswitchStatus?.Tap
    },
    {
      id: 'Set',
      label: 'Set',
      hint: footswitchHints?.Set,
      status: footswitchStatus?.Set
    }
  ];

  const footswitchPositionPercentages = [
    ...footswitchPositions.map((pos) => toPercent(pos)),
    toPercent(virtualSetPosition)
  ];

  const selectorPositionPercent = toPercent(selectorPosition);
  const altButtonPositionPercent = toPercent(altButtonPosition);
  const reverbSelectorPercent = toPercent(reverbSelectorPosition);

  return (
    <section className={styles.shell} aria-label="DL4 MkII pedal">
      <div className={styles.faceplate} aria-hidden />
      <div className={styles.overlay}>
        <div
          className={styles.selectorSlot}
          style={selectorPositionPercent}
          data-ui="selector-knob-delay"
        >
          <Knob
            mode={mode}
            detent={detent}
            onDetentChange={onDetentChange}
            showLabels={false}
          />
        </div>

        <button
          type="button"
          className={`${styles.altButton} ${altActive ? styles.altButtonActive : ''}`}
          aria-pressed={altActive}
          aria-label="Toggle legacy delay models"
          data-ui="alt-button"
          style={altButtonPositionPercent}
          onClick={handleAltToggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleAltToggle();
            }
          }}
        />

        <div
          className={styles.reverbSelectorSlot}
          style={reverbSelectorPercent}
          data-ui="selector-knob-reverb"
        >
          <Knob
            mode={'Secret Reverb'}
            detent={reverbDetent}
            onDetentChange={onReverbDetentChange}
            showLabels={false}
          />
        </div>

        <div className={styles.delayControls}>
          {delayControls.map((control, idx) => (
            <div
              key={control.id}
              className={styles.controlSlot}
              style={toPercent(delayKnobPositions[idx])}
              data-ui={`delay-control-${control.id}`}
            >
              <LinearKnob
                label={
                  control.id === 'tweak' && controlLabels?.tweak
                    ? controlLabels.tweak
                    : control.id === 'tweez' && controlLabels?.tweez
                      ? controlLabels.tweez
                      : control.label
                }
                value={controlValues?.delay?.[control.id] ?? 0}
                onChange={(value) => onControlChange?.(control.id, value, 'delay')}
              />
            </div>
          ))}
        </div>

        <div className={styles.reverbControls}>
          {reverbControls.map((control, idx) => (
            <div
              key={control.id}
              className={styles.controlSlot}
              style={toPercent(reverbKnobPositions[idx])}
              data-ui={`reverb-control-${control.id}`}
            >
              <LinearKnob
                label={
                  control.id === 'tweak' && controlLabels?.reverbTweak
                    ? controlLabels.reverbTweak
                    : control.id === 'routing' && controlLabels?.routing
                      ? controlLabels.routing
                      : control.label
                }
                value={controlValues?.reverb?.[control.id] ?? 0}
                onChange={(value) => onControlChange?.(control.id, value, 'reverb')}
              />
            </div>
          ))}
        </div>

        <div className={styles.footswitchSlot}>
          <FootswitchRail
            switches={footswitches.map((entry) => ({
              ...entry,
              onPress: onFootswitchPress,
              onHold: onFootswitchHold
            }))}
            positions={footswitchPositionPercentages}
            data-ui="footswitch-rail"
          />
        </div>
      </div>
    </section>
  );
};

export default Pedal;

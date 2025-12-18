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
import { useEffect, useMemo, useRef, useState } from 'react';

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
  const dragRef = useRef<{
    kind: 'selector' | 'reverbSelector' | 'alt' | 'delay' | 'reverb';
    index?: number;
    startX: number;
    startY: number;
    origin: { x: number; y: number };
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

  const selectorPositionPercent = toPercent(debugPositions.selector);
  const altButtonPositionPercent = toPercent(debugPositions.altButton);
  const reverbSelectorPercent = toPercent(debugPositions.reverbSelector);

  const handleDebugPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    kind: 'selector' | 'reverbSelector' | 'alt' | 'delay' | 'reverb',
    index?: number
  ) => {
    if (!debugLayout) return;
    event.preventDefault();
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      kind,
      index,
      startX: event.clientX,
      startY: event.clientY,
      origin:
        kind === 'selector'
          ? debugPositions.selector
          : kind === 'reverbSelector'
            ? debugPositions.reverbSelector
            : kind === 'alt'
              ? debugPositions.altButton
              : kind === 'delay' && typeof index === 'number'
                ? debugPositions.delay[index]
                : kind === 'reverb' && typeof index === 'number'
                  ? debugPositions.reverb[index]
                  : { x: 0, y: 0 }
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDebugPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!debugLayout) return;
    if (!dragRef.current) return;
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = faceplateSize.width / rect.width;
    const scaleY = faceplateSize.height / rect.height;
    const dx = (event.clientX - dragRef.current.startX) * scaleX;
    const dy = (event.clientY - dragRef.current.startY) * scaleY;
    const next = {
      x: Math.max(0, Math.min(faceplateSize.width, dragRef.current.origin.x + dx)),
      y: Math.max(0, Math.min(faceplateSize.height, dragRef.current.origin.y + dy))
    };
    setDebugPositions((prev) => {
      if (dragRef.current?.kind === 'selector') return { ...prev, selector: next };
      if (dragRef.current?.kind === 'reverbSelector') return { ...prev, reverbSelector: next };
      if (dragRef.current?.kind === 'alt') return { ...prev, altButton: next };
      if (dragRef.current?.kind === 'delay' && typeof dragRef.current.index === 'number') {
        const arr = [...prev.delay];
        arr[dragRef.current.index] = next;
        return { ...prev, delay: arr };
      }
      if (dragRef.current?.kind === 'reverb' && typeof dragRef.current.index === 'number') {
        const arr = [...prev.reverb];
        arr[dragRef.current.index] = next;
        return { ...prev, reverb: arr };
      }
      return prev;
    });
  };

  const handleDebugPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!debugLayout) return;
    if (dragRef.current) {
      const { kind, index } = dragRef.current;
      const current =
        kind === 'selector'
          ? debugPositions.selector
          : kind === 'reverbSelector'
            ? debugPositions.reverbSelector
            : kind === 'alt'
              ? debugPositions.altButton
              : kind === 'delay' && typeof index === 'number'
                ? debugPositions.delay[index]
                : kind === 'reverb' && typeof index === 'number'
                  ? debugPositions.reverb[index]
                  : null;
      if (current) {
        // Log a dev-friendly payload for copy/paste into layout.ts
        console.log('[layout-debug]', kind, index ?? '', {
          x: Number(current.x.toFixed(1)),
          y: Number(current.y.toFixed(1))
        });
      }
    }
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  useEffect(() => {
    setDebugPositions({
      selector: selectorPosition,
      reverbSelector: reverbSelectorPosition,
      altButton: altButtonPosition,
      delay: delayKnobPositions,
      reverb: reverbKnobPositions
    });
  }, [debugLayout]);

  return (
    <section className={styles.shell} aria-label="DL4 MkII pedal">
      <div className={styles.faceplate} aria-hidden />
      <div
        className={styles.overlay}
        ref={overlayRef}
        onPointerMove={handleDebugPointerMove}
        onPointerUp={handleDebugPointerUp}
        onPointerCancel={handleDebugPointerUp}
      >
        <div
          className={styles.selectorSlot}
          style={selectorPositionPercent}
          data-ui="selector-knob-delay"
          onPointerDown={(e) => handleDebugPointerDown(e, 'selector')}
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
          onPointerDown={(e) => handleDebugPointerDown(e, 'alt')}
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
          onPointerDown={(e) => handleDebugPointerDown(e, 'reverbSelector')}
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
              style={toPercent(debugPositions.delay[idx])}
              data-ui={`delay-control-${control.id}`}
              onPointerDown={(e) => handleDebugPointerDown(e, 'delay', idx)}
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
              style={toPercent(debugPositions.reverb[idx])}
              data-ui={`reverb-control-${control.id}`}
              onPointerDown={(e) => handleDebugPointerDown(e, 'reverb', idx)}
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

        {debugLayout && (
          <div className={styles.debugHandles}>
            <div
              className={styles.debugHandle}
              style={selectorPositionPercent}
              onPointerDown={(e) => handleDebugPointerDown(e, 'selector')}
              title="Selector"
            />
            <div
              className={styles.debugHandle}
              style={reverbSelectorPercent}
              onPointerDown={(e) => handleDebugPointerDown(e, 'reverbSelector')}
              title="Reverb selector"
            />
            <div
              className={styles.debugHandle}
              style={altButtonPositionPercent}
              onPointerDown={(e) => handleDebugPointerDown(e, 'alt')}
              title="Alt button"
            />
            {debugPositions.delay.map((pos, idx) => (
              <div
                key={`d-${idx}`}
                className={styles.debugHandle}
                style={toPercent(pos)}
                onPointerDown={(e) => handleDebugPointerDown(e, 'delay', idx)}
                title={`Delay ${delayControls[idx]?.label ?? idx + 1}`}
              />
            ))}
            {debugPositions.reverb.map((pos, idx) => (
              <div
                key={`r-${idx}`}
                className={styles.debugHandle}
                style={toPercent(pos)}
                onPointerDown={(e) => handleDebugPointerDown(e, 'reverb', idx)}
                title={`Reverb ${reverbControls[idx]?.label ?? idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Pedal;

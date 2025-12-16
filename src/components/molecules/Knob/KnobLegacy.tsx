import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Mode } from '../../../data/commonParams';
import { knobBehavior } from '../../../data/commonParams';
import { detentsByMode } from '../../../data/selectorMaps';
import styles from './KnobLegacy.module.less';

type KnobProps = {
  mode: Mode;
  detent: number;
  onDetentChange: (detent: number) => void;
};

/**
 * Interactive detent knob that mirrors the hardware feel via drag, wheel, and keyboard input.
 * Uses CSS-driven layers for the visual stack so the heavy styling stays out of JSX.
 */
const Knob = ({ mode, detent, onDetentChange }: KnobProps) => {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const wheelAccumulator = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const detents = detentsByMode[mode];
  const step = 360 / detents.length;
  const accent =
    mode === 'Legacy Delay'
      ? '#52ff6c'
      : mode === 'Secret Reverb'
        ? '#ffb347'
        : '#f1f5f9';
  const accentRgb =
    mode === 'Legacy Delay'
      ? '82, 255, 108'
      : mode === 'Secret Reverb'
        ? '255, 179, 71'
        : '241, 245, 249';

  // Clockwise order that mirrors the hardware faceplate for MkII mode.
  const labelOrderByMode: Partial<Record<Mode, string[]>> = {
    'MkII Delay': [
      'Glitch',
      'Sweep Echo',
      'Pitch Echo',
      'Reverse',
      'Drum',
      'Adriatic Delay',
      'Dynamic',
      'Cosmos',
      'Looper',
      'Vintage Digital',
      'Crisscross',
      'Euclidean',
      'Dual Delay',
      'Harmony',
      'Transistor Tape',
      'LC Digital'
    ]
  };

  const orderedLabels = labelOrderByMode[mode]?.map((label) =>
    label.toLowerCase()
  );

  const anchorIndex = detents.findIndex((entry) =>
    /looper|reverb off/i.test(entry.label)
  );
  const anchorPosition = detents.length / 2; // Puts Looper/Reverb Off at 6 o'clock when no explicit order is defined.

  const positionForIndex = (index: number) => {
    if (!orderedLabels) return index;
    const label = detents[index]?.label.toLowerCase();
    const pos = orderedLabels.indexOf(label);
    if (pos >= 0) return pos;
    if (anchorIndex >= 0) {
      return (index - anchorIndex + anchorPosition + detents.length) % detents.length;
    }
    return index;
  };

  const angleForIndex = (index: number) => {
    if (detents.length <= 1) return 0;
    const position = positionForIndex(index);
    return position * step;
  };

  const baseLabelRadius = 8.8; // rem baseline for label ring
  const labelRadiusOffset: Partial<Record<Mode, Record<string, number>>> = {
    'MkII Delay': {
      glitch: 1.6,
      'sweep echo': 1.4,
      'lc digital': 1.2,
      'pitch echo': 1.1,
      reverse: 0.9,
      drum: 0.7,
      'adriatic delay': 0.6,
      dynamic: 0.5,
      cosmos: -0.6,
      looper: -0.8,
      'vintage digital': -0.7,
      'transistor tape': 0.4,
      'dual delay': -0.3,
      crisscross: -0.4
    }
  };

  const radiusForLabel = (label: string) => {
    const offsets = labelRadiusOffset[mode];
    if (!offsets) return baseLabelRadius;
    return baseLabelRadius + (offsets[label.toLowerCase()] ?? 0);
  };

  const wrapDetent = (next: number) => {
    const len = detents.length;
    if (len === 0) return 0;
    return ((next % len) + len) % len;
  };

  const indicatorAngle = angleForIndex(detent);

  useEffect(() => {
    const positionForAngle = (clientX: number, clientY: number) => {
      const rect = frameRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const raw = Math.atan2(dy, dx) * (180 / Math.PI); // 0 at +x, CCW
      const angle = (raw + 90 + 360) % 360; // 0 at top, clockwise
      const position = Math.round(angle / step) % detents.length;
      return position;
    };

    const indexForPosition = (position: number) => {
      const target = position % detents.length;
      const match = detents.findIndex(
        (_, idx) => positionForIndex(idx) === target
      );
      return match >= 0 ? match : wrapDetent(target);
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
      const position = positionForAngle(clientX, clientY);
      if (position === null) return;
      const nextIndex = indexForPosition(position);
      onDetentChange(nextIndex);
    };

    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      handlePointerMove(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!event.touches.length) return;
      event.preventDefault();
      handlePointerMove(event.touches[0].clientX, event.touches[0].clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchcancel', handleMouseUp);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
      window.addEventListener('touchcancel', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchcancel', handleMouseUp);
    };
  }, [isDragging, mode, onDetentChange]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    if (!touch) return;
    setIsDragging(true);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    wheelAccumulator.current += event.deltaY;

    const threshold = knobBehavior.wheelDeltaStep;
    let nextDetent = detent;

    while (Math.abs(wheelAccumulator.current) >= threshold) {
      const direction = wheelAccumulator.current > 0 ? -1 : 1;
      nextDetent = wrapDetent(nextDetent + direction);
      wheelAccumulator.current -=
        threshold * Math.sign(wheelAccumulator.current);
    }

    if (nextDetent !== detent) onDetentChange(nextDetent);
  };

  const renderTicks = () => {
    return detents.map((_, idx) => {
      const angle = angleForIndex(idx);
      const isActive = idx === detent;
      return (
        <button
          type="button"
          key={idx}
          className={`${styles.tick} ${isActive ? styles.tickActive : ''}`}
          style={{ transform: `rotate(${angle}deg) translateY(-5rem)` }}
          onClick={() => onDetentChange(idx)}
          aria-label={`Jump to detent ${idx + 1}`}
        />
      );
    });
  };

  const renderLabels = () => {
    return detents.map((entry, idx) => {
      const angle = angleForIndex(idx);
      const isActive = idx === detent;

      return (
        <div
          key={entry.label}
          className={styles.labelAnchor}
          style={{
            transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radiusForLabel(entry.label)}rem) rotate(${-angle}deg)`
          }}
        >
          <span
            className={`${styles.labelText} ${isActive ? styles.labelTextActive : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => onDetentChange(idx)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onDetentChange(idx);
              }
            }}
            aria-label={`Jump to ${entry.label}`}
          >
            {entry.label}
          </span>
        </div>
      );
    });
  };

  const detentMeta = detents[detent];

  return (
    <div
      className={styles.wrapper}
      style={
        {
          '--knob-accent': accent,
          '--knob-accent-rgb': accentRgb,
          '--knob-label-color': accent,
          '--knob-label-color-active': accent
        } as React.CSSProperties
      }
      ref={frameRef}
    >
      <div
        className={styles.dialFrame}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className={styles.labelsLayer}>{renderLabels()}</div>

        <div
          role="slider"
          aria-label="Detent selector"
          aria-valuemin={0}
          aria-valuemax={detents.length - 1}
          aria-valuenow={detent}
          tabIndex={0}
          onTouchStart={handleTouchStart}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
              event.preventDefault();
              onDetentChange(wrapDetent(detent - 1));
            }
            if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
              event.preventDefault();
              onDetentChange(wrapDetent(detent + 1));
            }
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          className={`${styles.dial} ${isDragging ? styles.dialDragging : ''}`}
        >
          <div className={styles.dialHalo} />
          <div className={styles.dialBase} />
          <div className={styles.dialRing} />
          <div className={styles.dialSurface} />
          <div className={styles.dialSheen} />

          <div
            className={styles.indicatorLayer}
            style={{ transform: `rotate(${indicatorAngle}deg)` }}
          >
            <div className={styles.indicatorStack}>
              <div className={styles.indicatorBody} />
              <div className={styles.indicatorStem} />
            </div>
          </div>

          <div className={styles.indicatorLayer}>{renderTicks()}</div>
          <div className={styles.topMarker} />
        </div>
      </div>
      <div className={styles.detentCopy}>
        <div className={styles.detentTitle}>{detentMeta.label}</div>
        <div>{detentMeta.description}</div>
      </div>
    </div>
  );
};

export default Knob;

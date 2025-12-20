import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { defaultRoutingValue, normalizeRoutingValue, routingOptions } from '../../../data/routing';
import knobStyles from '../LinearKnob/LinearKnob.module.less';
import styles from './RoutingSelector.module.less';

type RoutingSelectorProps = {
  value: number;
  label?: string;
  onChange: (next: number) => void;
};

const knobAngles = [-90, 0, 90] as const;

const wrapIndex = (idx: number, length: number) => ((idx % length) + length) % length;

const angleDifference = (a: number, b: number) => {
  const diff = ((a - b + 540) % 360) - 180;
  return Math.abs(diff);
};

const RoutingSelector = ({ value, label = 'Routing', onChange }: RoutingSelectorProps) => {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const normalizedValue = useMemo(() => normalizeRoutingValue(value ?? defaultRoutingValue), [value]);
  const activeIndex = useMemo(() => {
    const found = routingOptions.findIndex((option) => option.value === normalizedValue);
    if (found >= 0) return found;
    return routingOptions.findIndex((option) => option.value === defaultRoutingValue);
  }, [normalizedValue]);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  const selectIndex = useCallback(
    (idx: number) => {
      const next = routingOptions[wrapIndex(idx, routingOptions.length)];
      onChange(next.value);
    },
    [onChange]
  );

  const selectByAngle = useCallback(
    (angle: number | null) => {
      if (angle === null) return;
      let closestIndex = 0;
      let bestDiff = Number.POSITIVE_INFINITY;
      knobAngles.forEach((target, idx) => {
        const diff = angleDifference(angle, target);
        if (diff < bestDiff) {
          bestDiff = diff;
          closestIndex = idx;
        }
      });
      selectIndex(closestIndex);
    },
    [selectIndex]
  );

  const pointerAngle = useCallback(
    (clientX: number, clientY: number) => {
      const rect = frameRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const raw = Math.atan2(dy, dx) * (180 / Math.PI); // -180..180, 0 at +x
      const fromTop = (raw + 90 + 360) % 360; // 0 at top, clockwise
      return fromTop > 180 ? fromTop - 360 : fromTop; // convert to -180..180 for simpler comparison
    },
    []
  );

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      selectByAngle(pointerAngle(event.clientX, event.clientY));
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, pointerAngle, selectByAngle]);

  const angle = knobAngles[safeIndex] ?? 0;
  const knobStyle: React.CSSProperties = { '--knob-angle': `${angle}deg` } as React.CSSProperties;
  const activeLabel = routingOptions[safeIndex]?.label ?? 'Parallel';

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    selectIndex(safeIndex + direction);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    selectByAngle(pointerAngle(event.clientX, event.clientY));
    setIsDragging(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      selectIndex(safeIndex - 1);
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectIndex(safeIndex + 1);
    }
  };

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.knob} ${knobStyles.knob}`}
        style={knobStyle}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={routingOptions.length - 1}
        aria-valuenow={safeIndex}
        aria-valuetext={activeLabel}
        tabIndex={0}
        data-ui="routing-knob"
      >
        <div className={knobStyles.cap} ref={frameRef}>
          <div className={knobStyles.capGraphic}>
            <div className={knobStyles.capFace} />
            <div className={knobStyles.capSheen} />
            <div className={knobStyles.capIndicator} />
          </div>
        </div>

        <div className={styles.legend} aria-hidden>
          {routingOptions.map((option, idx) => {
            const isActive = idx === safeIndex;
            return (
              <span
                key={option.value}
                className={`${styles.legendItem} ${isActive ? styles.legendItemActive : ''}`}
              >
                {option.label}
              </span>
            );
          })}
        </div>
      </div>
      <div className={`${knobStyles.label} ${styles.label}`}>{label}</div>
    </div>
  );
};

export default RoutingSelector;

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Mode } from '../../../data/commonParams';
import { clampDetent, detentsByMode } from '../../../data/selectorMaps';
import { knobBehavior } from '../../../data/commonParams';
import styles from './Knob.module.less';

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
  const dragStart = useRef<{ y: number; detent: number } | null>(null);
  const wheelAccumulator = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const detents = detentsByMode[mode];
  const angleForIndex = (index: number) => {
    if (detents.length <= 1) return -135;
    return index * (270 / (detents.length - 1)) - 135;
  };

  const indicatorAngle = angleForIndex(detent);

  useEffect(() => {
    const handlePointerMove = (clientY: number) => {
      if (!dragStart.current) return;
      const delta = dragStart.current.y - clientY;
      const steps = Math.round(delta / knobBehavior.dragPixelsPerDetent);
      const next = clampDetent(mode, dragStart.current.detent + steps);
      onDetentChange(next);
    };

    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      handlePointerMove(event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!event.touches.length) return;
      event.preventDefault();
      handlePointerMove(event.touches[0].clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStart.current = null;
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
    event.preventDefault();
    dragStart.current = { y: event.clientY, detent };
    setIsDragging(true);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    if (!touch) return;
    dragStart.current = { y: touch.clientY, detent };
    setIsDragging(true);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    wheelAccumulator.current += event.deltaY;

    const threshold = knobBehavior.wheelDeltaStep;
    let nextDetent = detent;

    while (Math.abs(wheelAccumulator.current) >= threshold) {
      const direction = wheelAccumulator.current > 0 ? -1 : 1;
      nextDetent = clampDetent(mode, nextDetent + direction);
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
        <div
          key={idx}
          className={`${styles.tick} ${isActive ? styles.tickActive : ''}`}
          style={{ transform: `rotate(${angle}deg) translateY(-4.3rem)` }}
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
            transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-6.2rem) rotate(${-angle}deg)`
          }}
        >
          <span
            className={`${styles.labelDot} ${isActive ? styles.labelDotActive : ''}`}
          />
          <span
            className={`${styles.labelText} ${isActive ? styles.labelTextActive : ''}`}
          >
            {entry.label}
          </span>
        </div>
      );
    });
  };

  const detentMeta = detents[detent];

  return (
    <div className={styles.wrapper}>
      <div className={styles.dialFrame}>
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
              onDetentChange(clampDetent(mode, detent - 1));
            }
            if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
              event.preventDefault();
              onDetentChange(clampDetent(mode, detent + 1));
            }
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          className={`${styles.dial} ${isDragging ? styles.dialDragging : ''}`}
        >
          <div className={styles.dialBase} />
          <div className={styles.dialRing} />
          <div className={styles.dialSurface} />
          <div className={styles.dialMetal} />
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

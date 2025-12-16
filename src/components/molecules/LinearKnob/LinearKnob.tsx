import { useCallback, useRef } from 'react';
import type { CSSProperties } from 'react';
import styles from './LinearKnob.module.less';

type LinearKnobProps = {
  label: string;
  value: number;
  onChange: (next: number) => void;
};

/**
 * Simple vertical drag/wheel control styled to sit over the DL4 faceplate positions.
 * Values are clamped 0-127 to align with MIDI CC range.
 */
const LinearKnob = ({ label, value, onChange }: LinearKnobProps) => {
  const clamp = useCallback((next: number) => Math.max(0, Math.min(127, next)), []);
  const dragStart = useRef<{ y: number; value: number } | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const angle = (value / 127) * 280 - 140; // map CC range to a readable sweep
  const knobStyle: CSSProperties = { '--knob-angle': `${angle}deg` } as CSSProperties;

  const commit = (next: number) => onChange(clamp(next));

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -2 : 2;
    commit(value + delta);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragStart.current = { y: event.clientY, value };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  const angleToValue = (clientX: number, clientY: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const raw = Math.atan2(dy, dx) * (180 / Math.PI); // -180..180, 0 at +x
    const fromTop = (raw + 90 + 360) % 360; // 0 at top, clockwise

    const sweepStart = 220; // -140 deg from top
    const sweep = 280;
    const offset = (fromTop - sweepStart + 360) % 360;
    if (offset > sweep) return null; // outside sweep
    return (offset / sweep) * 127;
  };

  const handlePointerMove = (event: PointerEvent) => {
    const mapped = angleToValue(event.clientX, event.clientY);
    if (mapped === null) return;
    commit(mapped);
  };

  const handlePointerUp = () => {
    dragStart.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointercancel', handlePointerUp);
  };

  return (
    <div
      className={styles.knob}
      style={knobStyle}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={127}
      aria-valuenow={value}
      aria-label={label}
    >
      <div className={styles.cap} ref={frameRef}>
        <div className={styles.capGraphic}>
          <div className={styles.capFace} />
          <div className={styles.capSheen} />
          <div className={styles.capIndicator} />
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={127}
        value={value}
        className={styles.range}
        onChange={(event) => onChange(clamp(Number(event.target.value)))}
        onPointerDown={handlePointerDown}
      />
      <div className={styles.label}>{label}</div>
    </div>
  );
};

export default LinearKnob;

import { useRef } from 'react';
import styles from './FootswitchRail.module.less';

type FootswitchStatus = 'off' | 'on' | 'dim' | 'armed';

type FootswitchConfig = {
  id: string;
  label: string;
  hint: string;
  status?: FootswitchStatus;
  onPress?: (id: string) => void;
  onHold?: (id: string) => void;
};

type FootswitchRailProps = {
  switches: FootswitchConfig[];
  positions?: { left: string; top: string }[];
};

/**
 * Visual-only representation of the DL4 footswitch row so the layout mirrors the pedal.
 * The data driven approach keeps the component small and reusable while leaving room
 * for future interactive behavior if needed.
 */
const FootswitchRail = ({ switches, positions }: FootswitchRailProps) => {
  const holdTimersRef = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const holdTriggeredRef = useRef<Record<string, boolean>>({});
  const HOLD_DELAY_MS = 2000;

  return (
    <div className={styles.rail}>
      <div className={`${styles.grid} ${positions ? styles.gridAbsolute : ''}`}>
        {switches.map((sw, idx) => {
          const status = sw.status ?? 'off';
          const pos = positions?.[idx];
          return (
            <div
              key={sw.label}
              className={`${styles.cell} ${pos ? styles.cellAbsolute : ''}`}
              style={pos ? { left: pos.left, top: pos.top } : undefined}
            >
              <button
                type="button"
                className={`${styles.footswitch} ${styles[`status_${status}`] ?? ''}`}
                aria-label={`${sw.label} footswitch`}
                onPointerDown={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId) === false) {
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }
                  if (!sw.onHold || status !== 'on') return;
                  const existing = holdTimersRef.current[sw.id];
                  if (existing) clearTimeout(existing);
                  holdTimersRef.current[sw.id] = setTimeout(() => {
                    holdTriggeredRef.current[sw.id] = true;
                    sw.onHold?.(sw.id);
                  }, HOLD_DELAY_MS);
                }}
                onPointerUp={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                  const timer = holdTimersRef.current[sw.id];
                  if (timer) clearTimeout(timer);
                  holdTimersRef.current[sw.id] = null;
                }}
                onPointerCancel={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                  const timer = holdTimersRef.current[sw.id];
                  if (timer) clearTimeout(timer);
                  holdTimersRef.current[sw.id] = null;
                }}
                onClick={() => {
                  if (holdTriggeredRef.current[sw.id]) {
                    holdTriggeredRef.current[sw.id] = false;
                    return;
                  }
                  sw.onPress?.(sw.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    sw.onPress?.(sw.id);
                  }
                }}
              />
              <span className={styles.label}>{sw.label}</span>
              {sw.hint && <span className={styles.hint}>{sw.hint}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FootswitchRail;

import styles from './FootswitchRail.module.less';

type FootswitchStatus = 'off' | 'on' | 'dim' | 'armed';

type FootswitchConfig = {
  id: string;
  label: string;
  hint: string;
  status?: FootswitchStatus;
  onPress?: (id: string) => void;
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
                onClick={() => sw.onPress?.(sw.id)}
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

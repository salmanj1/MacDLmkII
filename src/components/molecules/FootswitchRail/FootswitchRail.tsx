import styles from './FootswitchRail.module.less';

type FootswitchRailProps = {
  switches: { label: string; hint: string }[];
};

/**
 * Visual-only representation of the DL4 footswitch row so the layout mirrors the pedal.
 * The data driven approach keeps the component small and reusable while leaving room
 * for future interactive behavior if needed.
 */
const FootswitchRail = ({ switches }: FootswitchRailProps) => {
  return (
    <div className={styles.rail}>
      <div className={styles.railHeader}>
        <span>Footswitch Rail</span>
        <span className={styles.railBadge}>Visual only</span>
      </div>
      <div className={styles.grid}>
        {switches.map((sw) => (
          <div key={sw.label} className={styles.cell}>
            <button type="button" className={styles.footswitch} aria-label={`${sw.label} footswitch`} />
            <span className={styles.label}>{sw.label}</span>
            <span className={styles.hint}>{sw.hint}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FootswitchRail;

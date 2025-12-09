import styles from './ControlCard.module.less';

type ControlCardProps = {
  title: string;
  label: string;
  range?: string;
  behaviorCCW: string;
  behaviorCW: string;
};

/**
 * Reusable knob readout card: title/label, optional range, and CW/CCW behaviors.
 */
const ControlCard = ({
  title,
  label,
  range,
  behaviorCCW,
  behaviorCW
}: ControlCardProps) => {
  const showRange = !!range && range !== 'Range not listed in the manual';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.label}>{label}</div>
      </div>
      {showRange && (
        <div className={styles.rangeRow}>
          <div className={styles.rangeLabel}>Range</div>
          <div className={styles.rangeValue}>{range}</div>
        </div>
      )}
      <div className={styles.behaviorGrid}>
        <div className={styles.behaviorCell}>
          <span className={styles.behaviorLabel}>CCW</span>
          <div className={styles.behaviorValue}>{behaviorCCW}</div>
        </div>
        <div className={styles.behaviorCell}>
          <span className={styles.behaviorLabel}>CW</span>
          <div className={styles.behaviorValue}>{behaviorCW}</div>
        </div>
      </div>
    </div>
  );
};

export default ControlCard;

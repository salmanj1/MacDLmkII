import type { EffectInfo } from '../../../data/commonParams';
import styles from './DetentWindow.module.less';

type DetentWindowProps = {
  effect?: EffectInfo;
};

/**
 * Compact summary strip that mirrors the DL4 detent window: shows the active model,
 * inspiration, range, and both knob labels so the user can scan quickly without
 * opening the full detail pane.
 */
const DetentWindow = ({ effect }: DetentWindowProps) => {
  return (
    <div className={styles.window} aria-live="polite">
      <div className={styles.header}>
        <span>Detent Window</span>
        <span className={styles.pill}>
          {effect ? effect.model : 'No model'}
        </span>
      </div>
      <div className={styles.grid}>
        <div className={styles.cell}>
          <div className={styles.label}>Inspiration</div>
          <div className={styles.value}>{effect?.inspiration ?? '–'}</div>
        </div>
        <div className={styles.cell}>
          <div className={styles.label}>Range</div>
          <div className={styles.value}>{effect?.rangeNote ?? '–'}</div>
        </div>
        <div className={styles.cell}>
          <div className={styles.label}>Tweak</div>
          <div className={styles.value}>{effect?.tweak.label ?? '–'}</div>
        </div>
        <div className={styles.cell}>
          <div className={styles.label}>Tweez</div>
          <div className={styles.value}>{effect?.tweez.label ?? '–'}</div>
        </div>
      </div>
    </div>
  );
};

export default DetentWindow;

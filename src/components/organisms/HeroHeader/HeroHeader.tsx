import Pill from '../../atoms/Pill/Pill';
import styles from './HeroHeader.module.less';

type HeroHeaderProps = {
  showQa: boolean;
  onToggleQa: () => void;
};

/**
 * Top-of-page messaging plus QA toggle control. Keeps copy and metadata grouped so
 * the rest of the layout can focus purely on the pedal visualization.
 */
const HeroHeader = ({ showQa, onToggleQa }: HeroHeaderProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.copy}>
        <div className={styles.pillRow}>
          <Pill tone="glow">DL4 MkII Brain</Pill>
          <Pill tone="inverse">Pedal faceplate view</Pill>
        </div>
        <h1 className={styles.title}>Twist the selector, stomp the row — just like the green box.</h1>
        <p className={styles.lede}>
          This layout mimics the DL4 MkII faceplate: left cluster for the model selector knob,
          center light strip for feedback, and a four-switch rail at the bottom. Use search and QA
          on the right without losing the pedal vibe.
        </p>
      </div>
      <button type="button" onClick={onToggleQa} className={styles.qaButton}>
        {showQa ? 'Hide data QA' : 'Show data QA'}
      </button>
    </header>
  );
};

export default HeroHeader;

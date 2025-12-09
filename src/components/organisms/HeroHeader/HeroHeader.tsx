import Pill from '../../atoms/Pill/Pill';
import styles from './HeroHeader.module.less';

/**
 * Top-of-page messaging that sets the vibe before the pedal takes over.
 */
const HeroHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.copy}>
        <div className={styles.pillRow}>
          <Pill tone="glow">DL4 MKII BRAIN</Pill>
          <Pill tone="inverse">PEDAL FACEPLATE VIEW</Pill>
        </div>
        <h1 className={styles.title}>
          Twist the selector, stomp the row — just like the green box.
        </h1>
        <p className={styles.lede}>
          The pedal leads the page so the hardware stays front-and-center. Below
          it you get the details, and the library tucks away until you need it.
        </p>
      </div>
    </header>
  );
};

export default HeroHeader;

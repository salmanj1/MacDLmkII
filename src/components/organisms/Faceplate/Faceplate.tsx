import Pill from '../../atoms/Pill/Pill';
import Knob from '../../molecules/Knob/Knob';
import ModeSwitch from '../../molecules/ModeSwitch/ModeSwitch';
import DetentWindow from '../../molecules/DetentWindow/DetentWindow';
import FootswitchRail from '../../molecules/FootswitchRail/FootswitchRail';
import type { EffectInfo, Mode } from '../../../data/commonParams';
import styles from './Faceplate.module.less';

type FaceplateProps = {
  mode: Mode;
  detent: number;
  currentEffect?: EffectInfo;
  onModeChange: (mode: Mode) => void;
  onDetentChange: (detent: number) => void;
};

/**
 * Pedal faceplate template that holds the selector knob, mode toggle, and supporting
 * UI chrome (detent window + footswitch rail). Built as an organism so App only
 * passes state/handlers and keeps the structure declarative.
 */
const Faceplate = ({ mode, detent, currentEffect, onModeChange, onDetentChange }: FaceplateProps) => {
  return (
    <section className={styles.shell} aria-label="DL4 MkII faceplate">
      <div className={styles.shellBackdrop} aria-hidden>
        <div className={styles.shellBorder} />
        <div className={styles.shellLine} />
        <div className={styles.shellShadow} />
        <div className={`${styles.shellPeg} ${styles.pegLeft}`} />
        <div className={`${styles.shellPeg} ${styles.pegRight}`} />
      </div>

      <div className={styles.content}>
        <div className={styles.statusBar}>
          <div className={styles.statusLeft}>
            <Pill tone="glow">Line 6 DL4 MkII</Pill>
            <Pill tone="muted">Selector {detent + 1}</Pill>
          </div>
          <div className={styles.statusLight}>
            <span className={styles.statusDot} />
            {mode}
          </div>
        </div>

        <div className={styles.panelGrid}>
          <div className={styles.modelCard}>
            <div className={styles.modelHeader}>
              <div>
                <div className={styles.modelLabel}>Model Selector</div>
                <div className={styles.modelName}>{mode}</div>
              </div>
              <span className={styles.liveBadge}>Live</span>
            </div>
            <div className={styles.selectorStack}>
              <ModeSwitch value={mode} onChange={onModeChange} />
              <Knob mode={mode} detent={detent} onDetentChange={onDetentChange} />
            </div>
          </div>

          <div className={styles.detentStack}>
            <DetentWindow effect={currentEffect} />
            <FootswitchRail
              switches={[
                { label: 'A', hint: 'Preset A' },
                { label: 'B', hint: 'Preset B' },
                { label: 'C', hint: 'Preset C' },
                { label: 'Tap', hint: 'Tempo / Loop' }
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faceplate;

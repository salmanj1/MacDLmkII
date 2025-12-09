import Knob from '../../molecules/Knob/Knob';
import ModeSwitch from '../../molecules/ModeSwitch/ModeSwitch';
import DetentWindow from '../../molecules/DetentWindow/DetentWindow';
import FootswitchRail from '../../molecules/FootswitchRail/FootswitchRail';
import type { EffectInfo, Mode } from '../../../data/commonParams';
import styles from './Pedal.module.less';

type PedalProps = {
  mode: Mode;
  detent: number;
  currentEffect?: EffectInfo;
  onModeChange: (mode: Mode) => void;
  onDetentChange: (detent: number) => void;
};

/**
 * Pedal surface that holds the selector knob, mode toggle, and supporting UI
 * chrome (detent window + footswitch rail).
 */
const Pedal = ({
  mode,
  detent,
  currentEffect,
  onModeChange,
  onDetentChange
}: PedalProps) => {
  return (
    <section className={styles.shell} aria-label="DL4 MkII pedal">
      <div className={styles.shellBackdrop} aria-hidden>
        <div className={styles.shellBorder} />
        <div className={styles.shellShadow} />
        <div className={`${styles.shellPeg} ${styles.pegLeft}`} />
        <div className={`${styles.shellPeg} ${styles.pegRight}`} />
      </div>

      <div className={styles.content}>
        <div className={styles.panelGrid}>
          <div className={styles.modelCard}>
            <div className={styles.modelHeader}>
              <div className={styles.modelLabel}>Model Selector</div>
            </div>
            <div className={styles.selectorStack}>
              <ModeSwitch value={mode} onChange={onModeChange} />
              <Knob
                mode={mode}
                detent={detent}
                onDetentChange={onDetentChange}
              />
            </div>
          </div>

          <div className={styles.detentStack}>
            <DetentWindow effect={currentEffect} />
          </div>
        </div>

        <div className={styles.footswitchRow}>
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
    </section>
  );
};

export default Pedal;

import type { EffectInfo } from '../../../data/commonParams';
import { notSpecified } from '../../../data/commonParams';
import ControlCard from '../../molecules/ControlCard/ControlCard';
import styles from './ManualPane.module.less';

type ManualPaneProps = {
  delayEffect?: EffectInfo | null;
  reverbEffect?: EffectInfo | null;
};

const Notes = ({ notes }: { notes: string[] | undefined }) => {
  if (!notes || notes.length === 0) return null;

  const usable = notes.filter((note) => note && note !== notSpecified);
  if (!usable.length) return null;

  return (
    <ul className={styles.notesList}>
      {usable.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  );
};

const EffectSection = ({
  title,
  effect
}: {
  title: string;
  effect?: EffectInfo | null;
}) => {
  if (!effect) {
    return (
      <div className={styles.sectionEmpty}>
        <div className={styles.sectionLabel}>{title}</div>
        <p>Select a model to view its manual notes.</p>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionLabel}>{title}</div>
          <div className={styles.sectionMeta}>
            {effect.mode} • Detent {effect.detent + 1}
          </div>
        </div>
        <div className={styles.modelName}>{effect.model}</div>
      </div>

      <p className={styles.inspiration}>{effect.inspiration}</p>
      <p className={styles.description}>{effect.description}</p>

      <div className={styles.controlGrid}>
        <ControlCard
          title="Tweak"
          label={effect.tweak.label}
          range={effect.tweakRange}
          behaviorCCW={effect.tweak.behaviorCCW}
          behaviorCW={effect.tweak.behaviorCW}
        />
        <ControlCard
          title="Tweez"
          label={effect.tweez.label}
          range={effect.tweezRange}
          behaviorCCW={effect.tweez.behaviorCCW}
          behaviorCW={effect.tweez.behaviorCW}
        />
      </div>

      <div className={styles.metaBlock}>
        <div className={styles.rangeNote}>
          <span className={styles.rangeLabel}>Range</span>
          <span>{effect.rangeNote}</span>
        </div>
        <Notes notes={effect.notes} />
      </div>
    </div>
  );
};

/**
 * Compact manual view for the selected delay and reverb models.
 */
const ManualPane = ({ delayEffect, reverbEffect }: ManualPaneProps) => {
  return (
    <div className={styles.pane}>
      <div className={styles.header}>
        <span className={styles.title}>Manual</span>
        <span className={styles.subtitle}>Highlights for the active models</span>
      </div>

      <EffectSection title="Delay model" effect={delayEffect} />
      <EffectSection title="Reverb model" effect={reverbEffect} />
    </div>
  );
};

export default ManualPane;

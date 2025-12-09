import type { EffectInfo } from '../../../data/commonParams';
import { notSpecified } from '../../../data/commonParams';
import styles from './DetentWindow.module.less';

type DetentWindowProps = {
  effect?: EffectInfo;
};

/**
 * Detailed detent strip that now carries the full effect readout so we keep the
 * information anchored to the pedal.
 */
const DetentWindow = ({ effect }: DetentWindowProps) => {
  if (!effect) {
    return (
      <div className={styles.window} aria-live="polite" role="status">
        <div className={styles.header}>
          <span>Detent Window</span>
          <span className={styles.modelBadge}>No model selected</span>
        </div>
        <p className={styles.emptyCopy}>
          Spin the selector or click a card to pull a model into view.
        </p>
      </div>
    );
  }

  const description =
    effect.description === notSpecified
      ? 'No description provided in the manual yet.'
      : effect.description;
  const inspiration =
    effect.inspiration === notSpecified
      ? 'Inspiration not listed'
      : effect.inspiration;
  const rangeNote =
    effect.rangeNote === notSpecified
      ? 'Range not listed in the manual'
      : effect.rangeNote;
  const notes = effect.notes.filter((note) => note !== notSpecified);

  return (
    <div className={styles.window} aria-live="polite">
      <div className={styles.header}>
        <span>Detent Window</span>
        <span className={styles.modelBadge}>{effect.model}</span>
      </div>
      <div className={styles.metaRow}>
        <div>
          <div className={styles.modelTitle}>Mode</div>
          <div className={styles.modelLine}>
            <span className={styles.pill}>{effect.mode}</span>
          </div>
          <div className={styles.inspiration}>
            Inspired by{' '}
            <span className={styles.inspirationHighlight}>{inspiration}</span>
          </div>
        </div>
        <div className={styles.rangeCard}>
          <div className={styles.rangeLabel}>Range</div>
          <div className={styles.rangeValue}>{rangeNote}</div>
        </div>
      </div>

      <p className={styles.description}>{description}</p>

      <div className={styles.controlsGrid}>
        {[
          { title: 'Tweak', data: effect.tweak },
          { title: 'Tweez', data: effect.tweez }
        ].map((entry) => (
          <div key={entry.title} className={styles.controlCard}>
            <div className={styles.controlHeader}>
              <div className={styles.controlTitle}>{entry.title}</div>
              <div className={styles.controlLabel}>{entry.data.label}</div>
            </div>
            <div className={styles.behaviorGrid}>
              <div className={styles.behaviorCell}>
                <span className={styles.behaviorLabel}>CCW</span>
                <div className={styles.behaviorValue}>
                  {entry.data.behaviorCCW}
                </div>
              </div>
              <div className={styles.behaviorCell}>
                <span className={styles.behaviorLabel}>CW</span>
                <div className={styles.behaviorValue}>
                  {entry.data.behaviorCW}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.notesSection}>
        <div className={styles.notesTitle}>Notes</div>
        <div className={styles.notesList}>
          {notes.length ? (
            notes.map((note) => (
              <span key={note} className={styles.notePill}>
                {note}
              </span>
            ))
          ) : (
            <span className={styles.notePill}>No extra notes listed.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetentWindow;

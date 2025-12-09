import Pill from '../../atoms/Pill/Pill';
import Skeleton from '../../atoms/Skeleton/Skeleton';
import { notSpecified, type EffectInfo as EffectInfoType } from '../../../data/commonParams';
import styles from './EffectInfo.module.less';

type EffectInfoProps = {
  effect?: EffectInfoType;
  loading?: boolean;
};

/**
 * Detailed readout for the currently selected detent. The component handles loading,
 * empty state, normalizes "Not specified" entries from the data source, and keeps layout predictable.
 */
const EffectInfo = ({ effect, loading = false }: EffectInfoProps) => {
  if (loading) {
    return (
      <div className={styles.card} aria-busy>
        <div className={styles.badgeRow}>
          <Skeleton width="120px" height="24px" rounded aria-label="Mode loading" />
          <Skeleton width="90px" height="18px" rounded aria-label="Selector loading" />
        </div>
        <div className={styles.headlineRow} style={{ marginTop: '1rem' }}>
          <div>
            <Skeleton width="140px" height="12px" />
            <div style={{ marginTop: '0.4rem' }}>
              <Skeleton width="240px" height="26px" />
            </div>
            <div style={{ marginTop: '0.4rem' }}>
              <Skeleton width="220px" height="14px" />
            </div>
          </div>
          <div className={styles.rangeCard}>
            <Skeleton width="80px" height="12px" />
            <div style={{ marginTop: '0.35rem' }}>
              <Skeleton width="120px" height="16px" />
            </div>
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Skeleton width="100%" height="14px" />
          <div style={{ marginTop: '0.4rem' }}>
            <Skeleton width="85%" height="14px" />
          </div>
        </div>
        <div className={styles.controlsGrid} style={{ marginTop: '1.25rem' }}>
          {[0, 1].map((idx) => (
            <div key={idx} className={styles.controlCard}>
              <Skeleton width="70px" height="12px" />
              <div style={{ marginTop: '0.6rem' }} className={styles.behaviorGrid}>
                {[0, 1].map((child) => (
                  <div key={child} className={styles.behaviorCell}>
                    <Skeleton width="50px" height="10px" />
                    <div style={{ marginTop: '0.3rem' }}>
                      <Skeleton width="90%" height="14px" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.notesSection}>
          <Skeleton width="60px" height="12px" />
          <div className={styles.notesList} style={{ marginTop: '0.5rem' }}>
            {[0, 1, 2].map((chip) => (
              <Skeleton key={chip} width="90px" height="22px" rounded />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!effect) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Nothing selected yet</p>
        <p className={styles.emptyCopy}>
          Pick a detent or use search to see the full description, knob behaviors, and notes.
        </p>
      </div>
    );
  }

  const description =
    effect.description === notSpecified
      ? 'No description provided in the manual yet.'
      : effect.description;
  const inspiration =
    effect.inspiration === notSpecified ? 'Inspiration not listed' : effect.inspiration;
  const rangeNote =
    effect.rangeNote === notSpecified ? 'Range not listed in the manual' : effect.rangeNote;
  const notes = effect.notes.filter((note) => note !== notSpecified);

  return (
    <div className={styles.card}>
      <div className={styles.badgeRow}>
        <div className={styles.metaGroup}>
          <Pill tone="glow">{effect.mode}</Pill>
          <Pill tone="muted">Detent {effect.detent + 1}</Pill>
        </div>
        <span className={styles.selectorIndex}>Selector #{effect.selectorIndex + 1}</span>
      </div>

      <div className={styles.headlineRow}>
        <div>
          <div className={styles.modelTitle}>Current model</div>
          <div className={styles.modelName}>{effect.model}</div>
          <div className={styles.inspiration}>
            Inspired by <span className={styles.inspirationHighlight}>{inspiration}</span>
          </div>
        </div>
        <div className={styles.rangeCard}>
          <div className={styles.rangeLabel}>Range</div>
          <div className={styles.rangeValue}>{rangeNote}</div>
        </div>
      </div>

      <p className={styles.description}>{description}</p>

      <div className={styles.controlsGrid}>
        {[{ title: 'Tweak', data: effect.tweak }, { title: 'Tweez', data: effect.tweez }].map(
          (entry) => (
            <div key={entry.title} className={styles.controlCard}>
              <div className={styles.controlHeader}>
                <div className={styles.controlTitle}>{entry.title}</div>
                <div className={styles.controlLabel}>{entry.data.label}</div>
              </div>
              <div className={styles.behaviorGrid}>
                <div className={styles.behaviorCell}>
                  <span className={styles.behaviorLabel}>CCW</span>
                  <div className={styles.behaviorValue}>{entry.data.behaviorCCW}</div>
                </div>
                <div className={styles.behaviorCell}>
                  <span className={styles.behaviorLabel}>CW</span>
                  <div className={styles.behaviorValue}>{entry.data.behaviorCW}</div>
                </div>
              </div>
            </div>
          )
        )}
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

export default EffectInfo;

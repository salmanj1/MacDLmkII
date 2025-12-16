import type { EffectInfo } from '../../../data/commonParams';
import { notSpecified } from '../../../data/commonParams';
import { detentsByMode } from '../../../data/effects';
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
  const effectType = effect.mode.includes('Reverb') ? 'Reverb' : 'Delay';
  const detentTotal = detentsByMode[effect.mode]?.length ?? 16;

  const showRouting =
    effect.mode === 'Secret Reverb' ||
    /routing/i.test(effect.rangeNote ?? '') ||
    /reverb\/delay/i.test(effect.rangeNote ?? '');

  const renderDetentMap = () => {
    return (
      <div className={styles.detentMap} aria-label="Detent position">
        {[...Array(detentTotal)].map((_, idx) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            className={`${styles.detentDot} ${idx === effect.detent ? styles.detentDotActive : ''}`}
            style={{ transform: `rotate(${(360 / detentTotal) * idx}deg) translateY(-12px)` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.window} aria-live="polite">
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <span className={styles.modelBadge}>{effect.model}</span>
          <span className={styles.modeBadge}>{effect.mode}</span>
          <span className={styles.typeBadge}>{effectType}</span>
        </div>
        <div className={styles.meta}>
          <span className={styles.detent}>Detent {effect.detent + 1}</span>
          {renderDetentMap()}
        </div>
      </div>

      <div className={styles.body}>
        <section className={styles.section}>
          <div className={styles.sectionLabel}>Inspiration</div>
          <div className={styles.sectionContent}>
            <span className={styles.inspirationHighlight}>{inspiration}</span>
          </div>
        </section>

        <section className={`${styles.section} ${styles.grow}`}>
          <div className={styles.sectionLabel}>Description</div>
          <div className={styles.sectionContentScroll}>
            {description}
          </div>
        </section>

        <section className={styles.controlsRow}>
          <div className={styles.controlCard}>
            <div className={styles.controlHeader}>
              <span className={styles.controlTitle}>Tweak</span>
              <span className={styles.controlLabel}>{effect.tweak.label}</span>
            </div>
            <div className={styles.rangeBar}>
              <span className={styles.rangeEnd}>CCW</span>
              <div className={styles.rangeTrack}>
                <span className={styles.rangeThumb} />
              </div>
              <span className={styles.rangeEnd}>CW</span>
            </div>
            <div className={styles.behaviorRow}>
              <span className={styles.behaviorLabel}>CCW</span>
              <span className={styles.behaviorValue}>{effect.tweak.behaviorCCW || '—'}</span>
            </div>
            <div className={styles.behaviorRow}>
              <span className={styles.behaviorLabel}>CW</span>
              <span className={styles.behaviorValue}>{effect.tweak.behaviorCW || '—'}</span>
            </div>
          </div>

          <div className={styles.controlCard}>
            <div className={styles.controlHeader}>
              <span className={styles.controlTitle}>Tweez</span>
              <span className={styles.controlLabel}>{effect.tweez.label}</span>
            </div>
            <div className={styles.rangeBar}>
              <span className={styles.rangeEnd}>CCW</span>
              <div className={styles.rangeTrack}>
                <span className={styles.rangeThumb} />
              </div>
              <span className={styles.rangeEnd}>CW</span>
            </div>
            <div className={styles.behaviorRow}>
              <span className={styles.behaviorLabel}>CCW</span>
              <span className={styles.behaviorValue}>{effect.tweez.behaviorCCW || '—'}</span>
            </div>
            <div className={styles.behaviorRow}>
              <span className={styles.behaviorLabel}>CW</span>
              <span className={styles.behaviorValue}>{effect.tweez.behaviorCW || '—'}</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>Range</div>
          <div className={styles.sectionContent}>{effect.rangeNote || 'Range not listed.'}</div>
        </section>

        {showRouting && (
          <section className={styles.section}>
            <div className={styles.sectionLabel}>Routing</div>
            <div className={styles.routingChips}>
              <span className={styles.routingChip}>Reverb → Delay</span>
              <span className={`${styles.routingChip} ${styles.routingChipActive}`}>Parallel</span>
              <span className={styles.routingChip}>Delay → Reverb</span>
            </div>
          </section>
        )}

        <section className={styles.section}>
          <div className={styles.sectionLabel}>Notes</div>
          <div className={styles.notesList}>
            {effect.notes.length ? (
              effect.notes.map((note) => (
                <span key={note} className={styles.notePill}>
                  {note}
                </span>
              ))
            ) : (
              <span className={styles.notePill}>No extra notes listed.</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DetentWindow;

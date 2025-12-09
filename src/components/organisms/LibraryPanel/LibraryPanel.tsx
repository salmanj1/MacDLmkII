import type { EffectInfo, Mode } from '../../../data/commonParams';
import type { QaStats } from '../../../utils/effectQa';
import SearchBox from '../../molecules/SearchBox/SearchBox';
import styles from './LibraryPanel.module.less';

type LibraryPanelProps = {
  filteredEffects: EffectInfo[];
  mode: Mode;
  currentDetent: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchInputRef: (ref: HTMLInputElement | null) => void;
  onSelectEffect: (effect: EffectInfo) => void;
  qaStats: QaStats;
  showQa: boolean;
};

/**
 * Houses the right-column controls: search, QA stats, and the grid of effect cards.
 * Kept separate from the faceplate so the atomic layers stay clear.
 */
const LibraryPanel = ({
  filteredEffects,
  mode,
  currentDetent,
  searchTerm,
  onSearchChange,
  onSearchInputRef,
  onSelectEffect,
  qaStats,
  showQa
}: LibraryPanelProps) => {
  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <span className={styles.headerTitle}>Library &amp; Search</span>
        <span className={styles.countPill}>{filteredEffects.length} selectable</span>
      </div>

      <div className={styles.searchWrap}>
        <SearchBox value={searchTerm} onChange={onSearchChange} onFocusedShortcut={onSearchInputRef} />
      </div>

      <div className={styles.shortcuts}>
        <span>Drag/scroll knob for detents</span>
        <span>Arrow keys move detents</span>
        <span>Numbers 1/2/3 swap modes</span>
        <span>Click cards to jump</span>
      </div>

      {showQa && (
        <div className={styles.qaCard}>
          <div className={styles.qaHeader}>
            <p>Data QA</p>
            <span>Not specified: {qaStats.missing.totalNotSpecified}</span>
          </div>
          <div className={styles.qaRows}>
            {qaStats.countsByMode.map((entry) => (
              <div key={entry.mode} className={styles.qaRow}>
                <span>{entry.mode}</span>
                <span>
                  {entry.count} models (expected {entry.expected})
                </span>
              </div>
            ))}
          </div>
          <div className={styles.qaGrid}>
            <span>Inspiration missing: {qaStats.missing.inspiration}</span>
            <span>Description missing: {qaStats.missing.description}</span>
            <span>Tweak behavior missing: {qaStats.missing.tweak}</span>
            <span>Tweez behavior missing: {qaStats.missing.tweez}</span>
            <span>Range note missing: {qaStats.missing.range}</span>
            <span>Notes missing: {qaStats.missing.notes}</span>
          </div>
        </div>
      )}

      <div className={styles.listGrid}>
        {filteredEffects.map((effect) => {
          const isActive = effect.mode === mode && effect.detent === currentDetent;
          return (
            <button
              key={`${effect.mode}-${effect.detent}`}
              type="button"
              onClick={() => onSelectEffect(effect)}
              className={`${styles.effectCard} ${isActive ? styles.effectCardActive : ''}`}
            >
              <div className={styles.cardTop}>
                <span>{effect.mode}</span>
                <span>Detent {effect.detent + 1}</span>
              </div>
              <div className={styles.cardTitle}>{effect.model}</div>
              <div className={styles.cardMeta}>
                <span>{effect.inspiration}</span>
                {isActive && <span className={styles.activeBadge}>Active</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LibraryPanel;

import type { EffectInfo, Mode } from '../../../data/commonParams';
import type { QaStats } from '../../../utils/effectQa';
import SearchBox from '../../molecules/SearchBox/SearchBox';
import Skeleton from '../../atoms/Skeleton/Skeleton';
import EffectCard from '../../molecules/EffectCard/EffectCard';
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
  loading?: boolean;
};

/**
 * Lists the available effects plus optional QA stats.
 * Separated from the pedal so the atomic layers stay clear.
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
  showQa,
  loading = false
}: LibraryPanelProps) => {
  const suggestions = searchTerm ? filteredEffects.slice(0, 8) : [];

  return (
    <div className={styles.panel}>
      <div className={styles.searchWrap}>
        <SearchBox
          value={searchTerm}
          onChange={onSearchChange}
          onFocusedShortcut={onSearchInputRef}
        />
      </div>

      {searchTerm ? (
        <div className={styles.suggestionList} role="listbox" aria-label="Search suggestions">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className={styles.suggestionItem} aria-busy>
                <Skeleton width="120px" height="14px" />
                <Skeleton width="80px" height="10px" />
              </div>
            ))
          ) : suggestions.length ? (
            suggestions.map((effect) => (
              <button
                key={`${effect.mode}-${effect.detent}`}
                type="button"
                className={styles.suggestionItem}
                role="option"
                onClick={() => {
                  onSelectEffect(effect);
                  onSearchChange('');
                }}
              >
                <span className={styles.suggestionTitle}>{effect.model}</span>
                <span className={styles.suggestionMeta}>
                  {effect.mode} • {effect.inspiration || 'No inspiration'}
                </span>
              </button>
            ))
          ) : (
            <div className={styles.emptyState} role="status">
              <p>No effects match "{searchTerm}"</p>
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className={styles.clearSearchButton}
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      ) : null}

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

      {!searchTerm && (
        <>
          <div className={styles.listGrid}>
            {loading
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className={styles.effectCard} aria-busy>
                    <Skeleton width="60px" height="10px" />
                    <div style={{ marginTop: '0.35rem' }}>
                      <Skeleton width="140px" height="20px" />
                    </div>
                    <div style={{ marginTop: '0.35rem' }}>
                      <Skeleton width="110px" height="12px" />
                    </div>
                  </div>
                ))
              : filteredEffects.map((effect) => {
                  return (
                    <EffectCard
                      key={`${effect.mode}-${effect.detent}`}
                      effect={effect}
                      mode={mode}
                      currentDetent={currentDetent}
                      onSelect={onSelectEffect}
                    />
                  );
                })}
          </div>

          {!loading && filteredEffects.length === 0 && (
            <div className={styles.emptyState} role="status">
              <p>No effects available for this mode.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LibraryPanel;

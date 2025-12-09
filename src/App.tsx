import { useEffect, useMemo, useState, useCallback } from 'react';
import Faceplate from './components/organisms/Faceplate/Faceplate';
import HeroHeader from './components/organisms/HeroHeader/HeroHeader';
import LibraryPanel from './components/organisms/LibraryPanel/LibraryPanel';
import EffectInfo from './components/organisms/EffectInfo/EffectInfo';
import useEffectLibrary from './hooks/useEffectLibrary';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { buildQaStats } from './utils/effectQa';
import styles from './App.module.less';
import ErrorBoundary from './components/organisms/ErrorBoundary/ErrorBoundary';
import SearchBox from './components/molecules/SearchBox/SearchBox';

// Top-level page wiring: orchestrates data hooks, keyboard shortcuts, and composes the atomic
// UI blocks (faceplate, detail pane, library panel) so layout remains predictable.
const App = () => {
  const [searchInput, setSearchInput] = useState<HTMLInputElement | null>(null);
  const [showQa, setShowQa] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setLibraryOpen(true);
    }
  }, []);

  const {
    mode,
    setMode,
    effects,
    filteredEffects,
    currentEffect,
    currentDetent,
    setDetentForMode,
    jumpToEffect,
    searchTerm,
    setSearchTerm,
    loadingError,
    isLoading
  } = useEffectLibrary();

  const handleDetentChange = useCallback(
    (next: number) => setDetentForMode(mode, next),
    [mode, setDetentForMode]
  );

  useKeyboardShortcuts({
    mode,
    currentDetent,
    onModeChange: setMode,
    onDetentChange: handleDetentChange,
    searchInput
  });

  const qaStats = useMemo(() => buildQaStats(effects), [effects]);

  return (
    <ErrorBoundary
      fallbackTitle="UI hiccup"
      fallbackMessage="Reload to keep jamming."
    >
      <div className={styles.page}>
        <div className={styles.background} aria-hidden>
          <div className={`${styles.orb} ${styles.orbA}`} />
          <div className={`${styles.orb} ${styles.orbB}`} />
          <div className={styles.ground} />
          <div className={styles.horizon} />
        </div>

        <main className={styles.main}>
          <HeroHeader />

          {loadingError && <p className={styles.error}>{loadingError}</p>}

          <section className={styles.utilityBar}>
            <SearchBox
              value={searchTerm}
              onChange={setSearchTerm}
              onFocusedShortcut={setSearchInput}
            />
            <div className={styles.instructions}>
              <span>Drag/scroll knob for detents</span>
              <span>Arrow keys move detents</span>
              <span>Numbers 1/2/3 swap modes</span>
              <span>Click cards to jump</span>
            </div>
          </section>

          <section className={styles.faceplateWrap}>
            <Faceplate
              mode={mode}
              detent={currentDetent}
              currentEffect={currentEffect}
              onModeChange={setMode}
              onDetentChange={handleDetentChange}
            />
          </section>

          <section className={styles.infoWrap}>
            <EffectInfo effect={currentEffect} loading={isLoading} />
          </section>

          <section className={styles.librarySection}>
            <div className={styles.libraryHeader}>
              <div>
                <p className={styles.libraryTitle}>Library</p>
                <p className={styles.librarySubtitle}>
                  {isLoading
                    ? 'Loading library…'
                    : `${filteredEffects.length} models match your filter`}
                </p>
              </div>
              <div className={styles.libraryActions}>
                <button
                  type="button"
                  className={`${styles.libraryToggle} ${styles.qaToggle}`}
                  aria-pressed={showQa}
                  onClick={() => setShowQa((prev) => !prev)}
                >
                  {showQa ? 'Hide Data QA' : 'Show Data QA'}
                </button>
                <button
                  type="button"
                  className={styles.libraryToggle}
                  aria-expanded={libraryOpen}
                  onClick={() => setLibraryOpen((prev) => !prev)}
                >
                  {libraryOpen ? 'Hide library' : 'Show library'}
                </button>
              </div>
            </div>

            <div
              className={`${styles.libraryBody} ${libraryOpen ? styles.libraryBodyOpen : ''}`}
              aria-hidden={!libraryOpen}
            >
              {libraryOpen && (
                <LibraryPanel
                  filteredEffects={filteredEffects}
                  mode={mode}
                  currentDetent={currentDetent}
                  onSelectEffect={jumpToEffect}
                  qaStats={qaStats}
                  showQa={showQa}
                  loading={isLoading}
                />
              )}
            </div>
          </section>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;

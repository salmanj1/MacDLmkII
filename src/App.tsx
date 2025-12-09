import { useEffect, useMemo, useState, useCallback } from 'react';
import Pedal from './components/organisms/Pedal/Pedal';
import LibraryPanel from './components/organisms/LibraryPanel/LibraryPanel';
import useEffectLibrary from './hooks/useEffectLibrary';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { buildQaStats } from './utils/effectQa';
import styles from './App.module.less';
import ErrorBoundary from './components/organisms/ErrorBoundary/ErrorBoundary';

// Top-level page wiring: orchestrates data hooks, keyboard shortcuts, and composes the atomic
// UI blocks (pedal and library panel) so layout remains predictable.
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
        </div>

        <main className={styles.main}>
          {loadingError && <p className={styles.error}>{loadingError}</p>}

          <section className={styles.pedalWrap}>
            <Pedal
              mode={mode}
              detent={currentDetent}
              currentEffect={currentEffect}
              onModeChange={setMode}
              onDetentChange={handleDetentChange}
            />
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
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onSearchInputRef={setSearchInput}
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

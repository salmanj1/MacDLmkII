import { useMemo, useState, useCallback } from 'react';
import Faceplate from './components/organisms/Faceplate/Faceplate';
import HeroHeader from './components/organisms/HeroHeader/HeroHeader';
import LibraryPanel from './components/organisms/LibraryPanel/LibraryPanel';
import EffectInfo from './components/organisms/EffectInfo/EffectInfo';
import useEffectLibrary from './hooks/useEffectLibrary';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { buildQaStats } from './utils/effectQa';
import styles from './App.module.less';
import ErrorBoundary from './components/organisms/ErrorBoundary/ErrorBoundary';

// Top-level page wiring: orchestrates data hooks, keyboard shortcuts, and composes the atomic
// UI blocks (faceplate, detail pane, library panel) so layout remains predictable.
const App = () => {
  const [searchInput, setSearchInput] = useState<HTMLInputElement | null>(null);
  const [showQa, setShowQa] = useState(false);

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
    <ErrorBoundary fallbackTitle="UI hiccup" fallbackMessage="Reload to keep jamming.">
      <div className={styles.page}>
        <div className={styles.background} aria-hidden>
          <div className={`${styles.orb} ${styles.orbA}`} />
          <div className={`${styles.orb} ${styles.orbB}`} />
          <div className={styles.ground} />
          <div className={styles.horizon} />
        </div>

        <main className={styles.main}>
          <HeroHeader showQa={showQa} onToggleQa={() => setShowQa((prev) => !prev)} />

          {loadingError && <p className={styles.error}>{loadingError}</p>}

          <section className={styles.contentGrid}>
            <Faceplate
              mode={mode}
              detent={currentDetent}
              currentEffect={currentEffect}
              onModeChange={setMode}
              onDetentChange={handleDetentChange}
            />

            <div className={styles.rightStack}>
              <EffectInfo effect={currentEffect} loading={isLoading} />
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
            </div>
          </section>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;

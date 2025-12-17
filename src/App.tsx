import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import Pedal from './components/organisms/Pedal/Pedal';
import useEffectLibrary from './hooks/useEffectLibrary';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import styles from './App.module.less';
import useMidiBridge from './hooks/useMidiBridge';
import ErrorBoundary from './components/organisms/ErrorBoundary/ErrorBoundary';
import KeyboardHelp from './components/molecules/KeyboardHelp/KeyboardHelp';
import { delayControls, midiCC, reverbControls, tapSubdivisions } from './data/midi';
import type { Mode } from './data/commonParams';
import useTapBlink from './hooks/useTapBlink';

// Top-level page wiring: orchestrates data hooks, keyboard shortcuts, and composes the atomic
// UI blocks (pedal and library panel) so layout remains predictable.
const App = () => {
  type FootStatus = 'off' | 'on' | 'dim' | 'armed';
  type PresetSnapshot = {
    mode: Mode;
    detent: number;
    reverbDetent: number;
    delayControlValues: Record<Mode, Record<(typeof delayControls)[number]['id'], number>>;
    reverbControlValues: Record<(typeof reverbControls)[number]['id'], number>;
    tapSubdivisionIndex: number;
    tapBpm: number;
  };

  const [footswitchStatus, setFootswitchStatus] = useState<
    Record<'A' | 'B' | 'C' | 'Tap' | 'Set', FootStatus>
  >({
    A: 'off',
    B: 'off',
    C: 'off',
    Tap: 'off',
    Set: 'off'
  });
  const [tapSubdivisionIndex, setTapSubdivisionIndex] = useState(
    tapSubdivisions.findIndex((entry) => entry.value === 64) || 0
  );
  const [tapModeActive, setTapModeActive] = useState(false);
  const [tapBpm, setTapBpm] = useState(120);
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
  const [activePreset, setActivePresetIndex] = useState<number | null>(null);
  const [reverbDetent, setReverbDetent] = useState(0);
  const [delayControlValues, setDelayControlValues] = useState<
    Record<Mode, Record<(typeof delayControls)[number]['id'], number>>
  >({
    'MkII Delay': delayControls.reduce(
      (acc, ctrl) => ({ ...acc, [ctrl.id]: 64 }),
      {} as Record<(typeof delayControls)[number]['id'], number>
    ),
    'Legacy Delay': delayControls.reduce(
      (acc, ctrl) => ({ ...acc, [ctrl.id]: 64 }),
      {} as Record<(typeof delayControls)[number]['id'], number>
    ),
    'Secret Reverb': delayControls.reduce(
      (acc, ctrl) => ({ ...acc, [ctrl.id]: 64 }),
      {} as Record<(typeof delayControls)[number]['id'], number>
    )
  });
  const [reverbControlValues, setReverbControlValues] = useState<
    Record<(typeof reverbControls)[number]['id'], number>
  >(
    reverbControls.reduce(
      (acc, ctrl) => ({ ...acc, [ctrl.id]: 64 }),
      {} as Record<(typeof reverbControls)[number]['id'], number>
    )
  );

  const {
    mode,
    setMode,
    effects,
    currentEffect,
    currentDetent,
    setDetentForMode,
    loadingError
  } = useEffectLibrary();
  const reverbEffects = useMemo(
    () => effects.filter((entry) => entry.mode === 'Secret Reverb'),
    [effects]
  );
  const currentReverbEffect = useMemo(
    () => reverbEffects.find((entry) => entry.detent === reverbDetent),
    [reverbDetent, reverbEffects]
  );

  const midi = useMidiBridge();
  const {
    ports,
    selectedPort,
    channel,
    error: midiError,
    ready: midiReady,
    clock,
    refreshOutputs,
    selectPort,
    setChannel,
    sendMessages,
    sendModelSelect,
    sendCC,
    sendProgramChange
  } = midi;

  // Restore last selected MIDI port on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !midiReady || ports.length === 0) return;
    const savedPort = localStorage.getItem('macdlmkii-midi-port');
    if (savedPort !== null) {
      const portIndex = ports.findIndex((p) => p === savedPort);
      if (portIndex >= 0 && selectedPort !== portIndex) {
        selectPort(portIndex);
      }
    }
  }, [midiReady, ports, selectPort, selectedPort]);

  const midiStatus = useMemo(() => {
    if (!midiReady) return 'MIDI unavailable';
    if (selectedPort === null) return 'No port selected';
    return `Connected: ${ports[selectedPort] ?? 'Port'}`;
  }, [midiReady, ports, selectedPort]);

  const [toast, setToast] = useState<{ id: number; message: string; kind: 'error' | 'ok' } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const toastIdRef = useRef(0);

  const tapBlink = useTapBlink({ enabled: tapModeActive, bpm: tapBpm });
  useEffect(() => {
    setFootswitchStatus((prev) => ({
      ...prev,
      Tap: tapModeActive && tapBlink.blinkOn ? 'armed' : 'off'
    }));
  }, [tapBlink.blinkOn, tapModeActive]);

  const handleDetentChange = useCallback(
    (next: number) => setDetentForMode(mode, next),
    [mode, setDetentForMode]
  );

  const stepDelayDetent = useCallback(
    (delta: number) => {
      const detents = effects
        .filter((entry) => entry.mode === mode)
        .map((entry) => entry.detent)
        .sort((a, b) => a - b);
      if (!detents.length) return;
      const idx = detents.indexOf(currentDetent);
      const nextIdx = Math.max(0, Math.min(detents.length - 1, idx + delta));
      const next = detents[nextIdx] ?? currentDetent;
      setDetentForMode(mode, next);
    },
    [currentDetent, effects, mode, setDetentForMode]
  );

  const stepReverbDetent = useCallback(
    (delta: number) => {
      const detents = reverbEffects
        .map((entry) => entry.detent)
        .sort((a, b) => a - b);
      if (!detents.length) return;
      const idx = detents.indexOf(reverbDetent);
      const nextIdx = Math.max(0, Math.min(detents.length - 1, idx + delta));
      const next = detents[nextIdx] ?? reverbDetent;
      setReverbDetent(next);
    },
    [reverbDetent, reverbEffects]
  );

  const showToast = useCallback((message: string, kind: 'error' | 'ok' = 'ok') => {
    const id = ++toastIdRef.current;
    setToast({ id, message, kind });
    const duration = kind === 'error' ? 5000 : 3000;
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, duration);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  useKeyboardShortcuts({
    onModeChange: setMode,
    onDelayStep: stepDelayDetent,
    onReverbStep: stepReverbDetent,
    onHelpToggle: () => setShowHelp((prev) => !prev)
  });

  const sendAllControls = useCallback(async () => {
    if (!midiReady || selectedPort === null) return;
    const delayValues = delayControlValues[mode] || {};
    const reverbValues = reverbControlValues;

    await Promise.all([
      ...delayControls.map((ctrl) =>
        sendCC(ctrl.cc, delayValues[ctrl.id] ?? 64)
      ),
      ...reverbControls.map((ctrl) =>
        sendCC(ctrl.cc, reverbValues[ctrl.id] ?? 64)
      )
    ]);
  }, [delayControlValues, mode, reverbControlValues, midiReady, selectedPort, sendCC]);

  const loadPresetFromStorage = useCallback(
    async (index: number) => {
      if (typeof window === 'undefined') return false;
      const raw = localStorage.getItem(`macdlmkii-preset-${index}`);
      if (!raw) return false;
      try {
        const snapshot: PresetSnapshot = JSON.parse(raw);
        setMode(snapshot.mode);
        setDetentForMode(snapshot.mode, snapshot.detent);
        setReverbDetent(
          typeof snapshot.reverbDetent === 'number' ? snapshot.reverbDetent : 0
        );
        setDelayControlValues(snapshot.delayControlValues);
        setReverbControlValues(snapshot.reverbControlValues);
        setTapSubdivisionIndex(snapshot.tapSubdivisionIndex);
        setTapBpm(snapshot.tapBpm);
        setTapModeActive(true);
        setActivePresetIndex(index);
        // Ensure hardware catches up with the restored state.
        setTimeout(() => {
          sendModelSelect(snapshot.mode, snapshot.detent);
          sendModelSelect('Secret Reverb', snapshot.reverbDetent);
          sendAllControls();
        }, 0);
        return true;
      } catch (error) {
        console.warn('Failed to load preset snapshot', error);
        return false;
      }
    },
    [
      sendModelSelect,
      setReverbDetent,
      sendAllControls,
      setDetentForMode,
      setMode,
      setTapBpm
    ]
  );

  const setActivePreset = useCallback(async (index: number) => {
    if (!midiReady || selectedPort === null) return;
    const program = Math.max(0, Math.min(127, index));
    await sendProgramChange(program);
    await sendCC(midiCC.presetBypass, 64);

    const loaded = await loadPresetFromStorage(index);
    if (loaded) return;

    // Reset control values back to mid to mirror hardware defaults on preset load.
    setDelayControlValues((prev) => ({
      ...prev,
      [mode]: delayControls.reduce(
        (acc, ctrl) => ({ ...acc, [ctrl.id]: 64 }),
        {} as Record<(typeof delayControls)[number]['id'], number>
      )
    }));
    setReverbControlValues(
      reverbControls.reduce(
        (acc, ctrl) => ({ ...acc, [ctrl.id]: 64 }),
        {} as Record<(typeof reverbControls)[number]['id'], number>
      )
    );

    await sendAllControls();

    setFootswitchStatus({
      A: index === 0 ? 'on' : 'off',
      B: index === 1 ? 'on' : 'off',
      C: index === 2 ? 'on' : 'off',
      Tap: 'off',
      Set: 'off'
    });
    setActivePresetIndex(index);
  }, [midiReady, selectedPort, sendCC, sendProgramChange, mode, sendAllControls]);

  const toggleBypass = useCallback(async (nextStatus: 'on' | 'dim') => {
    if (!midiReady || selectedPort === null) return;
    const value = nextStatus === 'dim' ? 0 : 64;
    await sendCC(midiCC.presetBypass, value);
  }, [midiReady, selectedPort, sendCC]);

  const handleFootswitch = useCallback(
    async (id: string) => {
      if (!midiReady || selectedPort === null) return;
      if (['A', 'B', 'C'].includes(id)) {
        const current = footswitchStatus[id as 'A' | 'B' | 'C'];
        if (current === 'on') {
          setFootswitchStatus((prev) => ({ ...prev, [id]: 'dim' }));
          await toggleBypass('dim');
          return;
        }
        if (current === 'dim') {
          setFootswitchStatus((prev) => ({ ...prev, [id]: 'on' }));
          await toggleBypass('on');
          return;
        }
        const idx = id === 'A' ? 0 : id === 'B' ? 1 : 2;
        await setActivePreset(idx);
        return;
      }

      if (id === 'Tap') {
        const nextIdx = (tapSubdivisionIndex + 1) % tapSubdivisions.length;
        setTapSubdivisionIndex(nextIdx);
        setTapModeActive(true);

        const now = Date.now();
        setTapTimestamps((prev) => {
          const next = [...prev.slice(-3), now];
          if (next.length >= 2) {
            const intervals = next
              .slice(1)
              .map((ts, i) => ts - next[i])
              .filter((ms) => ms > 0);
            if (intervals.length) {
              const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
              const bpm = Math.max(40, Math.min(240, Math.round(60000 / avg)));
              setTapBpm(bpm);
            }
          }
          return next;
        });

        await sendCC(midiCC.delayNotes, tapSubdivisions[nextIdx].value);
        await sendMessages(
          buildTapMessages(tapSubdivisions[nextIdx].value)
        );
        tapBlink.trigger(tapBpm);
        return;
      }

      if (id === 'Set') {
        if (activePreset === null) return;
        const snapshot: PresetSnapshot = {
          mode,
          detent: currentDetent,
          reverbDetent,
          delayControlValues,
          reverbControlValues,
          tapSubdivisionIndex,
          tapBpm
        };
        try {
          const raw = JSON.stringify(snapshot);
          localStorage.setItem(`macdlmkii-preset-${activePreset}`, raw);
          setFootswitchStatus((prev) => ({ ...prev, Set: 'armed' }));
          setToast({ message: `Preset ${activePreset + 1} saved`, kind: 'ok' });
          setTimeout(() => {
            setFootswitchStatus((prev) => ({ ...prev, Set: 'off' }));
            setToast(null);
          }, 2000);
        } catch (error) {
          setToast({ message: 'Failed to save preset', kind: 'error' });
        }
        return;
      }
    },
    [
      activePreset,
      currentDetent,
      delayControlValues,
      footswitchStatus,
      midiReady,
      mode,
      reverbDetent,
      reverbControlValues,
      selectedPort,
      sendCC,
      setActivePreset,
      setToast,
      tapBlink,
      tapBpm,
      tapSubdivisionIndex,
      toggleBypass
    ]
  );

  const handleControlChange = useCallback(
    async (id: string, value: number, domain: 'delay' | 'reverb') => {
      if (!midiReady || selectedPort === null) return;
      if (domain === 'delay') {
        setDelayControlValues((prev) => ({
          ...prev,
          [mode]: {
            ...prev[mode],
            [id]: value
          }
        }));
      } else {
        setReverbControlValues((prev) => ({
          ...prev,
          [id]: value
        }));
      }
      const map =
        domain === 'delay'
          ? {
              time: midiCC.delayTime,
              repeats: midiCC.delayRepeats,
              tweak: midiCC.delayTweak,
              tweez: midiCC.delayTweez,
              mix: midiCC.delayMix
            }
          : {
              decay: midiCC.reverbDecay,
              tweak: midiCC.reverbTweak,
              routing: midiCC.reverbRouting,
              mix: midiCC.reverbMix
            };
      const cc = map[id as keyof typeof map];
      if (cc !== undefined) {
        await sendCC(cc, value);
      }
    },
    [midiReady, mode, selectedPort, sendCC]
  );

  const syncToHardware = useCallback(async () => {
    if (!currentEffect || !midiReady || selectedPort === null) return;
    await sendModelSelect(mode, currentDetent);
    await sendModelSelect('Secret Reverb', reverbDetent);
    await sendAllControls();
  }, [currentDetent, currentEffect, midiReady, mode, reverbDetent, selectedPort, sendAllControls, sendModelSelect]);

  useEffect(() => {
    syncToHardware();
  }, [syncToHardware]);

  useEffect(() => {
    if (!midiReady || selectedPort === null) return;
    sendModelSelect('Secret Reverb', reverbDetent);
  }, [midiReady, reverbDetent, selectedPort, sendModelSelect]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('macdlmkii-ui');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.delayControlValues) setDelayControlValues(parsed.delayControlValues);
      if (parsed.reverbControlValues) setReverbControlValues(parsed.reverbControlValues);
      if (typeof parsed.tapSubdivisionIndex === 'number')
        setTapSubdivisionIndex(parsed.tapSubdivisionIndex);
      if (typeof parsed.tapBpm === 'number') setTapBpm(parsed.tapBpm);
      if (typeof parsed.reverbDetent === 'number') setReverbDetent(parsed.reverbDetent);
      if (typeof parsed.activePreset === 'number') setActivePresetIndex(parsed.activePreset);
    } catch (error) {
      console.warn('Failed to load UI state', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const snapshot = {
      delayControlValues,
      reverbControlValues,
      tapSubdivisionIndex,
      tapBpm,
      reverbDetent,
      activePreset
    };
    localStorage.setItem('macdlmkii-ui', JSON.stringify(snapshot));
  }, [activePreset, delayControlValues, reverbControlValues, tapSubdivisionIndex, tapBpm, reverbDetent]);

  useEffect(() => {
    if (midiError) {
      setToast({ message: midiError, kind: 'error' });
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [midiError]);

  const controlLabels = useMemo(() => {
    const tweak = currentEffect?.tweak.label || 'Tweak';
    const tweez = currentEffect?.tweez.label || 'Tweez';
    const reverbTweak = currentReverbEffect?.tweak.label || 'Tweak';
    const routing = currentReverbEffect?.tweez.label || 'Routing';
    return { tweak, tweez, reverbTweak, routing };
  }, [currentEffect, currentReverbEffect]);

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

      {toast && (
        <div className={styles.toastWrap} role="status" aria-live="polite">
          <div
            className={`${styles.toast} ${
              toast.kind === 'error' ? styles.toastError : styles.toastOk
            }`}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={dismissToast}
              className={styles.toastDismiss}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <KeyboardHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />

        <main className={styles.main}>
          {loadingError && <p className={styles.error}>{loadingError}</p>}

      <div className={styles.contentGrid}>
        <section className={styles.pedalWrap}>
          <Pedal
            mode={mode}
            detent={currentDetent}
            reverbDetent={reverbDetent}
            currentEffect={currentEffect}
            currentReverbEffect={currentReverbEffect}
            onModeChange={setMode}
            onDetentChange={handleDetentChange}
            onReverbDetentChange={setReverbDetent}
            onFootswitchPress={handleFootswitch}
            footswitchStatus={footswitchStatus}
            onControlChange={handleControlChange}
            controlValues={{
              delay: delayControlValues[mode],
              reverb: reverbControlValues
            }}
            controlLabels={controlLabels}
          />
        </section>
      </div>

      <div className={styles.midiBar} aria-live="polite">
        <span className={styles.midiStatus}>{clock.followEnabled && clock.bpm ? `Clock ${Math.round(clock.bpm)} BPM` : midiStatus}</span>
        <select
          className={styles.midiSelect}
          value={selectedPort ?? ''}
          onChange={async (event) => {
            const idx = Number(event.target.value);
            if (!Number.isNaN(idx)) {
              await selectPort(idx);
              await syncToHardware();
              // Persist port selection
              if (typeof window !== 'undefined' && ports[idx]) {
                localStorage.setItem('macdlmkii-midi-port', ports[idx]);
              }
              showToast(`Connected to ${ports[idx] ?? 'port'}`, 'ok');
            }
          }}
          disabled={!midiReady}
          title={!midiReady ? 'MIDI unavailable. Check browser permissions or try Chrome/Edge.' : ''}
        >
          <option value="" disabled>
            {midiReady ? 'Select output' : 'MIDI unavailable - check permissions'}
          </option>
          {ports.map((name, idx) => (
            <option key={name} value={idx}>
              {name}
            </option>
          ))}
        </select>
        <input
          type="number"
          className={styles.midiChannel}
          min={1}
          max={16}
          value={channel}
          onChange={(event) => setChannel(Number(event.target.value))}
          disabled={!midiReady}
          aria-label="MIDI channel"
        />
        <button
          type="button"
          className={styles.midiRefresh}
          onClick={refreshOutputs}
          disabled={!midiReady}
        >
          ↻
        </button>
        <button
          type="button"
          className={styles.midiRefresh}
          onClick={clock.followEnabled ? clock.disableFollow : clock.enableFollow}
          disabled={!midiReady || selectedPort === null}
          aria-pressed={clock.followEnabled}
        >
          {clock.followEnabled ? 'Clock: On' : 'Clock: Off'}
        </button>
        {midiError && <span className={styles.midiError}>{midiError}</span>}
      </div>
    </main>
  </div>
  </ErrorBoundary>
);
};

export default App;

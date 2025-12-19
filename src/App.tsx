import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import Pedal from './components/organisms/Pedal/Pedal';
import LibraryPanel from './components/organisms/LibraryPanel/LibraryPanel';
import ManualPane from './components/organisms/ManualPane/ManualPane';
import useEffectLibrary from './hooks/useEffectLibrary';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import styles from './App.module.less';
import useMidiBridge from './hooks/useMidiBridge';
import ErrorBoundary from './components/organisms/ErrorBoundary/ErrorBoundary';
import KeyboardHelp from './components/molecules/KeyboardHelp/KeyboardHelp';
import { delayControls, midiCC, modelValueForMode, reverbControls, tapSubdivisions } from './data/midi';
import type { EffectInfo, Mode } from './data/commonParams';
import useTapBlink from './hooks/useTapBlink';
import { buildTapMessages } from './data/midiMessages';
import { buildQaStats } from './utils/effectQa';
import MidiHealthIndicator from './components/molecules/MidiHealthIndicator/MidiHealthIndicator';
import { midiConnectionService } from './state/useMidiConnectionStore';
import MidiDebuggerPanel from './components/molecules/MidiDebuggerPanel/MidiDebuggerPanel';
import { logMidiMessage } from './state/useMidiDebugger';
import { useIncomingMidi } from './hooks/useIncomingMidi';
import ParameterDisplay from './components/molecules/ParameterDisplay/ParameterDisplay';
import PresetBankPanel from './components/organisms/PresetBankPanel/PresetBankPanel';
import { presetBankActions } from './state/usePresetBank';

// Top-level page wiring: orchestrates data hooks, keyboard shortcuts, and composes the pedal UI
// so layout remains predictable.
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  const snapshotsEqual = (a: PresetSnapshot | null, b: PresetSnapshot | null) => {
    if (!a || !b) return false;
    return JSON.stringify(a) === JSON.stringify(b);
  };

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

  const [footswitchStatus, setFootswitchStatus] = useState<
    Record<'A' | 'B' | 'C' | 'Tap', FootStatus>
  >({
    A: 'off',
    B: 'off',
    C: 'off',
    Tap: 'off'
  });
  const [tapSubdivisionIndex, setTapSubdivisionIndex] = useState(
    tapSubdivisions.findIndex((entry) => entry.value === 64) || 0
  );
  const [tapModeActive, setTapModeActive] = useState(false);
  const [tapBpm, setTapBpm] = useState(120);
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
  const [activePreset, setActivePresetIndex] = useState<number | null>(null);
  const [reverbDetent, setReverbDetent] = useState(0);
  const [activeBaseline, setActiveBaseline] = useState<PresetSnapshot | null>(null);
  const [presetDirty, setPresetDirty] = useState(false);
  const [showDebugger, setShowDebugger] = useState(process.env.NODE_ENV === 'development');

  useIncomingMidi(process.env.NODE_ENV === 'development');
  useEffect(() => {
    presetBankActions.select(activePreset);
  }, [activePreset]);

  const factorySeeds = useMemo(
    () => [
      {
        slot: 0,
        name: 'Preset A — Adriatic + Ganymede',
        detent: 12, // Adriatic
        reverbDetent: 10, // Ganymede
        presetProgram: 0,
        description: 'Expression assigns: Time, Repeats, Tweez.'
      },
      {
        slot: 1,
        name: 'Preset B — Cosmos + Plate',
        detent: 10, // Cosmos
        reverbDetent: 9, // Plate
        presetProgram: 1,
        description: 'Expression assigns: Repeats, Tweez.'
      },
      {
        slot: 2,
        name: 'Preset C — Multi-Pass + Searchlights',
        detent: 11, // Multi-Pass
        reverbDetent: 1, // Searchlights
        presetProgram: 2,
        description: 'Expression assigns: Repeats, Mix.'
      },
      {
        slot: 3,
        name: 'Preset D — Vintage Digital + Hall',
        detent: 0, // Vintage Digital
        reverbDetent: 13, // Hall
        presetProgram: 3,
        description: 'Expression assigns: Repeats, Tweak, Tweez.'
      },
      {
        slot: 4,
        name: 'Preset E — Glitch + Particle Verb',
        detent: 14, // Glitch
        reverbDetent: 2, // Particle Verb
        presetProgram: 4,
        description: 'Expression assigns: Repeats, Tweak (pitch), Tweez.'
      },
      {
        slot: 5,
        name: 'Preset F — Transistor + Hot Springs',
        detent: 9, // Transistor
        reverbDetent: 12, // Hot Springs
        presetProgram: 5,
        description: 'Expression assigns: Time, Repeats, Tweez.'
      }
    ],
    []
  );
  // Legacy library state removed
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

  const autoNameFromSnapshot = useCallback(
    (snapshot: PresetSnapshot) => {
      const delayModel =
        effects.find((entry) => entry.mode === snapshot.mode && entry.detent === snapshot.detent)
          ?.model ?? snapshot.mode;
      const reverbModel =
        effects.find((entry) => entry.mode === 'Secret Reverb' && entry.detent === snapshot.reverbDetent)
          ?.model ?? null;
      const parts = [delayModel];
      if (reverbModel) parts.push(reverbModel);
      return parts.filter(Boolean).join(' + ') || 'Untitled preset';
    },
    [effects]
  );

  const summaryFromSnapshot = useCallback(
    (snapshot: PresetSnapshot) => {
      const delayModel =
        effects.find((entry) => entry.mode === snapshot.mode && entry.detent === snapshot.detent)
          ?.model ?? snapshot.mode;
      const reverbModel =
        effects.find((entry) => entry.mode === 'Secret Reverb' && entry.detent === snapshot.reverbDetent)
          ?.model ?? 'No reverb';
      const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
      const delayLabel = `${normalize(delayModel)} delay`;
      const hasReverb = reverbModel && !/reverb off/i.test(reverbModel);
      return hasReverb
        ? `${delayLabel} + ${normalize(reverbModel)} reverb`
        : delayLabel;
    },
    [effects]
  );
  const reverbEffects = useMemo(
    () => effects.filter((entry) => entry.mode === 'Secret Reverb'),
    [effects]
  );
  const currentReverbEffect = useMemo(
    () => reverbEffects.find((entry) => entry.detent === reverbDetent),
    [reverbDetent, reverbEffects]
  );
  const qaStats = useMemo(() => buildQaStats(effects), [effects]);

  const midi = useMidiBridge();
  const {
    ports,
    selectedPort,
    channel,
    error: midiError,
    lastCommand: midiLastCommand,
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
  const [clockSendBpm, setClockSendBpm] = useState(120);

  const midiErrorLabel = useMemo(() => {
    if (!midiLastCommand) return null;
    if (midiLastCommand.type === 'pc') return 'PRESET SELECT COMMAND';
    const entry = Object.entries(midiCC).find(
      ([, value]) => value === midiLastCommand.control
    );
    if (!entry) return 'UNKNOWN COMMAND';
    const readable = entry[0].replace(/([a-z])([A-Z])/g, '$1 $2');
    return `${readable.toUpperCase()} COMMAND`;
  }, [midiLastCommand]);

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
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const blinkLockRef = useRef(false);
  const suppressSendsUntilRef = useRef(0);

  const tapBlink = useTapBlink({ enabled: tapModeActive, bpm: tapBpm });
  useEffect(() => {
    setFootswitchStatus((prev) => ({
      ...prev,
      Tap: tapModeActive && tapBlink.blinkOn ? 'armed' : 'off'
    }));
  }, [tapBlink.blinkOn, tapModeActive]);

  const buildDelayDefaults = useCallback(() => {
    const defaults = delayControls.reduce(
      (acc, ctrl) => ({ ...acc, [ctrl.id]: 64 }),
      {} as Record<(typeof delayControls)[number]['id'], number>
    );
    return {
      'MkII Delay': { ...defaults },
      'Legacy Delay': { ...defaults },
      'Secret Reverb': { ...defaults }
    };
  }, []);

  const buildReverbDefaults = useCallback(() => {
    return reverbControls.reduce(
      (acc, ctrl) => ({
        ...acc,
        [ctrl.id]: ctrl.id === 'mix' ? 0 : 64
      }),
      {} as Record<(typeof reverbControls)[number]['id'], number>
    );
  }, []);

  const seedFactoryPresets = useCallback(() => {
    if (typeof window === 'undefined') return;

    const tapIndex = tapSubdivisions.findIndex((entry) => entry.value === 64) || 0;
    const delayDefaults = buildDelayDefaults();
    const reverbDefaults = buildReverbDefaults();

    factorySeeds.forEach(({ slot: index, detent, reverbDetent }) => {
      const snapshot: PresetSnapshot = {
        mode: 'MkII Delay',
        detent,
        reverbDetent,
        delayControlValues: buildDelayDefaults(),
        reverbControlValues: buildReverbDefaults(),
        tapSubdivisionIndex: tapIndex,
        tapBpm: 120
      };
      localStorage.setItem(`macdlmkii-preset-${index}`, JSON.stringify(snapshot));
    });
  }, [buildDelayDefaults, buildReverbDefaults, factorySeeds]);

  useEffect(() => {
    seedFactoryPresets();
  }, [seedFactoryPresets]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('dl4mkii-preset-bank');
    if (stored) return;
    const tapIndex = tapSubdivisions.findIndex((entry) => entry.value === 64) || 0;
    const delayDefaults = buildDelayDefaults();
    const reverbDefaults = buildReverbDefaults();
    const base = Array.from({ length: 128 }, (_, idx) => ({
      id: idx,
      name: `Preset ${idx + 1}`,
      tags: [],
      description: '',
      parameters: {
        time: 64,
        tweak: 64,
        tweez: 64,
        mix: 64,
        repeats: 64,
        delayType: 'MkII Delay',
        reverbType: undefined
      },
      lastModified: new Date().toISOString(),
      isEmpty: true,
      snapshot: {
        mode: 'MkII Delay' as Mode,
        detent: 0,
        reverbDetent: 0,
        delayControlValues: { ...delayDefaults },
        reverbControlValues: { ...reverbDefaults },
        tapSubdivisionIndex: tapIndex,
        tapBpm: 120
      }
    }));
    factorySeeds.forEach(({ slot, name, detent, reverbDetent, description }) => {
      const snapshot: PresetSnapshot = {
        mode: 'MkII Delay',
        detent,
        reverbDetent,
        delayControlValues: { ...delayDefaults },
        reverbControlValues: { ...reverbDefaults },
        tapSubdivisionIndex: tapIndex,
        tapBpm: 120
      };
      if (base[slot]) {
        base[slot] = {
          ...base[slot],
          name,
          description: description ?? '',
          isEmpty: false,
          parameters: {
            ...base[slot].parameters,
            delayType: 'MkII Delay',
            reverbType: 'Secret Reverb'
          },
          snapshot
        };
      }
    });
    presetBankActions.replaceBank(base as any);
  }, [buildDelayDefaults, buildReverbDefaults, factorySeeds]);

  const buildPresetSnapshot = useCallback((): PresetSnapshot => {
    return {
      mode,
      detent: currentDetent,
      reverbDetent,
      delayControlValues,
      reverbControlValues,
      tapSubdivisionIndex,
      tapBpm
    };
  }, [
    currentDetent,
    delayControlValues,
    mode,
    reverbControlValues,
    reverbDetent,
    tapBpm,
    tapSubdivisionIndex
  ]);

  useEffect(() => {
    const current = buildPresetSnapshot();
    setPresetDirty(activeBaseline ? !snapshotsEqual(current, activeBaseline) : false);
  }, [
    activeBaseline,
    buildPresetSnapshot,
    currentDetent,
    delayControlValues,
    mode,
    reverbControlValues,
    reverbDetent,
    tapSubdivisionIndex,
    tapBpm
  ]);

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

  const logMidi = useCallback((entry: { ts: number; source: string; type: 'pc'; program: number } | { ts: number; source: string; type: 'cc'; control: number; value: number }) => {
    const summary =
      entry.type === 'pc'
        ? `Program Change #${entry.program + 1}`
        : `CC ${entry.control} -> ${entry.value}`;
    logMidiMessage({
      direction: 'out',
      type: entry.type === 'pc' ? 'pc' : 'cc',
      summary,
      detail: entry.source
    });
  }, []);

  const sendProgramChangeLogged = useCallback(
    async (program: number, source: string) => {
      logMidi({ ts: Date.now(), source, type: 'pc', program });
      await sendProgramChange(program);
    },
    [logMidi, sendProgramChange]
  );

  const sendCCLogged = useCallback(
    async (control: number, value: number, source: string) => {
      logMidi({ ts: Date.now(), source, type: 'cc', control, value });
      await sendCC(control, value);
    },
    [logMidi, sendCC]
  );

  const sendModelSelectLogged = useCallback(
    async (mode: Mode, detent: number, source: string) => {
      const value = modelValueForMode(mode, detent);
      if (mode === 'Secret Reverb') {
        logMidi({ ts: Date.now(), source, type: 'cc', control: midiCC.reverbSelected, value });
      } else {
        logMidi({
          ts: Date.now(),
          source,
          type: 'cc',
          control: midiCC.looperMode,
          value: value === 30 ? 64 : 0
        });
        logMidi({ ts: Date.now(), source, type: 'cc', control: midiCC.delaySelected, value });
      }
      await sendModelSelect(mode, detent);
    },
    [logMidi, sendModelSelect]
  );

  const handleReverbDetentChange = useCallback(
    async (next: number) => {
      setReverbDetent(next);
      if (!midiReady || selectedPort === null) return;
      if (Date.now() < suppressSendsUntilRef.current) return;
      await sendModelSelectLogged('Secret Reverb', next, 'reverb-detent');
    },
    [midiReady, selectedPort, sendModelSelectLogged]
  );

  const sendAllControls = useCallback(
    async (source: string) => {
      if (!midiReady || selectedPort === null) return;
      const delayValues = delayControlValues[mode] || {};
      const reverbValues = reverbControlValues;

      const delaySends = delayControls.map((ctrl) => {
        if (ctrl.id === 'time' && tapModeActive) {
          const tapValue = tapSubdivisions[tapSubdivisionIndex]?.value ?? 64;
          return sendCCLogged(midiCC.delayNotes, tapValue, source);
        }
        const val = Math.round(delayValues[ctrl.id] ?? 64);
        return sendCCLogged(ctrl.cc, val, source);
      });

      const reverbSends = reverbControls.map((ctrl) =>
        sendCCLogged(ctrl.cc, Math.round(reverbValues[ctrl.id] ?? 64), source)
      );

      await Promise.all([...delaySends, ...reverbSends]);
    },
    [
      delayControlValues,
      mode,
      reverbControlValues,
      midiReady,
      selectedPort,
      sendCCLogged,
      tapModeActive,
      tapSubdivisionIndex
    ]
  );

  const blinkFootswitch = useCallback(async (id: 'A' | 'B' | 'C') => {
    if (blinkLockRef.current) return;
    blinkLockRef.current = true;
    const cycles = 4;
    const intervalMs = 500;
    try {
      for (let i = 0; i < cycles; i += 1) {
        setFootswitchStatus((prev) => ({ ...prev, [id]: 'off' }));
        await sleep(intervalMs);
        setFootswitchStatus((prev) => ({ ...prev, [id]: 'on' }));
        await sleep(intervalMs);
      }
    } finally {
      blinkLockRef.current = false;
    }
  }, []);

  const applyPresetSnapshot = useCallback(
    async (
      snapshot: PresetSnapshot,
      presetIndex: number | null = null,
      programOverride?: number,
      opts?: { sendProgram?: boolean; sendControls?: boolean; source?: string }
    ) => {
      const sendProgram = opts?.sendProgram !== false;
      const sendControls = opts?.sendControls !== false;
      const source = opts?.source ?? 'preset-apply';
      setMode(snapshot.mode);
      setDetentForMode(snapshot.mode, snapshot.detent);
      setReverbDetent(typeof snapshot.reverbDetent === 'number' ? snapshot.reverbDetent : 0);
      setDelayControlValues(snapshot.delayControlValues);
      setReverbControlValues(snapshot.reverbControlValues);
      setTapSubdivisionIndex(snapshot.tapSubdivisionIndex);
      setTapBpm(snapshot.tapBpm);
      setTapModeActive(true);
      const effectiveProgram = programOverride ?? presetIndex;
      setActivePresetIndex(effectiveProgram ?? null);
      setActiveBaseline(snapshot);
      const activeId = effectiveProgram === null || effectiveProgram === undefined ? null : effectiveProgram % 3;
      setFootswitchStatus({
        A: activeId === 0 ? 'on' : 'off',
        B: activeId === 1 ? 'on' : 'off',
        C: activeId === 2 ? 'on' : 'off',
        Tap: 'off'
      });
      suppressSendsUntilRef.current = Date.now() + 1000;
      if (midiReady && selectedPort !== null) {
        if (sendProgram && typeof effectiveProgram === 'number') {
          await sendProgramChangeLogged(effectiveProgram, source);
        }
        if (sendControls) {
          await sendCCLogged(midiCC.presetBypass, 64, source);
          await sendModelSelectLogged(snapshot.mode, snapshot.detent, source);
          await sendModelSelectLogged('Secret Reverb', snapshot.reverbDetent, source);
          await sendAllControls(source);
        }
      }
      if (effectiveProgram === 0) {
        await blinkFootswitch('A');
      }
    },
    [
      blinkFootswitch,
      midiReady,
      selectedPort,
      sendAllControls,
      sendModelSelectLogged,
      sendProgramChangeLogged,
      setDetentForMode,
      sendCCLogged
    ]
  );

  // Legacy library handlers removed in favor of preset bank

  useKeyboardShortcuts({
    onModeChange: setMode,
    onDelayStep: stepDelayDetent,
    onReverbStep: stepReverbDetent,
    onHelpToggle: () => setShowHelp((prev) => !prev)
  });

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if (!searchInputRef.current) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        searchInputRef.current.focus();
      }
    };
    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, []);

  const loadPresetFromStorage = useCallback(
    async (
      index: number,
      options?: { programOverride?: number; sendProgram?: boolean; source?: string }
    ) => {
      if (typeof window === 'undefined') return false;
      const raw = localStorage.getItem(`macdlmkii-preset-${index}`);
      if (!raw) return false;
      try {
        const snapshot: PresetSnapshot = JSON.parse(raw);
        const program = options?.programOverride ?? index;
        suppressSendsUntilRef.current = Date.now() + 1000;
        await applyPresetSnapshot(snapshot, index, program, {
          sendProgram: options?.sendProgram !== false,
          sendControls: true,
          source: options?.source ?? 'preset-apply'
        });
        return true;
      } catch (error) {
        console.warn('Failed to load preset snapshot', error);
        return false;
      }
    },
    [applyPresetSnapshot]
  );

  const setActivePreset = useCallback(
    async (index: number, programOverride?: number) => {
      // Footswitch A should map to program 0; allow optional override.
      const program = Math.max(0, Math.min(127, programOverride ?? index));
      const loaded = await loadPresetFromStorage(index, {
        programOverride: program,
        sendProgram: true,
        source: 'footswitch'
      });
      if (loaded) return;

      suppressSendsUntilRef.current = Date.now() + 1000;
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

      if (midiReady && selectedPort !== null) {
        await sendProgramChangeLogged(program, 'footswitch');
        await sendCCLogged(midiCC.presetBypass, 64, 'footswitch');
        await sendAllControls('footswitch');
      }

      const activeId = program % 3;
      setFootswitchStatus({
        A: activeId === 0 ? 'on' : 'off',
        B: activeId === 1 ? 'on' : 'off',
        C: activeId === 2 ? 'on' : 'off',
        Tap: 'off'
      });
      const snapshot: PresetSnapshot = {
        mode,
        detent: currentDetent,
        reverbDetent,
        delayControlValues,
        reverbControlValues,
        tapSubdivisionIndex,
        tapBpm
      };
      setActivePresetIndex(index);
      setActiveBaseline(snapshot);
      presetBankActions.select(index);
      presetBankActions.updatePreset(index, (prev) => ({
        ...prev,
        parameters: {
          time: delayControlValues[mode].time ?? 64,
          tweak: delayControlValues[mode].tweak ?? 64,
          tweez: delayControlValues[mode].tweez ?? 64,
          mix: delayControlValues[mode].mix ?? 64,
          repeats: delayControlValues[mode].repeats ?? 64,
          delayType: currentEffect?.model ?? mode,
          reverbType: currentReverbEffect?.model
        },
        snapshot,
        isEmpty: false,
        lastModified: new Date().toISOString()
      }));
      if (activeId === 0) {
        await blinkFootswitch('A');
      }
    },
    [
      blinkFootswitch,
      loadPresetFromStorage,
      midiReady,
      mode,
      sendAllControls,
      selectedPort,
      sendCCLogged,
      sendProgramChangeLogged,
      currentDetent,
      reverbDetent,
      delayControlValues,
      reverbControlValues,
      tapSubdivisionIndex,
      tapBpm,
      presetBankActions,
      currentEffect,
      currentReverbEffect
    ]
  );

  const toggleBypass = useCallback(async (nextStatus: 'on' | 'dim') => {
    if (!midiReady || selectedPort === null) return;
    const value = nextStatus === 'dim' ? 0 : 64;
    await sendCCLogged(midiCC.presetBypass, value, 'bypass');
  }, [midiReady, selectedPort, sendCCLogged]);

  const saveActivePreset = useCallback(() => {
    if (activePreset === null) return false;
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
      showToast(`Preset ${activePreset + 1} saved`, 'ok');
      setActiveBaseline(snapshot);
      return true;
    } catch (error) {
      showToast('Failed to save preset', 'error');
      return false;
    }
  }, [
    activePreset,
    currentDetent,
    delayControlValues,
    mode,
    reverbDetent,
    reverbControlValues,
    showToast,
    tapBpm,
    tapSubdivisionIndex
  ]);

  const handleFootswitch = useCallback(
    async (id: string) => {
      if (blinkLockRef.current) return;
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
        await setActivePreset(idx, idx);
        return;
      }

      if (id === 'Tap') {
        const nextIdx = (tapSubdivisionIndex + 1) % tapSubdivisions.length;
        setTapSubdivisionIndex(nextIdx);
        setTapModeActive(true);
        setDelayControlValues((prev) => ({
          ...prev,
          [mode]: {
            ...prev[mode],
            time: tapSubdivisions[nextIdx]?.value ?? 64
          }
        }));

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

        await sendCCLogged(midiCC.delayNotes, tapSubdivisions[nextIdx].value, 'tap');
        await sendMessages(
          buildTapMessages(tapSubdivisions[nextIdx].value)
        );
        tapBlink.trigger(tapBpm);
        return;
      }
    },
    [
      footswitchStatus,
      midiReady,
      selectedPort,
      sendCCLogged,
      sendMessages,
      setActivePreset,
      setDelayControlValues,
      mode,
      tapBlink,
      tapBpm,
      tapSubdivisionIndex,
      toggleBypass
    ]
  );

  const handleFootswitchHold = useCallback(
    async (id: string) => {
      if (blinkLockRef.current) return;
      if (!['A', 'B', 'C'].includes(id)) return;
      const status = footswitchStatus[id as 'A' | 'B' | 'C'];
      if (status !== 'on') return;
      const saved = saveActivePreset();
      if (saved) {
        await blinkFootswitch(id as 'A' | 'B' | 'C');
      }
    },
    [blinkFootswitch, footswitchStatus, saveActivePreset]
  );

  const stepPreset = useCallback(
    async (delta: number) => {
      const current = activePreset === null ? -1 : activePreset;
      const next = Math.max(0, Math.min(127, current + delta));
      await setActivePreset(next);
    },
    [activePreset, setActivePreset]
  );

  const stepChannel = useCallback(
    (delta: number) => {
      setChannel(channel + delta);
    },
    [channel, setChannel]
  );

  const handleControlChange = useCallback(
    async (id: string, value: number, domain: 'delay' | 'reverb') => {
      const rounded = Math.round(value);
      const canSend = midiReady && selectedPort !== null;
      if (domain === 'delay') {
        if (id === 'time' && tapModeActive) {
          const idx = tapSubdivisions.findIndex((entry) => entry.value === rounded);
          if (idx >= 0) {
            setTapSubdivisionIndex(idx);
            setDelayControlValues((prev) => ({
              ...prev,
              [mode]: {
                ...prev[mode],
                [id]: rounded
              }
            }));
            if (canSend) await sendCCLogged(midiCC.delayNotes, rounded, 'knob-change');
            return;
          }
          setTapModeActive(false);
          setDelayControlValues((prev) => ({
            ...prev,
            [mode]: {
              ...prev[mode],
              [id]: rounded
            }
          }));
          if (canSend) await sendCCLogged(midiCC.delayTime, rounded, 'knob-change');
          return;
        }
        setDelayControlValues((prev) => ({
          ...prev,
          [mode]: {
            ...prev[mode],
            [id]: rounded
          }
        }));
      } else {
        setReverbControlValues((prev) => ({
          ...prev,
          [id]: rounded
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
      if (cc !== undefined && canSend) {
        await sendCCLogged(cc, rounded, 'knob-change');
      }
    },
    [
      midiReady,
      mode,
      selectedPort,
      sendCCLogged,
      tapModeActive,
      tapSubdivisionIndex
    ]
  );

  const syncToHardware = useCallback(async () => {
    if (!currentEffect || !midiReady || selectedPort === null) return;
    if (Date.now() < suppressSendsUntilRef.current) return;
    await sendModelSelectLogged(mode, currentDetent, 'sync');
    await sendModelSelectLogged('Secret Reverb', reverbDetent, 'sync');
    await sendAllControls('sync');
  }, [
    currentDetent,
    currentEffect,
    midiReady,
    mode,
    reverbDetent,
    selectedPort,
    sendAllControls,
    sendModelSelectLogged
  ]);

  // Skip automatic sync on ready; manual sync happens on port change selection.

  // No auto-send on reverb detent; handled explicitly in handleReverbDetentChange.

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('macdlmkii-ui');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.mode) setMode(parsed.mode);
      if (typeof parsed.currentDetent === 'number') {
        setDetentForMode(parsed.mode ?? mode, parsed.currentDetent);
      }
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
      activePreset,
      mode,
      currentDetent
    };
    localStorage.setItem('macdlmkii-ui', JSON.stringify(snapshot));
  }, [activePreset, currentDetent, delayControlValues, mode, reverbControlValues, tapSubdivisionIndex, tapBpm, reverbDetent]);

  useEffect(() => {
    if (midiError) {
      const id = ++toastIdRef.current;
      setToast({ id, message: midiError, kind: 'error' });
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

  const handleSelectEffect = useCallback(
    (effect: EffectInfo) => {
      if (effect.mode === 'Secret Reverb') {
        setReverbDetent(effect.detent);
        return;
      }
      setMode(effect.mode);
      setDetentForMode(effect.mode, effect.detent);
    },
    [setDetentForMode, setMode]
  );

  useEffect(() => {
    if (midiReady && selectedPort !== null) {
      midiConnectionService.connect();
      return () => {
        midiConnectionService.disconnect();
      };
    }
    midiConnectionService.disconnect();
    return undefined;
  }, [midiReady, selectedPort]);

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
          <div className={styles.pedalRow}>
            <section className={styles.pedalWrap}>
              <Pedal
                mode={mode}
                detent={currentDetent}
                reverbDetent={reverbDetent}
                onModeChange={setMode}
                onDetentChange={handleDetentChange}
                onReverbDetentChange={handleReverbDetentChange}
                onFootswitchPress={handleFootswitch}
                onFootswitchHold={handleFootswitchHold}
                footswitchStatus={footswitchStatus}
                onControlChange={handleControlChange}
                controlValues={{
                  delay: delayControlValues[mode],
                  reverb: reverbControlValues
                }}
                controlLabels={controlLabels}
              />
            </section>
            <aside className={styles.librarySide}>
              <PresetBankPanel
                onLoad={(id) => setActivePreset(id)}
                onSaveCurrent={() => {
                  if (saveActivePreset()) {
                    setActiveBaseline(buildPresetSnapshot());
                  }
                }}
                presetDirty={presetDirty}
                onRename={() => {}}
                onDuplicate={() => {}}
                onDelete={() => {}}
                onUpdateDescription={() => {}}
                onUpdateTags={() => {}}
              />
            </aside>
          </div>

          <section className={styles.infoColumn}>
            <div className={styles.stack}>
              <LibraryPanel
                filteredEffects={filteredEffects}
                mode={mode}
                currentDetent={currentDetent}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSearchInputRef={(ref) => {
                  searchInputRef.current = ref;
                }}
                onSelectEffect={handleSelectEffect}
                qaStats={qaStats}
                showQa={!!loadingError}
                loading={isLoading}
              />

              <ManualPane delayEffect={currentEffect} reverbEffect={currentReverbEffect} />

              <div className={styles.panelCard}>
                <h3 className={styles.panelTitle}>Parameters</h3>
                <ParameterDisplay
                  mode={mode}
                  modelName={currentEffect?.model ?? null}
                  values={delayControlValues[mode] ?? {}}
                  altActive={mode === 'Legacy Delay'}
                />
              </div>

              {presetDirty && (
                <div className={styles.dirtyBar}>
                  <span>Unsaved changes</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (saveActivePreset()) {
                        setActiveBaseline(buildPresetSnapshot());
                      }
                    }}
                    disabled={activePreset === null}
                  >
                    Save preset
                  </button>
                </div>
              )}
            </div>

            <div className={styles.infoBadge}>
              <a
                className={styles.infoButton}
                href="https://github.com/DavidMolTor/DL4II_Control"
                target="_blank"
                rel="noreferrer"
                aria-label="Project information"
              >
                i
              </a>
              <div className={styles.infoCard}>
                <div>Developed by David Molina Toro</div>
                <div>GNU General Public License</div>
                <div>This software uses Leslie Sanford&apos;s MIDI Toolkit</div>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.midiBar} aria-live="polite">
          <MidiHealthIndicator showMeta />
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
        <div className={styles.midiStepper}>
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
          <div className={styles.stepButtons}>
            <button
              type="button"
              className={styles.stepButton}
              onClick={() => stepChannel(1)}
              disabled={!midiReady}
              aria-label="Increase MIDI channel"
            >
              ▲
            </button>
            <button
              type="button"
              className={styles.stepButton}
              onClick={() => stepChannel(-1)}
              disabled={!midiReady}
              aria-label="Decrease MIDI channel"
            >
              ▼
            </button>
          </div>
        </div>
        <div className={styles.midiStepper}>
          <input
            type="number"
            className={styles.midiPreset}
            min={1}
            max={128}
            value={activePreset === null ? '' : activePreset + 1}
            onChange={(event) => {
              if (event.target.value === '') return;
              const next = Number(event.target.value);
              if (!Number.isFinite(next)) return;
              const clamped = Math.max(1, Math.min(128, Math.floor(next)));
              setActivePreset(clamped - 1);
            }}
            aria-label="Preset number"
          />
          <div className={styles.stepButtons}>
            <button
              type="button"
              className={styles.stepButton}
              onClick={() => stepPreset(1)}
              aria-label="Increase preset"
            >
              ▲
            </button>
            <button
              type="button"
              className={styles.stepButton}
              onClick={() => stepPreset(-1)}
              aria-label="Decrease preset"
            >
              ▼
            </button>
          </div>
        </div>
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
        {process.env.NODE_ENV === 'development' && (
          <button
            type="button"
            className={styles.midiRefresh}
            onClick={() => setShowDebugger((prev) => !prev)}
            aria-pressed={showDebugger}
          >
            Debug
          </button>
        )}
        <div className={styles.midiStepper}>
          <input
            type="number"
            className={styles.midiPreset}
            min={30}
            max={300}
            value={clockSendBpm}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (!Number.isFinite(next)) return;
              const clamped = Math.max(30, Math.min(300, Math.floor(next)));
              setClockSendBpm(clamped);
            }}
            aria-label="Clock send BPM"
          />
          <button
            type="button"
            className={styles.midiRefresh}
            onClick={() =>
              clock.sendEnabled
                ? clock.stopSend()
                : clock.startSend(clockSendBpm)
            }
            disabled={!midiReady || selectedPort === null}
            aria-pressed={clock.sendEnabled}
        >
          {clock.sendEnabled ? 'Send Clock: On' : 'Send Clock'}
        </button>
        </div>
        {midiError && (
          <span className={styles.midiError}>
            {midiErrorLabel ?? midiError}
          </span>
        )}
      </div>
      {showDebugger && process.env.NODE_ENV === 'development' && (
        <MidiDebuggerPanel onClose={() => setShowDebugger(false)} />
      )}
    </main>
  </div>
  </ErrorBoundary>
);
};

export default App;

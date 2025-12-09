import { useCallback, useEffect, useMemo, useState } from 'react';
import Knob from './components/Knob';
import ModeSwitch from './components/ModeSwitch';
import EffectInfo from './components/EffectInfo';
import SearchBox from './components/SearchBox';
import type { EffectInfo as EffectInfoType, Mode } from './data/commonParams';
import { modes, notSpecified } from './data/commonParams';
import { clampDetent, detentsByMode, mergeEffects, skeletonEffects } from './data/effects';

const App = () => {
  const [mode, setMode] = useState<Mode>('MkII Delay');
  const [detentByMode, setDetentByMode] = useState<Record<Mode, number>>({
    'MkII Delay': 0,
    'Legacy Delay': 0,
    'Secret Reverb': 0
  });
  const [effects, setEffects] = useState<EffectInfoType[]>(skeletonEffects);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState<HTMLInputElement | null>(null);
  const [showQa, setShowQa] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadEffects = async () => {
      try {
        const response = await fetch(new URL('./data/effects.full.json', import.meta.url).href);
        if (!response.ok) throw new Error(`Failed to load effects.full.json (${response.status})`);
        const payload = await response.json();
        if (!cancelled) setEffects(mergeEffects(payload));
      } catch (error) {
        console.warn('Falling back to skeleton effects', error);
        if (!cancelled) setEffects(mergeEffects([]));
      }
    };

    loadEffects();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentDetent = detentByMode[mode];

  const filteredEffects = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return effects;
    return effects.filter((effect) => {
      const corpus = `${effect.model} ${effect.inspiration} ${effect.description}`.toLowerCase();
      return corpus.includes(q);
    });
  }, [effects, searchTerm]);

  const currentEffect = filteredEffects.find(
    (effect) => effect.mode === mode && effect.detent === currentDetent
  );

  const updateDetent = useCallback(
    (next: number) => {
      setDetentByMode((prev) => ({ ...prev, [mode]: clampDetent(mode, next) }));
    },
    [mode]
  );

  const qaStats = useMemo(() => {
    const countsByMode = modes.map((entry) => {
      const totalForMode = effects.filter((effect) => effect.mode === entry).length;
      return {
        mode: entry,
        count: totalForMode,
        expected: detentsByMode[entry].length
      };
    });

    let missingInspiration = 0;
    let missingDescription = 0;
    let missingTweakBehavior = 0;
    let missingTweezBehavior = 0;
    let missingRange = 0;
    let missingNotes = 0;
    let notSpecifiedCount = 0;

    effects.forEach((effect) => {
      if (effect.inspiration === notSpecified) missingInspiration += 1;
      if (effect.description === notSpecified) missingDescription += 1;
      if (effect.tweak.behaviorCCW === notSpecified || effect.tweak.behaviorCW === notSpecified) {
        missingTweakBehavior += 1;
      }
      if (effect.tweez.behaviorCCW === notSpecified || effect.tweez.behaviorCW === notSpecified) {
        missingTweezBehavior += 1;
      }
      if (effect.rangeNote === notSpecified) missingRange += 1;
      if (!effect.notes.length || effect.notes.every((note) => note === notSpecified)) missingNotes += 1;

      [
        effect.inspiration,
        effect.description,
        effect.tweak.behaviorCCW,
        effect.tweak.behaviorCW,
        effect.tweez.behaviorCCW,
        effect.tweez.behaviorCW,
        effect.rangeNote,
        ...effect.notes
      ].forEach((value) => {
        if (value === notSpecified) notSpecifiedCount += 1;
      });
    });

    return {
      countsByMode,
      missing: {
        inspiration: missingInspiration,
        description: missingDescription,
        tweak: missingTweakBehavior,
        tweez: missingTweezBehavior,
        range: missingRange,
        notes: missingNotes,
        totalNotSpecified: notSpecifiedCount
      }
    };
  }, [effects]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        searchInput?.focus();
        return;
      }

      if (['1', '2', '3'].includes(event.key)) {
        const nextMode = modes[Number(event.key) - 1];
        if (nextMode) setMode(nextMode);
        return;
      }

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        const delta = event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 1;
        updateDetent(currentDetent + delta);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentDetent, searchInput, updateDetent]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-8 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="absolute right-[-10%] top-24 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
      </div>

      <main className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-lime-100">
              <span className="rounded-full bg-lime-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-lime-100 ring-1 ring-lime-300/40">
                DL4 MkII Brain
              </span>
              <span className="text-slate-300">Pedal-style navigator</span>
            </div>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-4xl">
              Faceplate view: dial detents like the real hardware.
            </h1>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
              Use the selector ring and footswitch row below to stay oriented. Search and QA stay
              tucked to the side so the “pedal” remains the focus.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 shadow-inner">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400">Mode</div>
                <div className="text-lg font-semibold text-glow">{mode}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400">Detent</div>
                <div className="text-lg font-semibold">#{currentDetent + 1}</div>
              </div>
              <button
                type="button"
                onClick={() => setShowQa((prev) => !prev)}
                className="rounded-xl border border-lime-300/40 bg-lime-400/10 px-3 py-2 text-xs font-semibold text-lime-100 transition hover:border-lime-300 hover:bg-lime-300/20"
              >
                {showQa ? 'Hide data QA' : 'Show data QA'}
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.8fr_1.2fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-black/40 bg-gradient-to-b from-[#1f8f45] via-[#156b33] to-[#0d4a23] p-6 shadow-[0_40px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-0 h-24 w-40 -translate-x-1/2 rounded-full bg-white/10 blur-3xl opacity-40" />
              <div className="absolute inset-0 border border-white/5 rounded-[32px]" />
            </div>

            <div className="relative grid gap-4 lg:grid-cols-[360px_1fr]">
              <div className="rounded-2xl border border-black/30 bg-black/15 p-5 shadow-inner">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-lime-100">
                      Model Selector
                    </p>
                    <p className="text-lg font-semibold text-slate-50">{mode}</p>
                  </div>
                  <span className="rounded-full bg-lime-400/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-lime-100 ring-1 ring-lime-200/40">
                    Live
                  </span>
                </div>
                <div className="mt-3">
                  <ModeSwitch value={mode} onChange={setMode} />
                </div>
                <div className="mt-6">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute h-80 w-80 rounded-full border border-black/40 bg-gradient-to-b from-black/30 via-transparent to-black/50 shadow-[inset_0_24px_60px_rgba(0,0,0,0.45)]" />
                    <div className="relative">
                      <Knob mode={mode} detent={currentDetent} onDetentChange={updateDetent} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-black/30 bg-black/10 p-4 text-sm shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] uppercase tracking-wide text-slate-100">
                      Detent snapshot
                    </div>
                    <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] uppercase tracking-wide text-lime-100 ring-1 ring-lime-300/40">
                      {currentEffect ? currentEffect.model : 'No model'}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-200">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wide text-slate-400">
                        Inspiration
                      </div>
                      <div className="text-sm text-slate-100">
                        {currentEffect?.inspiration ?? '–'}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wide text-slate-400">Range</div>
                      <div className="text-sm text-slate-100">
                        {currentEffect?.rangeNote ?? '–'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-200">
                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wide text-slate-400">
                        Tweak
                      </div>
                      <div className="text-sm text-slate-100">{currentEffect?.tweak.label ?? '–'}</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wide text-slate-400">
                        Tweez
                      </div>
                      <div className="text-sm text-slate-100">{currentEffect?.tweez.label ?? '–'}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/30 bg-black/15 p-4 shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-200">
                    <span>Footswitch Row</span>
                    <span className="rounded-full bg-lime-400/20 px-2 py-1 text-[10px] font-semibold text-lime-100 ring-1 ring-lime-300/40">
                      Visual only
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-3">
                    {[
                      { label: 'A', hint: 'Preset A' },
                      { label: 'B', hint: 'Preset B' },
                      { label: 'C', hint: 'Preset C' },
                      { label: 'Tap', hint: 'Tempo / 1-Switch Loop' }
                    ].map((sw) => (
                      <div key={sw.label} className="flex flex-col items-center gap-2">
                        <button
                          type="button"
                          className="h-12 w-12 rounded-full border border-black/40 bg-gradient-to-b from-slate-200 to-slate-500 shadow-[inset_0_6px_10px_rgba(255,255,255,0.4),0_10px_18px_rgba(0,0,0,0.45)] transition active:translate-y-[1px] active:shadow-[inset_0_6px_10px_rgba(255,255,255,0.2),0_8px_14px_rgba(0,0,0,0.35)]"
                          aria-label={`${sw.label} footswitch`}
                        />
                        <span className="rounded-full bg-black/30 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-200">
                          {sw.label}
                        </span>
                        <span className="text-[10px] text-slate-200/80">{sw.hint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <EffectInfo effect={currentEffect} />
            <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-5 shadow-xl shadow-black/40 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-300">
                <span className="font-semibold text-slate-100">Library & Search</span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
                  {filteredEffects.length} selectable
                </span>
              </div>
              <div className="mt-4">
                <SearchBox
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onFocusedShortcut={setSearchInput}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <span>Drag/scroll knob for detents</span>
                <span>Arrow keys move detents</span>
                <span>Numbers 1/2/3 swap modes</span>
                <span>Click cards to jump</span>
              </div>

              {showQa && (
                <div className="mt-4 rounded-xl border border-lime-300/30 bg-lime-400/5 p-4 text-sm text-slate-200">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-lime-100">Data QA</p>
                    <span className="text-xs text-lime-100/80">
                      Not specified: {qaStats.missing.totalNotSpecified}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-slate-200/80">
                    {qaStats.countsByMode.map((entry) => (
                      <div key={entry.mode} className="flex items-center justify-between">
                        <span>{entry.mode}</span>
                        <span>
                          {entry.count} models (expected {entry.expected})
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-200/80">
                    <span>Inspiration missing: {qaStats.missing.inspiration}</span>
                    <span>Description missing: {qaStats.missing.description}</span>
                    <span>Tweak behavior missing: {qaStats.missing.tweak}</span>
                    <span>Tweez behavior missing: {qaStats.missing.tweez}</span>
                    <span>Range note missing: {qaStats.missing.range}</span>
                    <span>Notes missing: {qaStats.missing.notes}</span>
                  </div>
                </div>
              )}

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {filteredEffects.map((effect) => {
                  const isActive = effect.mode === mode && effect.detent === currentDetent;
                  return (
                    <button
                      key={`${effect.mode}-${effect.detent}`}
                      type="button"
                      onClick={() => {
                        setMode(effect.mode);
                        setDetentByMode((prev) => ({ ...prev, [effect.mode]: effect.detent }));
                      }}
                      className={`group rounded-xl border px-3 py-3 text-left transition ${
                        isActive
                          ? 'border-glow bg-slate-900/90 shadow-lg shadow-lime-300/30'
                          : 'border-white/10 bg-slate-950/70 hover:border-glow/60 hover:bg-slate-900/70'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
                        <span>{effect.mode}</span>
                        <span>Detent {effect.detent + 1}</span>
                      </div>
                      <div className="mt-1 text-lg font-semibold text-slate-100">
                        {effect.model}
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>{effect.inspiration}</span>
                        {isActive && (
                          <span className="rounded-full bg-lime-400/15 px-2 py-0.5 text-[11px] font-semibold text-lime-100 ring-1 ring-lime-200/60">
                            Active
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;

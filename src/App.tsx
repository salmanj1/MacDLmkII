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
    <div className="safe-padded relative min-h-screen overflow-hidden bg-[#050805] text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6%] top-0 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="absolute right-[-12%] top-10 h-80 w-80 rounded-full bg-lime-200/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-[#050805] to-transparent" />
        <div className="absolute inset-x-0 top-10 h-px bg-gradient-to-r from-transparent via-lime-300/40 to-transparent" />
      </div>

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-lime-100/90">
              <span className="rounded-full bg-lime-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-lime-100 ring-1 ring-lime-300/50">
                DL4 MkII Brain
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-200/90">
                Pedal faceplate view
              </span>
            </div>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-4xl">
              Twist the selector, stomp the row — just like the green box.
            </h1>
            <p className="max-w-3xl text-sm text-slate-300 sm:text-base">
              This layout mimics the DL4 MkII faceplate: left cluster for the model selector knob,
              center light strip for feedback, and a four-switch rail at the bottom. Use search and
              QA on the right without losing the pedal vibe.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowQa((prev) => !prev)}
            className="rounded-xl border border-lime-300/40 bg-lime-400/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-lime-100 transition hover:border-lime-300 hover:bg-lime-300/20"
          >
            {showQa ? 'Hide data QA' : 'Show data QA'}
          </button>
        </header>

        <section className="grid gap-8 xl:grid-cols-[1.2fr_0.95fr]">
          <div className="relative overflow-hidden rounded-[44px] border border-black/60 bg-[radial-gradient(circle_at_16%_16%,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_82%_10%,rgba(255,255,255,0.08),transparent_26%),linear-gradient(145deg,#2a8c3f,#0f4d25_38%,#0b2e17)] p-5 shadow-[0_40px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.5)] sm:p-7">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-5 rounded-[36px] border border-white/10 bg-gradient-to-r from-white/5 via-transparent to-white/5" />
              <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" />
              <div className="absolute inset-x-6 bottom-20 h-14 rounded-full bg-black/20 blur-2xl" />
              <div className="absolute left-6 top-6 h-2 w-2 rounded-full bg-black/60 ring-1 ring-white/20" />
              <div className="absolute right-6 top-6 h-2 w-2 rounded-full bg-black/60 ring-1 ring-white/20" />
            </div>

            <div className="relative flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/50 bg-black/20 px-4 py-3 text-xs uppercase tracking-[0.22em] text-lime-100 shadow-inner shadow-black/40 backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-lime-400/25 px-3 py-1 text-[10px] font-semibold ring-1 ring-lime-200/50">
                    Line 6 DL4 MkII
                  </span>
                  <span className="rounded-full bg-black/50 px-3 py-1 text-[10px] font-semibold text-lime-50 ring-1 ring-white/10">
                    Selector {currentDetent + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-100">
                  <span className="h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_10px_rgba(190,255,100,0.9)]" />
                  {mode}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
                <div className="rounded-3xl border border-black/40 bg-black/20 p-5 shadow-inner shadow-black/50 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-lime-100">
                        Model Selector
                      </p>
                      <p className="text-lg font-semibold text-slate-50">{mode}</p>
                    </div>
                    <span className="rounded-full bg-lime-400/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-lime-50 ring-1 ring-lime-200/60">
                      Live
                    </span>
                  </div>
                  <div className="mt-4">
                    <ModeSwitch value={mode} onChange={setMode} />
                  </div>
                  <div className="mt-6">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute h-80 w-80 rounded-full border border-black/50 bg-gradient-to-b from-black/25 via-transparent to-black/50 shadow-[inset_0_24px_60px_rgba(0,0,0,0.45)]" />
                      <div className="relative">
                        <Knob mode={mode} detent={currentDetent} onDetentChange={updateDetent} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11px] uppercase tracking-wide text-lime-100">
                        Detent Window
                      </div>
                      <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] uppercase tracking-wide text-lime-100 ring-1 ring-lime-300/40">
                        {currentEffect ? currentEffect.model : 'No model'}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-200">
                      <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                        <div className="text-[10px] uppercase tracking-wide text-slate-400">
                          Inspiration
                        </div>
                        <div className="text-sm text-slate-100">
                          {currentEffect?.inspiration ?? '–'}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                        <div className="text-[10px] uppercase tracking-wide text-slate-400">Range</div>
                        <div className="text-sm text-slate-100">
                          {currentEffect?.rangeNote ?? '–'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-200">
                      <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
                        <div className="text-[10px] uppercase tracking-wide text-slate-400">
                          Tweak
                        </div>
                        <div className="text-sm text-slate-100">
                          {currentEffect?.tweak.label ?? '–'}
                        </div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
                        <div className="text-[10px] uppercase tracking-wide text-slate-400">
                          Tweez
                        </div>
                        <div className="text-sm text-slate-100">
                          {currentEffect?.tweez.label ?? '–'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-black/40 bg-gradient-to-b from-black/25 via-black/10 to-black/30 p-4 shadow-inner shadow-black/50">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-200">
                      <span>Footswitch Rail</span>
                      <span className="rounded-full bg-lime-400/20 px-2 py-1 text-[10px] font-semibold text-lime-100 ring-1 ring-lime-300/40">
                        Visual only
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { label: 'A', hint: 'Preset A' },
                        { label: 'B', hint: 'Preset B' },
                        { label: 'C', hint: 'Preset C' },
                        { label: 'Tap', hint: 'Tempo / Loop' }
                      ].map((sw) => (
                        <div key={sw.label} className="flex flex-col items-center gap-2">
                          <button
                            type="button"
                            className="relative h-12 w-12 rounded-full border border-black/50 bg-gradient-to-b from-slate-100 via-slate-400 to-slate-700 shadow-[inset_0_6px_10px_rgba(255,255,255,0.45),0_10px_18px_rgba(0,0,0,0.55)] transition active:translate-y-[1px] active:shadow-[inset_0_6px_10px_rgba(255,255,255,0.2),0_8px_14px_rgba(0,0,0,0.4)]"
                            aria-label={`${sw.label} footswitch`}
                          >
                            <span className="absolute inset-2 rounded-full bg-gradient-to-b from-white/60 to-white/0 opacity-40" />
                          </button>
                          <span className="rounded-full bg-black/40 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-100 ring-1 ring-white/10">
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
          </div>

          <div className="flex flex-col gap-4">
            <EffectInfo effect={currentEffect} />
            <div className="rounded-3xl border border-white/5 bg-slate-900/70 p-5 shadow-xl shadow-black/40 backdrop-blur">
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
              <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-400 sm:grid-cols-2">
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

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
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="absolute right-[-12%] top-32 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
      </div>

      <main className="relative mx-auto flex max-w-6xl flex-col gap-7 px-6 py-10">
        <header className="rounded-3xl border border-white/5 bg-slate-900/70 p-6 shadow-xl shadow-black/40 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-lime-100">
                <span className="rounded-full bg-lime-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-lime-100 ring-1 ring-lime-300/40">
                  MacDL MkII
                </span>
                <span className="text-slate-300">DL4 MkII inspired navigator</span>
              </div>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-4xl">
                Meet the DL4 MkII brain: every mode, every detent, decoded.
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Browse the DL4 MkII library, jump between modes, and see what each knob position
                does before you reach for the pedal or the stage.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-950/70 p-4 text-sm text-slate-200 shadow-inner">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Mode</div>
                  <div className="text-lg font-semibold text-glow">{mode}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Detent</div>
                  <div className="text-lg font-semibold">#{currentDetent + 1}</div>
                </div>
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
          <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Mode swap', value: '1 · 2 · 3 keys' },
              { label: 'Detent travel', value: 'Drag · Scroll · Arrows' },
              { label: 'Search focus', value: 'Cmd/Ctrl + F' },
              { label: 'Card jump', value: 'Click a model to sync' }
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/5 bg-slate-950/50 px-4 py-3 text-slate-300"
              >
                <div className="text-xs uppercase tracking-wide text-slate-400">{item.label}</div>
                <div className="font-semibold text-slate-100">{item.value}</div>
              </div>
            ))}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-5 shadow-xl shadow-black/40 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Mode selector</p>
                  <p className="text-lg font-semibold text-slate-50">{mode}</p>
                </div>
                <span className="rounded-full bg-lime-400/15 px-3 py-1 text-xs font-semibold text-lime-100 ring-1 ring-lime-300/40">
                  Live knob
                </span>
              </div>
              <div className="mt-4">
                <ModeSwitch value={mode} onChange={setMode} />
              </div>
              <div className="mt-6">
                <Knob mode={mode} detent={currentDetent} onDetentChange={updateDetent} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-5 shadow-xl shadow-black/40 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-100">Library tools</p>
                  <p className="text-xs text-slate-400">Filter across {effects.length} entries.</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-300">
                  {filteredEffects.length} results
                </span>
              </div>
              <div className="mt-4">
                <SearchBox
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onFocusedShortcut={setSearchInput}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <span>Drag knob to snap detents</span>
                <span>Scroll wheel adjusts detent</span>
                <span>Arrow keys move detents</span>
                <span>Numbers 1/2/3 swap modes</span>
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
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <EffectInfo effect={currentEffect} />
            <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-5 shadow-xl shadow-black/40 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-300">
                <span className="font-semibold text-slate-100">Matching models</span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
                  {filteredEffects.length} selectable
                </span>
              </div>
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

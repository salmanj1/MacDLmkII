import { useCallback, useEffect, useMemo, useState } from 'react';
import Knob from './components/Knob';
import ModeSwitch from './components/ModeSwitch';
import EffectInfo from './components/EffectInfo';
import SearchBox from './components/SearchBox';
import type { EffectInfo as EffectInfoType, Mode } from './data/commonParams';
import { modes } from './data/commonParams';
import { clampDetent } from './data/selectorMaps';
import effectsSkeleton from './data/effects.skeleton.json';
import effectsFull from './data/effects.full.json';

const resolvedEffects: EffectInfoType[] = (effectsFull as EffectInfoType[]).length
  ? (effectsFull as EffectInfoType[])
  : (effectsSkeleton as EffectInfoType[]);

const App = () => {
  const [mode, setMode] = useState<Mode>('MkII Delay');
  const [detentByMode, setDetentByMode] = useState<Record<Mode, number>>({
    'MkII Delay': 0,
    'Legacy Delay': 0,
    'Secret Reverb': 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState<HTMLInputElement | null>(null);

  const currentDetent = detentByMode[mode];

  const filteredEffects = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return resolvedEffects;
    return resolvedEffects.filter((effect) => {
      const corpus = `${effect.model} ${effect.inspiration} ${effect.description}`.toLowerCase();
      return corpus.includes(q);
    });
  }, [searchTerm]);

  const currentEffect = filteredEffects.find(
    (effect) => effect.mode === mode && effect.detent === currentDetent
  );

  const updateDetent = useCallback(
    (next: number) => {
      setDetentByMode((prev) => ({ ...prev, [mode]: clampDetent(mode, next) }));
    },
    [mode]
  );

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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-glow drop-shadow">MacDL MkII</h1>
            <p className="text-sm text-slate-400">
              Mode switch (1/2/3), detent arrows, and ⌘F to focus search.
            </p>
          </div>
          <ModeSwitch value={mode} onChange={setMode} />
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col gap-4">
            <Knob mode={mode} detent={currentDetent} onDetentChange={updateDetent} />
            <SearchBox
              value={searchTerm}
              onChange={setSearchTerm}
              onFocusedShortcut={setSearchInput}
            />
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
              <p className="font-semibold text-slate-100">Controls</p>
              <ul className="mt-2 space-y-1 text-slate-400">
                <li>• Drag knob to snap detents</li>
                <li>• Scroll wheel adjusts detent</li>
                <li>• Arrow keys move detents</li>
                <li>• Number keys (1/2/3) swap modes</li>
                <li>• Cmd/Ctrl + F focuses search</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <EffectInfo effect={currentEffect} />
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Matching models</span>
                <span>{filteredEffects.length} results</span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {filteredEffects.map((effect) => (
                  <button
                    key={`${effect.mode}-${effect.detent}`}
                    type="button"
                    onClick={() => {
                      setMode(effect.mode);
                      setDetentByMode((prev) => ({ ...prev, [effect.mode]: effect.detent }));
                    }}
                    className={`rounded-lg border px-3 py-2 text-left transition ${
                      effect.mode === mode && effect.detent === currentDetent
                        ? 'border-glow bg-slate-900/70 shadow-cyan-500/30'
                        : 'border-slate-800 bg-slate-950/60 hover:border-glow/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                      <span>{effect.mode}</span>
                      <span>Detent {effect.detent + 1}</span>
                    </div>
                    <div className="text-lg font-semibold text-slate-100">{effect.model}</div>
                    <div className="text-sm text-slate-400">{effect.inspiration}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

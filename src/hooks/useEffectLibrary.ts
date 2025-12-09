import { useCallback, useEffect, useMemo, useState } from 'react';
import { modes, type EffectInfo, type Mode } from '../data/commonParams';
import { clampDetent, mergeEffects, skeletonEffects } from '../data/effects';

const initialDetentState = (): Record<Mode, number> =>
  modes.reduce(
    (acc, mode) => ({
      ...acc,
      [mode]: 0
    }),
    {} as Record<Mode, number>
  );

const filterEffects = (effects: EffectInfo[], searchTerm: string) => {
  const query = searchTerm.toLowerCase().trim();
  if (!query) return effects;

  return effects.filter((effect) => {
    const corpus =
      `${effect.model} ${effect.inspiration} ${effect.description}`.toLowerCase();
    return corpus.includes(query);
  });
};

const findCurrentEffect = (effects: EffectInfo[], mode: Mode, detent: number) =>
  effects.find((effect) => effect.mode === mode && effect.detent === detent);

const useEffectLibrary = () => {
  const [mode, setMode] = useState<Mode>('MkII Delay');
  const [detentByMode, setDetentByMode] =
    useState<Record<Mode, number>>(initialDetentState);
  const [effects, setEffects] = useState<EffectInfo[]>(skeletonEffects);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadEffects = async () => {
      try {
        const response = await fetch(
          new URL('../data/effects.full.json', import.meta.url).href
        );
        if (!response.ok)
          throw new Error(
            `Failed to load effects.full.json (${response.status})`
          );
        const payload = await response.json();
        if (!cancelled) {
          setEffects(mergeEffects(payload));
          setLoadingError(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.warn('Falling back to skeleton effects', error);
        if (!cancelled) {
          setEffects(mergeEffects([]));
          setLoadingError(
            'Using skeleton data; some fields may be placeholders.'
          );
          setIsLoading(false);
        }
      }
    };

    loadEffects();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentDetent = detentByMode[mode];

  const filteredEffects = useMemo(
    () => filterEffects(effects, searchTerm),
    [effects, searchTerm]
  );

  const currentEffect = useMemo(
    () => findCurrentEffect(filteredEffects, mode, currentDetent),
    [filteredEffects, mode, currentDetent]
  );

  const setDetentForMode = useCallback((targetMode: Mode, next: number) => {
    setDetentByMode((prev) => ({
      ...prev,
      [targetMode]: clampDetent(targetMode, next)
    }));
  }, []);

  const jumpToEffect = useCallback(
    (effect: EffectInfo) => {
      setMode(effect.mode);
      setDetentForMode(effect.mode, effect.detent);
    },
    [setDetentForMode]
  );

  return {
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
  };
};

export default useEffectLibrary;

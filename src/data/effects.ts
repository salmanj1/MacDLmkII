import type {
  DetentMeta,
  EffectInfo,
  Mode,
  KnobBehavior
} from './commonParams';
import { modes, notSpecified } from './commonParams';
import skeletonJson from './effects.skeleton.json';

type SkeletonModel = {
  id: string;
  displayName: string;
  selectorIndex: number;
  tweakLabel?: string;
  tweezLabel?: string;
};

type SkeletonMode = {
  detents: number;
  includesLooper?: boolean;
  includesReverbOff?: boolean;
  models: SkeletonModel[];
  notes?: string[];
};

type SkeletonModeKey = 'mkii_delay' | 'legacy_delay' | 'secret_reverb';

type SkeletonSchema = {
  modes: Record<SkeletonModeKey, SkeletonMode>;
};

const modeKeyToLabel: Record<SkeletonModeKey, Mode> = {
  mkii_delay: 'MkII Delay',
  legacy_delay: 'Legacy Delay',
  secret_reverb: 'Secret Reverb'
};

const asSkeleton: SkeletonSchema = skeletonJson as SkeletonSchema;

const sanitizeString = (value: unknown, fallback = notSpecified) =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback;

const normalizeKnob = (
  base: KnobBehavior,
  override?: Partial<KnobBehavior>
): KnobBehavior => ({
  label: sanitizeString(override?.label, base.label),
  behaviorCCW: sanitizeString(override?.behaviorCCW),
  behaviorCW: sanitizeString(override?.behaviorCW)
});

const buildBaseEffects = (skeleton: SkeletonSchema): EffectInfo[] => {
  const effects: EffectInfo[] = [];

  Object.entries(skeleton.modes).forEach(([modeKey, modeData]) => {
    const modeLabel = modeKeyToLabel[modeKey as SkeletonModeKey];
    const sortedModels = [...modeData.models].sort(
      (a, b) => (a.selectorIndex ?? 0) - (b.selectorIndex ?? 0)
    );

    sortedModels.forEach((model) => {
      effects.push({
        id: model.id,
        mode: modeLabel,
        detent: model.selectorIndex,
        selectorIndex: model.selectorIndex,
        model: model.displayName,
        inspiration: notSpecified,
        description: notSpecified,
        tweak: {
          label: sanitizeString(
            model.tweakLabel,
            model.tweakLabel ?? notSpecified
          ),
          behaviorCCW: notSpecified,
          behaviorCW: notSpecified
        },
        tweez: {
          label: sanitizeString(
            model.tweezLabel,
            model.tweezLabel ?? notSpecified
          ),
          behaviorCCW: notSpecified,
          behaviorCW: notSpecified
        },
        rangeNote: notSpecified,
        notes: []
      });
    });
  });

  return effects;
};

const buildDetents = (skeleton: SkeletonSchema): Record<Mode, DetentMeta[]> => {
  const detents: Record<Mode, DetentMeta[]> = {
    'MkII Delay': [],
    'Legacy Delay': [],
    'Secret Reverb': []
  };

  Object.entries(skeleton.modes).forEach(([modeKey, modeData]) => {
    const modeLabel = modeKeyToLabel[modeKey as SkeletonModeKey];
    const sorted = [...modeData.models].sort(
      (a, b) => a.selectorIndex - b.selectorIndex
    );
    detents[modeLabel] = sorted.map((model) => ({
      label: model.displayName,
      description: `${sanitizeString(model.tweakLabel, 'N/A')} • ${sanitizeString(
        model.tweezLabel,
        'N/A'
      )}`
    }));
  });

  return detents;
};

const baseEffects = buildBaseEffects(asSkeleton);

export const detentsByMode = buildDetents(asSkeleton);

export const clampDetent = (mode: Mode, detent: number) => {
  const limit = detentsByMode[mode].length - 1;
  return Math.max(0, Math.min(limit, detent));
};

export const skeletonEffects = baseEffects;

export type PartialEffect = Partial<Omit<EffectInfo, 'tweak' | 'tweez'>> & {
  id: string;
  tweak?: Partial<KnobBehavior>;
  tweez?: Partial<KnobBehavior>;
};

export const mergeEffects = (fullEffects: unknown): EffectInfo[] => {
  if (!Array.isArray(fullEffects)) return skeletonEffects;

  return skeletonEffects.map((base) => {
    const override = (fullEffects as PartialEffect[]).find(
      (effect) => effect.id === base.id
    );

    if (!override) return base;

    return {
      ...base,
      ...override,
      inspiration: sanitizeString(override.inspiration, base.inspiration),
      description: sanitizeString(override.description, base.description),
      tweak: normalizeKnob(base.tweak, override.tweak),
      tweez: normalizeKnob(base.tweez, override.tweez),
      rangeNote: sanitizeString(override.rangeNote, base.rangeNote),
      notes:
        Array.isArray(override.notes) && override.notes.length > 0
          ? override.notes.map((note) => sanitizeString(note))
          : base.notes
    };
  });
};

export const modeDetentCounts: Record<Mode, number> = Object.fromEntries(
  modes.map((mode) => [mode, detentsByMode[mode].length])
) as Record<Mode, number>;

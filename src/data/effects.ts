// Builds the effect catalog (delay/reverb models) from skeleton JSON and ordering.
// This powers selector labels, descriptions, and tweak/tweez text you see in the UI.
import type {
  DetentMeta,
  EffectInfo,
  Mode,
  KnobBehavior
} from './commonParams';
import { modes, notSpecified } from './commonParams';
import skeletonJson from './effects.skeleton.json';
import selectorOrder from './selectorOrder';

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

const splitRangeNote = (
  rangeNote: string
): { tweakRange: string; tweezRange: string } => {
  if (rangeNote === notSpecified) {
    return {
      tweakRange: 'Range not listed in the manual',
      tweezRange: 'Range not listed in the manual'
    };
  }

  const clauses = rangeNote
    .split(/;\s*/)
    .map((clause) => clause.trim())
    .filter(Boolean);

  const tweakClauses: string[] = [];
  const tweezClauses: string[] = [];

  clauses.forEach((clause) => {
    const lowered = clause.toLowerCase();
    if (lowered.includes('tweez')) {
      tweezClauses.push(clause);
    } else if (lowered.includes('tweak')) {
      tweakClauses.push(clause);
    } else {
      tweakClauses.push(clause);
    }
  });

  const fallbackRange = 'Range not listed in the manual';
  return {
    tweakRange: tweakClauses.join('; ') || tweezClauses.join('; ') || fallbackRange,
    tweezRange: tweezClauses.join('; ') || tweakClauses.join('; ') || fallbackRange
  };
};

const dedupeNotes = (
  rawNotes: unknown,
  compareAgainst: string[]
): string[] => {
  if (!Array.isArray(rawNotes) || rawNotes.length === 0) return [];

  const normalizedCompare = compareAgainst
    .filter(Boolean)
    .map((entry) => entry.toLowerCase());

  return rawNotes
    .map((note) => sanitizeString(note))
    .filter((note) => note !== notSpecified)
    .filter(
      (note, idx, arr) =>
        arr.indexOf(note) === idx &&
        !normalizedCompare.includes(note.toLowerCase())
    );
};

const normalizeKnob = (
  base: KnobBehavior,
  override?: Partial<KnobBehavior>
): KnobBehavior => ({
  label: sanitizeString(override?.label, base.label),
  behaviorCCW: sanitizeString(override?.behaviorCCW),
  behaviorCW: sanitizeString(override?.behaviorCW)
});

const orderModelsForMode = (
  modeLabel: Mode,
  models: SkeletonModel[]
): SkeletonModel[] => {
  const order = selectorOrder[modeLabel];
  const byId = new Map(models.map((model) => [model.id, model]));

  if (order?.length) {
    return order
      .map((id, idx) => {
        const model = byId.get(id);
        if (!model) return null;
        return { ...model, selectorIndex: idx };
      })
      .filter(Boolean) as SkeletonModel[];
  }

  return [...models].sort((a, b) => (a.selectorIndex ?? 0) - (b.selectorIndex ?? 0));
};

const buildBaseEffects = (skeleton: SkeletonSchema): EffectInfo[] => {
  const effects: EffectInfo[] = [];

  Object.entries(skeleton.modes).forEach(([modeKey, modeData]) => {
    const modeLabel = modeKeyToLabel[modeKey as SkeletonModeKey];
    const sortedModels = orderModelsForMode(modeLabel, modeData.models);

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
        tweakRange: 'Range not listed in the manual',
        tweezRange: 'Range not listed in the manual',
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
    const sorted = orderModelsForMode(modeLabel, modeData.models);
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

    const {
      tweak: overrideTweak,
      tweez: overrideTweez,
      detent: _detent,
      selectorIndex: _selectorIndex,
      ...overrideRest
    } = override;

    const rangeNote = sanitizeString(overrideRest.rangeNote, base.rangeNote);
    const { tweakRange, tweezRange } = splitRangeNote(rangeNote);

    return {
      ...base,
      ...overrideRest,
      inspiration: sanitizeString(overrideRest.inspiration, base.inspiration),
      description: sanitizeString(overrideRest.description, base.description),
      tweak: normalizeKnob(base.tweak, overrideTweak),
      tweez: normalizeKnob(base.tweez, overrideTweez),
      rangeNote,
      tweakRange,
      tweezRange,
      notes:
        dedupeNotes(overrideRest.notes, [
          base.tweak.behaviorCCW,
          base.tweak.behaviorCW,
          base.tweez.behaviorCCW,
          base.tweez.behaviorCW,
          tweakRange,
          tweezRange
        ]) || base.notes
    };
  });
};

export const modeDetentCounts: Record<Mode, number> = Object.fromEntries(
  modes.map((mode) => [mode, detentsByMode[mode].length])
) as Record<Mode, number>;

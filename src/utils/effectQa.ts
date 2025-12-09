import { modes, notSpecified, type EffectInfo } from '../data/commonParams';
import { detentsByMode } from '../data/effects';

export type QaStats = {
  countsByMode: { mode: string; count: number; expected: number }[];
  missing: {
    inspiration: number;
    description: number;
    tweak: number;
    tweez: number;
    range: number;
    notes: number;
    totalNotSpecified: number;
  };
};

export const buildQaStats = (effects: EffectInfo[]): QaStats => {
  const countsByMode = modes.map((entry) => {
    const totalForMode = effects.filter(
      (effect) => effect.mode === entry
    ).length;
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
    if (
      effect.tweak.behaviorCCW === notSpecified ||
      effect.tweak.behaviorCW === notSpecified
    ) {
      missingTweakBehavior += 1;
    }
    if (
      effect.tweez.behaviorCCW === notSpecified ||
      effect.tweez.behaviorCW === notSpecified
    ) {
      missingTweezBehavior += 1;
    }
    if (effect.rangeNote === notSpecified) missingRange += 1;
    if (
      !effect.notes.length ||
      effect.notes.every((note) => note === notSpecified)
    )
      missingNotes += 1;

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
};

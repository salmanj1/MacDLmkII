import { describe, expect, it } from 'vitest';
import {
  detentsByMode,
  mergeEffects,
  modeDetentCounts,
  skeletonEffects
} from './effects';
import fullEffects from './effects.full.json';
import { modes } from './commonParams';

const merged = mergeEffects(fullEffects);
const skeletonIds = new Set(skeletonEffects.map((effect) => effect.id));

describe('effects dataset integrity', () => {
  it('matches skeleton counts per mode', () => {
    modes.forEach((mode) => {
      const total = merged.filter((effect) => effect.mode === mode).length;
      expect(total).toBe(modeDetentCounts[mode]);
    });
  });

  it('keeps selectorIndex within bounds per mode', () => {
    merged.forEach((effect) => {
      const limit = detentsByMode[effect.mode].length - 1;
      expect(effect.selectorIndex).toBeGreaterThanOrEqual(0);
      expect(effect.selectorIndex).toBeLessThanOrEqual(limit);
    });
  });

  it('ensures required fields are present as strings', () => {
    merged.forEach((effect) => {
      expect(typeof effect.model).toBe('string');
      expect(typeof effect.inspiration).toBe('string');
      expect(typeof effect.description).toBe('string');
      expect(typeof effect.tweak.label).toBe('string');
      expect(typeof effect.tweak.behaviorCCW).toBe('string');
      expect(typeof effect.tweak.behaviorCW).toBe('string');
      expect(typeof effect.tweez.label).toBe('string');
      expect(typeof effect.tweez.behaviorCCW).toBe('string');
      expect(typeof effect.tweez.behaviorCW).toBe('string');
      expect(typeof effect.rangeNote).toBe('string');
      expect(Array.isArray(effect.notes)).toBe(true);
    });
  });

  it('only contains ids that exist in the skeleton', () => {
    merged.forEach((effect) => {
      expect(skeletonIds.has(effect.id)).toBe(true);
    });
  });
});

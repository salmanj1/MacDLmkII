import { describe, expect, it } from 'vitest';
import { mergeEffects, skeletonEffects } from './effects';
import fullEffects from './effects.full.json';
import { detentsByMode } from './effects';

const merged = mergeEffects(fullEffects);

describe('effects data completeness', () => {
  it('keeps model names aligned to skeleton/WPF labels', () => {
    skeletonEffects.forEach((skeleton) => {
      const found = merged.find((entry) => entry.id === skeleton.id);
      expect(found?.model).toBe(skeleton.model);
      expect(found?.detent).toBe(skeleton.detent);
      expect(found?.selectorIndex).toBe(skeleton.selectorIndex);
    });
  });

  it('has non-empty tweak/tweez labels for every detent slot', () => {
    merged.forEach((effect) => {
      expect(effect.tweak.label.trim().length).toBeGreaterThan(0);
      expect(effect.tweez.label.trim().length).toBeGreaterThan(0);
    });
  });

  it('ensures detent metadata labels match the merged effects ordering', () => {
    (Object.keys(detentsByMode) as (keyof typeof detentsByMode)[]).forEach((mode) => {
      const detents = detentsByMode[mode];
      detents.forEach((detent, idx) => {
        const effect = merged.find((entry) => entry.mode === mode && entry.detent === idx);
        expect(effect?.model.toLowerCase()).toBe(detent.label.toLowerCase());
      });
    });
  });
});


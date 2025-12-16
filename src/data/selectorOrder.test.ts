import { describe, expect, it } from 'vitest';
import selectorOrder from './selectorOrder';
import { modes } from './commonParams';
import { detentsByMode, mergeEffects } from './effects';
import effectsFull from './effects.full.json';

const merged = mergeEffects(effectsFull);

describe('selector ordering', () => {
  it('keeps detent metadata aligned to the selector order for every mode', () => {
    modes.forEach((mode) => {
      const expectedOrder = selectorOrder[mode];
      const detents = detentsByMode[mode];
      expect(detents.length).toBe(expectedOrder.length);
      expectedOrder.forEach((id, idx) => {
        const effect = merged.find((entry) => entry.id === id);
        expect(effect?.detent).toBe(idx);
        expect(detents[idx]?.label.toLowerCase()).toBe(
          effect?.model.toLowerCase()
        );
      });
    });
  });

  it('ensures effects are contiguous per mode with selector indices that match detents', () => {
    modes.forEach((mode) => {
      const effectsForMode = merged.filter((entry) => entry.mode === mode);
      const ids = effectsForMode.map((entry) => entry.id);
      expect(new Set(ids).size).toBe(ids.length);
      effectsForMode.forEach((entry) => {
        expect(entry.detent).toBe(entry.selectorIndex);
      });
      const detentNumbers = effectsForMode.map((entry) => entry.detent).sort((a, b) => a - b);
      detentNumbers.forEach((value, idx) => expect(value).toBe(idx));
    });
  });
});


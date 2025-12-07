import { describe, expect, it } from 'vitest';
import { clampDetent, detentsByMode } from './selectorMaps';

describe('selector maps', () => {
  it('clamps detent within mode bounds', () => {
    expect(clampDetent('MkII Delay', -1)).toBe(0);
    expect(clampDetent('MkII Delay', detentsByMode['MkII Delay'].length + 2)).toBe(
      detentsByMode['MkII Delay'].length - 1
    );
  });
});

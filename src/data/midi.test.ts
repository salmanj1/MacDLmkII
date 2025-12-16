import { describe, expect, it } from 'vitest';
import { midiCC, modelValueForMode } from './midi';
import { detentsByMode } from './effects';
import { modes, type Mode } from './commonParams';

describe('MIDI CC mapping', () => {
  it('matches the DL4 MkII CC assignments used by the WPF app', () => {
    expect(midiCC).toEqual({
      delaySelected: 1,
      reverbSelected: 2,
      expressionPedal: 3,
      presetBypass: 4,
      looperMode: 9,
      delayTime: 11,
      delayNotes: 12,
      delayRepeats: 13,
      delayTweak: 14,
      delayTweez: 15,
      delayMix: 16,
      reverbDecay: 17,
      reverbTweak: 18,
      reverbRouting: 19,
      reverbMix: 20,
      tapTempo: 64
    });
  });

  it('keeps MIDI model values aligned to the detent ordering for each mode', () => {
    const expectedValuesByMode: Record<Mode, number[]> = {
      'MkII Delay': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 30],
      'Legacy Delay': [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
      'Secret Reverb': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    };

    modes.forEach((mode) => {
      const detents = detentsByMode[mode];
      const expected = expectedValuesByMode[mode];
      expect(detents.length).toBe(expected.length);
      detents.forEach((_, idx) => {
        expect(modelValueForMode(mode, idx)).toBe(expected[idx]);
      });
    });
  });
});

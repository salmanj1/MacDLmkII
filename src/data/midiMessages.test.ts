import { describe, expect, it } from 'vitest';
import { buildModelSelectMessages, buildTapMessages } from './midiMessages';
import { midiCC } from './midi';

describe('midiMessages', () => {
  it('builds delay model select messages and toggles looper mode for detent 15', () => {
    const messages = buildModelSelectMessages('MkII Delay', 15);
    expect(messages).toEqual([
      { type: 'cc', control: midiCC.looperMode, value: 64 },
      { type: 'cc', control: midiCC.delaySelected, value: 30 }
    ]);
  });

  it('builds delay model select messages without looper toggle for standard detents', () => {
    const messages = buildModelSelectMessages('Legacy Delay', 2);
    expect(messages).toEqual([
      { type: 'cc', control: midiCC.looperMode, value: 0 },
      { type: 'cc', control: midiCC.delaySelected, value: 17 }
    ]);
  });

  it('builds reverb model select messages without looper toggles', () => {
    const messages = buildModelSelectMessages('Secret Reverb', 10);
    expect(messages).toEqual([
      { type: 'cc', control: midiCC.reverbSelected, value: 10 }
    ]);
  });

  it('builds tap tempo/subdivision CC pairs', () => {
    const messages = buildTapMessages(64);
    expect(messages).toEqual([
      { type: 'cc', control: midiCC.delayNotes, value: 64 },
      { type: 'cc', control: midiCC.tapTempo, value: 127 }
    ]);
  });
});


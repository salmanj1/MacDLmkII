// Helpers that translate UI intents (select model, change tap subdivision) into MIDI messages.
// Used by the preset bank and live controls to stay in sync with the pedal.
import type { Mode } from './commonParams';
import { midiCC, modelValueForMode } from './midi';

export type MidiCCMessage = { type: 'cc'; control: number; value: number };
export type MidiPCMessage = { type: 'pc'; program: number };
export type MidiMessage = MidiCCMessage | MidiPCMessage;

// Build the CC payloads needed to mirror the hardware model selector logic.
export const buildModelSelectMessages = (
  mode: Mode,
  detent: number
): MidiMessage[] => {
  const value = modelValueForMode(mode, detent);

  if (mode === 'Secret Reverb') {
    return [{ type: 'cc', control: midiCC.reverbSelected, value }];
  }

  const messages: MidiMessage[] = [
    {
      type: 'cc',
      control: midiCC.looperMode,
      value: value === 30 ? 64 : 0
    },
    {
      type: 'cc',
      control: midiCC.delaySelected,
      value
    }
  ];

  return messages;
};

export const buildTapMessages = (subdivision: number): MidiMessage[] => [
  { type: 'cc', control: midiCC.delayNotes, value: subdivision },
  { type: 'cc', control: midiCC.tapTempo, value: 127 }
];

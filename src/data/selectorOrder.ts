import type { Mode } from './commonParams';

// Selector ordering mirrored from the DL4II_Control/WPF enums so detents, MIDI
// model numbers, and UI rings all stay aligned to hardware.
export const selectorOrder: Record<Mode, string[]> = {
  'MkII Delay': [
    'mkii_vintage_digital',
    'mkii_crisscross',
    'mkii_euclidean',
    'mkii_dual_delay',
    'mkii_pitch_echo',
    'mkii_adt',
    'mkii_ducked',
    'mkii_harmony',
    'mkii_looper',
    'mkii_heliosphere',
    'mkii_transistor',
    'mkii_cosmos',
    'mkii_multi_pass',
    'mkii_adriatic',
    'mkii_elephant_man',
    'mkii_glitch'
  ],
  'Legacy Delay': [
    'legacy_digital',
    'legacy_digital_mod',
    'legacy_echo_platter',
    'legacy_stereo',
    'legacy_ping_pong',
    'legacy_reverse',
    'legacy_dynamic',
    'legacy_auto_vol',
    'legacy_looper',
    'legacy_tube_echo',
    'legacy_tape_echo',
    'legacy_multi_head',
    'legacy_sweep',
    'legacy_analog',
    'legacy_analog_mod',
    'legacy_lo_res_delay'
  ],
  'Secret Reverb': [
    'reverb_room',
    'reverb_searchlights',
    'reverb_particle',
    'reverb_double_tank',
    'reverb_octo',
    'reverb_tile',
    'reverb_ducking',
    'reverb_plateaux',
    'reverb_off',
    'reverb_cave',
    'reverb_plate',
    'reverb_ganymede',
    'reverb_chamber',
    'reverb_hot_springs',
    'reverb_hall',
    'reverb_glitz'
  ]
};

export default selectorOrder;

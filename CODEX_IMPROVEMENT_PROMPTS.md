# DL4 MkII MacDLmkII Codebase Improvement Prompts for Codex

This document contains prioritized improvement prompts to be passed to Codex in VS Code based on a comprehensive analysis of the codebase against the official Line6 DL4 MkII Owner's Manual.

---

## Priority 1: Critical MIDI Implementation Gaps

### 1.1 Add Missing MIDI CC Mappings (Per Manual Pages 51-53)

**Current State:** `src/data/midi.ts` has basic CC mappings but is missing looper controls and has incorrect subdivision values.

**Prompt:**
```
In src/data/midi.ts, update and add MIDI CC mappings to match the official manual (pages 51-53):

1. Add looper control CCs as a new export:
export const looperCC = {
  classicLooperMode: 9,     // 0-63: Off, 64-127: On
  recordOverdub: 60,        // 0-63: Overdub, 64-127: Record
  playStop: 61,             // 0-63: Stop, 64-127: Play
  playOnce: 62,             // 64-127: trigger
  undoRedo: 63,             // 0-63: Undo, 64-127: Redo
  forwardReverse: 65,       // 0-63: Forward, 64-127: Reverse
  fullHalfSpeed: 66         // 0-63: Full, 64-127: Half
} as const;

2. FIX the tapSubdivisions values - the manual specifies 0-8 discrete values:
export const tapSubdivisions = [
  { label: '1/8T', value: 0 },   // Was 12
  { label: '1/8', value: 1 },    // Was 25
  { label: '1/8.', value: 2 },   // Was 38
  { label: '1/4T', value: 3 },   // Was 50
  { label: '1/4', value: 4 },    // Was 64
  { label: '1/4.', value: 5 },   // Was 75
  { label: '1/2T', value: 6 },   // Was 89
  { label: '1/2', value: 7 },    // Was 102
  { label: '1/2.', value: 8 }    // Was 116
] as const;

3. FIX reverbRouting - uses discrete 0/1/2 values, not 0-127:
// In midiCC, add routing note:
// CC19 Reverb-Delay Routing: 0 = Reverb before delay, 1 = Parallel, 2 = Reverb after delay

4. Update CC4 (presetBypass) note - per firmware 1.10:
// 0-63: Enables preset (Bypass Off), 64-127: Bypasses preset (Bypass On)
```

### 1.2 Add Looper Transport UI Controls (Per Manual Pages 19-23, 53)

**Current State:** Looper mode is selectable but no transport controls exist.

**Prompt:**
```
Create a new component at src/components/molecules/LooperControls/LooperControls.tsx that provides transport controls for the DL4 MkII looper based on manual pages 19-23:

1. Add transport buttons that send MIDI CC messages:
   - Record (CC60 value 127)
   - Play (CC61 value 127)
   - Stop (CC61 value 0)
   - Overdub (CC60 value 0)
   - Play Once (CC62 value 127)
   - Undo (CC63 value 0)
   - Redo (CC63 value 127)

2. Add mode toggle buttons:
   - Forward/Reverse (CC65: 0=Forward, 127=Reverse)
   - Full/Half Speed (CC66: 0=Full, 127=Half)

3. Add Classic Looper Mode toggle (CC9: 0=Off, 127=On)

4. Visual state indicators:
   - Recording: red pulsing glow
   - Playing: green solid
   - Overdubbing: amber/orange
   - Half Speed: blue indicator
   - Reverse: mirrored icon

5. Show controls when:
   - Delay model is "LOOPER" (detent 15), OR
   - Classic Looper Mode is enabled (CC9)

6. Include keyboard shortcuts: R=Record, Space=Play/Stop, O=Overdub, U=Undo

7. Display looper parameters from ParameterMappings:
   - Echo Mod (Tweak)
   - Echo Volume (Tweez)
```

### 1.3 Implement Expression Pedal Assignment UI

**Current State:** Expression pedal (CC3) is defined but not exposed in UI.

**Prompt:**
```
Add expression pedal assignment functionality:

1. Create src/components/molecules/ExpressionPedalConfig/ExpressionPedalConfig.tsx
2. Allow users to assign CC3 (expression) to control any of these parameters:
   - Delay Time (CC 11)
   - Delay Repeats (CC 13)
   - Delay Tweak (CC 14)
   - Delay Tweez (CC 15)
   - Delay Mix (CC 16)
   - Reverb Decay (CC 17)
   - Reverb Tweak (CC 18)
   - Reverb Mix (CC 20)
3. Store the assignment in the preset's parameters object
4. Add a new field to the Preset type: expressionAssignment?: { targetCC: number; min: number; max: number; }
5. Display the assignment in the ParameterDisplay component when active
```

---

## Priority 2: Data Completeness

### 2.1 Complete Parameter Mappings for All Legacy Delays (Per Cheatsheet Page 2)

**Current State:** `src/data/parameterMappings.ts` has MkII delays but Legacy Delay only has a default mapping.

**Prompt:**
```
In src/data/parameterMappings.ts, add specific parameter mappings for all 16 Legacy Delay models based on the official cheatsheet (docs/DL4 MkII Cheat Sheet - English .pdf):

'Legacy Delay': {
  default: [...existing...],
  'Digital': [
    { id: 'tweak', primaryLabel: 'Bass', unit: 'generic' },
    { id: 'tweez', primaryLabel: 'Treble', unit: 'generic' }
  ],
  'Digital W/ Mod': [
    { id: 'tweak', primaryLabel: 'Mod Rate', unit: 'generic' },
    { id: 'tweez', primaryLabel: 'Mod Depth', unit: 'generic' }
  ],
  'Echo Platter': [
    { id: 'tweak', primaryLabel: 'Wow/Flutter', unit: 'generic' },
    { id: 'tweez', primaryLabel: 'Drive', unit: 'generic' }
  ],
  'Stereo': [
    { id: 'tweak', primaryLabel: 'R Delay Time', unit: 'ms', formatter: millis },
    { id: 'tweez', primaryLabel: 'R Repeats', unit: '%', formatter: percent }
  ],
  'Ping Pong': [
    { id: 'tweak', primaryLabel: 'Time Offset', unit: 'generic' },
    { id: 'tweez', primaryLabel: 'Stereo Spread', unit: 'generic' }
  ],
  'Reverse': [
    { id: 'tweak', primaryLabel: 'Mod Rate', unit: 'generic' },
    { id: 'tweez', primaryLabel: 'Mod Depth', unit: 'generic' }
  ],
  'Dynamic': [
    { id: 'tweak', primaryLabel: 'Threshold', unit: 'generic' },
    { id: 'tweez', primaryLabel: 'Ducking', unit: 'generic' }
  ],
  'Auto-Vol': [
    { id: 'tweak', primaryLabel: 'Mod Depth', unit: 'generic' },
    { id: 'tweez', primaryLabel: 'Swell Time', unit: 'ms' }
  ],
  'Tube Echo': [
    { id: 'tweak', primaryLabel: 'Wow/Flutter', unit: 'generic' },
    { id: 'tweez', primaryLabel: 'Drive', unit: 'generic' }
  ],
  'Tape Echo': [
    { id: 'tweak', primaryLabel: 'Bass', unit: 'generic' },
    { id: 'tweez', primaryLabel: 'Treble', unit: 'generic' }
  ],
  'Multi-Head': [
    { id: 'tweak', primaryLabel: 'Heads 1/2', unit: 'generic' },
    { id: 'tweez', primaryLabel: 'Heads 3/4', unit: 'generic' }
  ],
  'Sweep': [
    { id: 'tweak', primaryLabel: 'Sweep Rate', unit: 'generic' },
    { id: 'tweez', primaryLabel: 'Sweep Depth', unit: 'generic' }
  ],
  'Analog': [
    { id: 'tweak', primaryLabel: 'Bass', unit: 'generic' },
    { id: 'tweez', primaryLabel: 'Treble', unit: 'generic' }
  ],
  'Analog W/ Mod': [
    { id: 'tweak', primaryLabel: 'Mod Rate', unit: 'generic' },
    { id: 'tweez', primaryLabel: 'Mod Depth', unit: 'generic' }
  ],
  'Lo Res Delay': [
    { id: 'tweak', primaryLabel: 'Tone', unit: 'generic' },
    { id: 'tweez', primaryLabel: 'Resolution', unit: 'generic' }
  ],
  'Looper': [
    { id: 'tweak', primaryLabel: 'Echo Mod', unit: 'generic' },
    { id: 'tweez', primaryLabel: 'Echo Volume', unit: '%', formatter: percent }
  ]
}

Include time, repeats, and mix as defaults with the model-specific tweak/tweez.
```

### 2.2 Add Missing MkII Delay Parameter Mappings (Per Cheatsheet)

**Current State:** Some MkII delays (Multi Pass, Adriatic, Elephant Man, Glitch, Looper) are missing from parameterMappings.

**Prompt:**
```
In src/data/parameterMappings.ts, add the missing MkII Delay parameter mappings based on the cheatsheet:

// Also FIX existing mappings that have incorrect labels:
'Vintage Digital': [
  { id: 'tweak', primaryLabel: 'Bit/Sample Quality', unit: 'generic' }, // Was: Bit Depth + Sample Rate
  { id: 'tweez', primaryLabel: 'Mod Depth', unit: 'generic' }
],
'Crisscross': [
  { id: 'tweak', primaryLabel: 'Delay Time B', unit: 'ms', formatter: millis },
  { id: 'tweez', primaryLabel: 'Cross Amount', unit: 'generic' }  // Was: Pan Width
],
'Euclidean': [
  { id: 'tweak', primaryLabel: 'Step Fill', unit: 'generic' },  // Was: Cluster Offset
  { id: 'tweez', primaryLabel: 'Rotate', unit: 'generic' }      // Was: Swing
],
'Dual Delay': [
  { id: 'tweak', primaryLabel: 'R Delay Time', unit: 'ms', formatter: millis },
  { id: 'tweez', primaryLabel: 'R Feedback', unit: '%', formatter: percent }
],
'Pitch Echo': [
  { id: 'tweak', primaryLabel: 'Pitch Interval', unit: 'generic' },
  { id: 'tweez', primaryLabel: 'Pitch Cents', unit: 'generic' }
],
'ADT': [
  { id: 'tweak', primaryLabel: 'Distortion', unit: 'generic' },
  { id: 'tweez', primaryLabel: 'Deck 2 Mod Depth', unit: 'generic' }
],
'Ducked': [
  { id: 'tweak', primaryLabel: 'Threshold', unit: 'generic' },
  { id: 'tweez', primaryLabel: 'Attack/Release', unit: 'generic' }
],
'Harmony': [
  { id: 'tweak', primaryLabel: 'Key (A-G#)', unit: 'generic' },
  { id: 'tweez', primaryLabel: 'Scale', unit: 'generic' }  // Was: Voice A/B
],
'Heliosphere': [
  { id: 'tweak', primaryLabel: 'Reverb Mix+Decay', unit: 'generic' },
  { id: 'tweez', primaryLabel: 'Mod Depth', unit: 'generic' }
],
'Transistor': [
  { id: 'tweak', primaryLabel: 'Headroom', unit: 'generic' },
  { id: 'tweez', primaryLabel: 'Wow/Flutter', unit: 'generic' }
],
'Cosmos': [
  { id: 'tweak', primaryLabel: 'Heads Select', unit: 'generic' },
  { id: 'tweez', primaryLabel: 'Wow/Flutter', unit: 'generic' }
],
'Multi Pass': [
  { id: 'tweak', primaryLabel: 'Tap Pattern', unit: 'generic' },
  { id: 'tweez', primaryLabel: 'Delay Mode', unit: 'generic' }
],
'Adriatic': [
  { id: 'tweak', primaryLabel: 'Mod Rate', unit: 'generic' },
  { id: 'tweez', primaryLabel: 'Mod Depth', unit: 'generic' }
],
'Elephant Man': [
  { id: 'tweak', primaryLabel: 'Mod Depth', unit: 'generic' },
  { id: 'tweez', primaryLabel: 'Chorus/Vibrato', unit: 'generic' }
],
'Glitch': [
  { id: 'tweak', primaryLabel: 'Pitch Slice/Drift/Shuffle', unit: 'generic' },
  { id: 'tweez', primaryLabel: 'Pitch Slice/Drift/Shuffle', unit: 'generic' }
],
'Looper': [
  { id: 'tweak', primaryLabel: 'Echo Mod', unit: 'generic' },
  { id: 'tweez', primaryLabel: 'Echo Volume', unit: '%', formatter: percent }
]
```

### 2.3 Add Specific Parameter Value Ranges and Formatters

**Current State:** Many parameters use generic units without proper formatting.

**Prompt:**
```
In src/data/parameterMappings.ts, add specialized formatters for specific parameter types:

1. Create these new formatters:
   - const semitones = (value: number) => {
       const st = Math.round((value / 127) * 26) - 13;
       return `${st > 0 ? '+' : ''}${st} st`;
     };
   - const cents = (value: number) => {
       const c = Math.round((value / 127) * 100) - 50;
       return `${c > 0 ? '+' : ''}${c} cents`;
     };
   - const key = (value: number) => {
       const keys = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
       return keys[Math.floor((value / 127) * 12)];
     };
   - const headSelect = (value: number) => {
       const heads = Math.floor((value / 127) * 7) + 1;
       return `Head ${heads}`;
     };
   - const routing = (value: number) => {
       if (value < 43) return 'Rev→Dly';
       if (value < 86) return 'Parallel';
       return 'Dly→Rev';
     };

2. Apply these formatters to the appropriate parameters in the mappings:
   - Pitch Echo: tweak uses semitones, tweez uses cents
   - Harmony: tweak uses key
   - Cosmos: tweak uses headSelect
   - All reverbs: tweez uses routing
```

---

## Priority 3: Enhanced User Experience

### 3.1 Add Preset Bypass Toggle with Visual Indicator

**Current State:** CC4 (Preset Bypass) is defined but not exposed in UI.

**Prompt:**
```
Add a bypass toggle to the main UI:

1. Add a bypass state to App.tsx: const [bypassed, setBypassed] = useState(false);
2. Create a Bypass button component that:
   - Sends CC4 with value 0-63 for bypass, 64-127 for enabled (per firmware 1.10)
   - Shows red/green indicator for bypass state
   - Keyboard shortcut: 'b' to toggle
3. Add visual feedback to the Pedal component when bypassed (dim the faceplate)
4. Store bypass state in preset if desired
```

### 3.2 Add Tap Tempo Subdivision Selector

**Current State:** Tap subdivisions are defined in midi.ts but not selectable in UI.

**Prompt:**
```
Enhance the tap tempo UI to include subdivision selection:

1. In the FootswitchRail or a new TapTempoControl component:
   - Add a dropdown/selector for note subdivisions from tapSubdivisions array
   - Options: 1/8T, 1/8, 1/8., 1/4T, 1/4, 1/4., 1/2T, 1/2, 1/2.
   - Send CC12 with the corresponding MIDI value when changed
2. Store selected subdivision in preset parameters
3. Display current subdivision next to BPM in the parameter display
4. Visual indicator should update tap light blink rate based on subdivision
```

### 3.3 Add Footswitch Mode Toggle

**Current State:** Footswitch mode (Preset vs Stomp) not implemented.

**Prompt:**
```
Add footswitch mode toggle:

1. Create a FootswitchModeToggle component
2. Two modes: "Preset" (CC5 value 0-63) and "Stomp" (CC5 value 64-127)
3. In Preset mode: A/B/C select presets 1-3
4. In Stomp mode: A/B/C act as bypass toggles
5. Add this to the global settings area of the UI
6. Store preference in localStorage
7. Update FootswitchRail visual hints based on current mode
```

### 3.4 Implement MIDI Input Handling for Parameter Feedback

**Current State:** MIDI sending works but no incoming CC handling for hardware sync.

**Prompt:**
```
Add MIDI input handling to synchronize UI with hardware state:

1. In src-tauri/src/midi.rs, add MIDI input capability:
   - Create a midi_input module using midir for input
   - Parse incoming CC messages and emit to frontend via Tauri events
2. In src/hooks/useMidiInput.ts:
   - Listen for Tauri 'midi-input' events
   - Update local state when CC values are received from hardware
3. Map incoming CCs to their parameter names:
   - CC11 → delayTime, CC13 → delayRepeats, etc.
4. Optional: Add a "sync from pedal" button that requests current state
5. Show visual indicator when UI and hardware may be out of sync
```

---

## Priority 4: Code Quality and Completeness

### 4.1 Add Unit Tests for MIDI Message Generation

**Prompt:**
```
Create comprehensive tests for MIDI message generation:

1. Create src/data/__tests__/midiMessages.test.ts
2. Test all CC message generation:
   - Verify correct CC numbers for each parameter
   - Verify value clamping (0-127)
   - Verify channel encoding
3. Test model selection messages:
   - MkII delays map to values 0-14, 30 (looper)
   - Legacy delays map to values 15-29, 30 (looper)
   - Reverbs map to values 0-15
4. Test buildModelSelectMessages output sequence
5. Test edge cases: invalid detents, out-of-range values
```

### 4.2 Add E2E Tests for Preset Management

**Prompt:**
```
Create end-to-end tests for preset bank operations:

1. Create src/__tests__/presetBank.e2e.test.ts using Playwright or Cypress
2. Test scenarios:
   - Create new preset from current state
   - Load preset and verify UI updates
   - Rename preset
   - Duplicate preset to another slot
   - Drag-and-drop reorder
   - Export bank to JSON
   - Import bank from JSON
   - Search/filter presets
   - Delete preset (reset to empty)
3. Verify localStorage persistence across page reloads
4. Test 128-preset limit handling
```

### 4.3 Add TypeScript Strict Mode Compliance

**Prompt:**
```
Enable and fix TypeScript strict mode issues:

1. In tsconfig.json, enable:
   - "strict": true
   - "noImplicitAny": true
   - "strictNullChecks": true
   - "noUncheckedIndexedAccess": true
2. Fix all resulting type errors:
   - Add proper null checks in effects data access
   - Add type guards for optional preset parameters
   - Type the MIDI message queue entries properly
   - Fix any implicit 'any' in event handlers
3. Ensure all function parameters and returns are typed
```

### 4.4 Improve Error Handling and User Feedback

**Prompt:**
```
Add comprehensive error handling and user feedback:

1. Create src/components/molecules/Toast/Toast.tsx for notifications
2. Add error boundaries around major sections:
   - Pedal controls
   - Preset bank panel
   - Library panel
3. Show user-friendly messages for:
   - MIDI port disconnection
   - Failed preset save/load
   - Invalid preset import
   - Clock sync issues
4. Add retry logic for transient MIDI errors
5. Log errors to a debug panel accessible via keyboard shortcut
```

---

## Priority 5: Feature Enhancements

### 5.1 Add Preset Comparison Mode

**Prompt:**
```
Add a preset comparison feature:

1. Create src/components/organisms/PresetCompare/PresetCompare.tsx
2. Allow selecting two presets to compare side-by-side
3. Show differences highlighted:
   - Different delay types
   - Parameter value changes (with delta values)
   - Added/removed reverb
4. Include A/B toggle to quickly switch between compared presets
5. Add "Copy differences" to apply changes from one to another
```

### 5.2 Add Factory Preset Import

**Prompt:**
```
Add ability to import official DL4 MkII factory presets:

1. Create src/data/factoryPresets.ts with the 6 factory presets:
   - Preset A (001): Adriatic + Ganymede
   - Preset B (002): Cosmos + Plate
   - Preset C (003): Multi-Pass + Searchlights
   - Continue for remaining factory presets
2. Add "Load Factory Presets" button in PresetBankPanel
3. Allow loading to specific bank slot or overwriting entire bank
4. Include all parameter values matching the hardware defaults
```

### 5.3 Add Undo/Redo for Parameter Changes

**Prompt:**
```
Implement undo/redo for parameter edits:

1. Create src/hooks/useUndoRedo.ts with:
   - History stack for parameter changes
   - Maximum 50 undo levels
   - Debounced recording (don't record every slider drag)
2. Track changes to:
   - All knob values
   - Model selection
   - Preset loads
3. Keyboard shortcuts: Cmd/Ctrl+Z (undo), Cmd/Ctrl+Shift+Z (redo)
4. Show undo/redo buttons in the UI
5. Clear history when preset is saved
```

### 5.4 Add MIDI Learn Mode

**Prompt:**
```
Add MIDI learn functionality:

1. Create src/hooks/useMidiLearn.ts
2. Allow users to map external MIDI controllers to parameters:
   - Enter "learn mode" by clicking a parameter
   - Move external controller
   - Map received CC to that parameter
3. Store mappings in localStorage
4. Show mapped CC numbers next to parameters
5. Allow clearing individual mappings
6. Support velocity-sensitive mapping (optional scaling)
```

---

## Priority 6: Platform Support

### 6.1 Add Windows and Linux MIDI Support

**Current State:** Only macOS CoreMIDI is implemented in Rust backend.

**Prompt:**
```
Extend MIDI support to Windows and Linux in src-tauri/src/midi.rs:

1. Use conditional compilation for platform-specific code
2. Windows: Use midir with WinMM backend
3. Linux: Use midir with ALSA backend
4. Abstract the platform differences behind a common trait
5. Update list_midi_outputs to work cross-platform
6. Test on each platform to verify port enumeration and message sending
7. Handle platform-specific error messages appropriately
```

### 6.2 Add Web MIDI API Fallback

**Prompt:**
```
Add Web MIDI API support for browser-only usage:

1. In src/hooks/useMidiBridge.ts:
   - Detect when not in Tauri runtime
   - Fall back to Web MIDI API (navigator.requestMIDIAccess)
2. Create src/services/webMidi.ts:
   - Implement same interface as Tauri MIDI commands
   - List available MIDI outputs
   - Send CC and PC messages
   - Handle browser permissions
3. Show permission request UI when Web MIDI access is denied
4. Gracefully degrade if Web MIDI not supported
```

---

## Priority 7: Bug Fixes (Identified Discrepancies)

### 7.1 Fix Incorrect Tap Subdivision MIDI Values

**Current State:** `src/data/midi.ts` has incorrect subdivision values (12-116 range).

**Prompt:**
```
CRITICAL BUG FIX in src/data/midi.ts:

The tapSubdivisions array has INCORRECT MIDI values. Per the manual page 52:
- CC12 Time Subdivisions uses values 0-8, NOT 12-116

Current (WRONG):
{ label: '1/8T', value: 12 },
{ label: '1/4', value: 64 },
...

Should be:
{ label: '1/8T', value: 0 },
{ label: '1/8', value: 1 },
{ label: '1/8.', value: 2 },
{ label: '1/4T', value: 3 },
{ label: '1/4', value: 4 },
{ label: '1/4.', value: 5 },
{ label: '1/2T', value: 6 },
{ label: '1/2', value: 7 },
{ label: '1/2.', value: 8 }

Fix this immediately as it will cause incorrect behavior when syncing to subdivisions.
```

### 7.2 Fix Reverb Routing MIDI Values

**Current State:** UI likely sends 0-127 range for routing when it should be 0/1/2.

**Prompt:**
```
In src/data/midi.ts and related components, fix the reverb routing handling:

Per manual page 52, CC19 (Reverb-Delay Routing) uses DISCRETE values:
- 0 = Reverb before delay
- 1 = Reverb and delay in parallel
- 2 = Reverb after delay

NOT a continuous 0-127 range!

1. Update any UI controls for routing to be a 3-position selector, not a linear knob
2. In parameterMappings.ts, add a formatter:
   const routingFormatter = (value: number) => {
     if (value === 0) return 'Rev→Dly';
     if (value === 1) return 'Parallel';
     return 'Dly→Rev';
   };
3. Update ParameterDisplay or LinearKnob to handle discrete values
```

### 7.3 Verify Delay Model MIDI Values Match Manual

**Current State:** Model values in midi.ts need verification against manual page 51.

**Prompt:**
```
Verify and document the delay model MIDI values in src/data/midi.ts match the manual:

MkII Delays (CC1 values):
0=Vintage Digital, 1=Crisscross, 2=Euclidean, 3=Dual Delay, 4=Pitch Echo,
5=ADT, 6=Ducked, 7=Harmony, 8=Heliosphere, 9=Transistor, 10=Cosmos,
11=Multi Pass, 12=Adriatic, 13=Elephant Man, 14=Glitch

Legacy Delays (CC1 values):
15=Digital, 16=Digital w/Mod, 17=Echo Platter, 18=Stereo, 19=Ping Pong,
20=Reverse, 21=Dynamic, 22=Auto-Vol, 23=Tube Echo, 24=Tape Echo,
25=Multi-Head, 26=Sweep, 27=Analog, 28=Analog Mod, 29=Lo Res Delay

Reverbs (CC2 values):
0=Room, 1=Searchlights, 2=Particle Verb, 3=Double Tank, 4=Octo, 5=Tile,
6=Ducking, 7=Plateaux, 8=Cave, 9=Plate, 10=Ganymede, 11=Chamber,
12=Hot Springs, 13=Hall, 14=Glitz, 15=Reverb Off

Note: Looper uses value 30 for CC1, but this is a special mode handled by CC9.
```

---

## Quick Reference: File Locations

| File | Purpose |
|------|---------|
| `src/data/midi.ts` | MIDI CC/PC mappings |
| `src/data/midiMessages.ts` | Message builders |
| `src/data/effects.full.json` | Effect model definitions |
| `src/data/parameterMappings.ts` | UI labels per model |
| `src/hooks/useMidiBridge.ts` | MIDI communication |
| `src/state/usePresetBank.ts` | Preset storage |
| `src/components/organisms/Pedal/Pedal.tsx` | Main UI |
| `src-tauri/src/midi.rs` | Native MIDI backend |

---

## Summary: Priority Order

| Priority | Category | Est. Impact | Items |
|----------|----------|-------------|-------|
| **P1** | MIDI Implementation | Critical | Fix CC mappings, add looper controls, expression pedal |
| **P2** | Data Completeness | High | Complete all parameter mappings |
| **P3** | User Experience | High | Bypass, tap subdivisions, footswitch mode |
| **P4** | Code Quality | Medium | Tests, TypeScript strict, error handling |
| **P5** | Feature Enhancements | Medium | Comparison, factory presets, undo/redo, MIDI learn |
| **P6** | Platform Support | Low | Windows/Linux, Web MIDI |
| **P7** | Bug Fixes | Critical | Subdivision values, routing values |

**Recommended Order:**
1. P7 - Fix critical bugs first (subdivision values are wrong!)
2. P1 - Complete MIDI implementation
3. P2 - Fill in data gaps
4. P3 - UX improvements
5. P4-P6 - As time permits

---

## Sources

### Local Documentation (Primary - Use These First)
- `docs/DL4 MkII Owner's Manual - English .pdf` - Complete manual with MIDI specs
- `docs/DL4 MkII Cheat Sheet - English .pdf` - Quick reference for Tweak/Tweez per model
- `docs/manual.extracted.txt` - Searchable text extraction of manual
- `docs/cheatsheet.extracted.txt` - Searchable text extraction of cheatsheet

### Online Resources
- [Line 6 DL4 MkII Product Page](https://line6.com/effects-pedals/dl4-mkii/)
- [DL4 MkII FAQ](https://kb.line6.com/kb/live/dl4-mkii-faq)
- [DL4 MkII 1.10 Release Notes](https://line6.com/support/page/kb/effects-controllers/dl4-mkii-stompbox-modeler/dl4-mkii-110-release-notes-r1087/)
- [DL4II_Control Reference Implementation](https://github.com/DavidMolTor/DL4II_Control)

---

## Key Manual Page References

| Topic | Manual Page |
|-------|-------------|
| MIDI Overview | 49 |
| Program Change (128 Presets) | 50 |
| CC Parameter Control | 51-52 |
| Looper MIDI Control | 53 |
| Global Settings (MIDI Channel, Clock) | 47-48 |
| Looper Usage | 19-23 |
| Tweak/Tweez per Model | Cheatsheet Page 2 |

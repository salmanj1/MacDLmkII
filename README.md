# MacDL MkII

User-facing desktop editor for the Line 6 DL4 MkII. It lets you:
- Connect to the pedal over MIDI (Tauri app) and see connection health
- View and tweak every knob/parameter with real-time MIDI sends
- Load/Save presets A–C (and beyond) and manage a full 128-slot preset bank
- Import/Export preset banks as JSON for backup/restore
- Inspect MIDI traffic with a debugger panel (dev/debug mode)

## Prerequisites

- [pnpm](https://pnpm.io/) 8+
- Rust toolchain (via `rustup`) for Tauri
- On macOS, Xcode Command Line Tools are sufficient. If the build process prompts for them, accept the install; full Xcode is **not** required.

## Setup

- Install dependencies with `pnpm install` (other package managers aren’t supported).
- If you switch branches or update the lockfile, rerun `pnpm install` to keep `node_modules` in sync.

## Scripts

- `pnpm dev` – start Vite (browser preview only)
- `pnpm tauri dev` – run the desktop shell with hot reload (use this for real MIDI)
- `pnpm build` – build the Vite frontend then bundle with Tauri
- `pnpm lint` – run ESLint with the TypeScript rules
- `pnpm test` – run Vitest (supports `--runInBand`/`-i`)
- `pnpm format` – format with Prettier
- `pnpm storybook` – component catalog on port 6006 (use `HOME=$(pwd) pnpm storybook -- --disable-telemetry` in locked-down envs)
- `pnpm storybook:build` – build static Storybook

## Core user flows

- **Connect & monitor MIDI**: launch `pnpm tauri dev`, select the MIDI port, watch connection status/latency in the footer.
- **Tweak parameters**: move knobs or use the Parameters panel sliders; values mirror the pedal and send MIDI immediately.
- **Presets A/B/C**: load or save the on-pedal footswitch presets directly.
- **Preset Bank (128 slots)**: browse/search all slots, rename, tag, reorder, import/export JSON. Current preset is highlighted.
- **Import/Export**: export the entire bank to JSON for backup; import to restore/overwrite slots.
- **Debug MIDI (dev mode)**: open the MIDI Debugger to see live in/out messages with filters and timestamps.

## Architecture (short)

- UI: React + Tailwind/LESS modules, atomic structure in `components/atoms|molecules|organisms`.
- Data: model metadata in `src/data` (effects, mappings, selector order). Parameter labels come from `parameterMappings.ts`.
- State: preset bank store in `src/state/usePresetBank.ts`; device/preset interaction lives in `src/App.tsx` and hooks under `src/hooks`.
- Styling tokens: `src/styles/tokens.less`.
- Storybook: run `pnpm storybook` to preview UI pieces in isolation.

## Contributing notes

- Keep user-facing labels/descriptions in `src/data` accurate to the DL4 MkII manual.
- Prefer tokenized colors/spacings and co-located `.module.less` styles.
- Add Storybook stories for new components so UX can be reviewed without the pedal.
- Use intent-driven comments sparingly to explain behavior, not what the code literally does.

## Quick references

- Preset bank persistence: `src/state/usePresetBank.ts`
- Parameter labels (what the Parameters panel shows): `src/data/parameterMappings.ts`
- Model catalog (names, detents): `src/data/effects.ts` and `src/data/selectorOrder.ts`
- MIDI helpers: `src/data/midi.ts`, `src/data/midiMessages.ts`

# Copilot prompt: finish DL4 MkII data and QA

You are working in the `MacDLmkII` repo. Finish the data population work so the app no longer relies on placeholder content.

## Goals

- Populate the full effects dataset so the UI shows complete info for every selector position (MkII delay, Legacy delay, Secret reverb, Reverb Off, and Looper).
- Ensure selectors/knob detent maps remain aligned with the data and that QA checks and Vitest tests pass.

## Context to keep

- Stack: Tauri 2 + React + TypeScript + Vite + Tailwind + pnpm.
- Effects schema lives in `src/data/effects.ts` (types) and currently uses `src/data/effects.full.json` as the source of truth (presently empty). A fallback skeleton exists but should not be needed after this task.
- Detent ordering per mode is defined in `src/data/selectorMaps.ts` (includes Reverb Off and Looper entries). `selectorIndex` in the dataset must stay within bounds for each mode.
- Manuals: use `docs/DL4_MkII_Manual.pdf` (and any other PDFs in `docs/`) for descriptions, inspirations, and knob behaviors.
- Common parameter wording helpers live in `src/data/commonParams.ts` to keep CCW/CW text consistent when applicable.

## Required deliverables

1. **Fill `src/data/effects.full.json`** with complete entries for:
   - 15 MkII delays
   - 15 Legacy delays
   - 15 Secret reverbs **plus** the Reverb Off position
   - The Looper position

   For each effect entry include:
   - `id`, `mode`, `displayName`, `selectorIndex`
   - `inspiration` ("A Line 6 original" or "Based on …")
   - `description` (short paragraph from the manual)
   - `tweak` and `tweez` objects with `label`, `behaviorCCW`, `behaviorCW`, and optional `rangeNote`
   - `notes` array when the manual calls out special behavior (e.g., Secret Reverb routing, REPEATS=Decay, MIX=Reverb Mix)

2. **Secret Reverb routing note:** include the ALT+TWEEZ routing order explanation and 0% / 50% / 100% meanings for the applicable models, as described in the manual.

3. **Validation:** run the Vitest suite to ensure:
   - Counts per mode match expectations
   - Every effect has required fields
   - `selectorIndex` is within bounds for its mode

4. **QA overlay:** Confirm the app no longer shows any "Not specified" placeholders (local dev `pnpm dev` if desired) after the dataset is filled.

## Implementation hints

- Follow the ordering already defined in `selectorMaps.ts` so `selectorIndex` aligns with the knob detents for each mode.
- Use consistent CCW/CW phrasing with `commonParams.ts` helpers whenever the manual references those shared parameters.
- Preserve JSON formatting; keep the file human-readable (indent=2).

## Commands

- Install deps (if needed): `pnpm install`
- Run tests: `pnpm test`
- Dev server (optional for QA overlay check): `pnpm dev` (Tauri dev)

Produce the updated dataset and commit changes.

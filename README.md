# MacDL MkII

A Tauri 2 + React + TypeScript + Vite + Tailwind desktop shell for exploring MkII delay and reverb models.

## Prerequisites
- [pnpm](https://pnpm.io/) 8+
- Rust toolchain (via `rustup`) for Tauri
- On macOS, Xcode Command Line Tools are sufficient. If the build process prompts for them, accept the install; full Xcode is **not** required.

## Setup
- Install dependencies with `pnpm install` (other package managers aren’t supported).
- If you switch branches or update the lockfile, rerun `pnpm install` to keep `node_modules` in sync.

## Scripts
- `pnpm dev` – start Vite in development mode (Tauri watcher can reuse it)
- `pnpm tauri dev` – run the Tauri shell with hot reload
- `pnpm build` – build the Vite frontend then bundle with Tauri
- `pnpm lint` – run ESLint with the TypeScript rules
- `pnpm test` – run Vitest (supports `--runInBand`/`-i` to force sequential runs)
- `pnpm format` – format the codebase with Prettier
- `pnpm storybook` – launch the component catalog on port 6006. If you see permission errors in CI/sandboxes, prefix with `HOME=$(pwd) pnpm storybook -- --disable-telemetry` to keep Storybook’s settings in the repo instead of `/home/node`.
- `pnpm storybook:build` – build the static Storybook site for publishing

## Architecture (frontend)
- Atomic layout: `components/atoms|molecules|organisms` compose the page; keep new UI in this stack.
- Styling: LESS modules per component, shared palette in `src/styles/tokens.less` (typed via `src/less.d.ts`).
- State: hooks in `src/hooks` (e.g., `useEffectLibrary`, `useKeyboardShortcuts`) drive selector state, search, and shortcuts (arrow keys for detents, 1/2/3 for modes, Cmd/Ctrl+F focuses search).
- Data: delay/reverb metadata comes from `src/data/effects.full.json` when present; otherwise `effects.skeleton.json` seeds the UI.
- Storybook: stories sit next to components for isolated dev; run with `pnpm storybook` (see command above) to preview atoms/molecules/organisms.

## Contributing (frontend conventions)
- Component placement: atoms (pure UI primitives), molecules (small compositions), organisms (feature blocks). Keep CSS in the component’s `.module.less`.
- Naming: prefer descriptive component names (e.g., `FootswitchRail`, `DetentWindow`); match story filenames to components.
- Tokens first: pull colors/spacings from `src/styles/tokens.less` instead of hardcoding values.
- Comments: add brief intent-driven comments only where behavior isn’t obvious (interaction handlers, layout quirks).
- Stories: add/update Storybook stories alongside new components to keep the catalog in sync.

## Notes
- The project avoids macOS frameworks that require full Xcode. If Tauri asks for developer tools, install the Command Line Tools only.
- Effects data live in `src/data/effects.full.json` once you paste the full set; the UI falls back to `effects.skeleton.json` for previews.
- Component styles use LESS modules with shared tokens in `src/styles/tokens.less`. Stories live alongside atoms/molecules/organisms for isolated testing.

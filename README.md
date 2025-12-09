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

## Notes
- The project avoids macOS frameworks that require full Xcode. If Tauri asks for developer tools, install the Command Line Tools only.
- Effects data live in `src/data/effects.full.json` once you paste the full set; the UI falls back to `effects.skeleton.json` for previews.

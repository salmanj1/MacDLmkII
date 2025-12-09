# Contributing Guide

This project uses React + TypeScript + Vite with an atomic component stack and LESS modules. Follow these conventions to keep the UI consistent and maintainable.

## Setup

- Package manager: `pnpm` only (`pnpm install`).
- Storybook dev server: `HOME=$(pwd) pnpm storybook -- --disable-telemetry` (avoids sandbox home dir issues). Build with `pnpm storybook:build`.
- App dev server: `pnpm dev` (or `pnpm tauri dev` for the desktop shell).

## Architecture

- Components live in `components/atoms`, `components/molecules`, `components/organisms`. Keep CSS in the matching `.module.less`.
- Design tokens: use `src/styles/tokens.less`; avoid hardcoded colors/spacings. LESS module typing is provided by `src/less.d.ts`.
- State/behavior: prefer hooks in `src/hooks` for shared logic (e.g., selector/search/shortcuts). Keep components mostly presentational.
- Data: effect metadata is loaded from `src/data/effects.full.json` when present; `effects.skeleton.json` seeds the UI for previews.
- Resilience: wrap risky UI in `ErrorBoundary` and expose `loading` props that use the `Skeleton` atom for placeholders.

## Style & naming

- Name components descriptively (e.g., `FootswitchRail`, `DetentWindow`). Align Storybook story filenames with component names.
- Comments should explain intent when behavior isn’t obvious (interaction handlers, layout quirks). Avoid redundant comments.
- Keep stories next to components and update them with any UI change; this keeps the catalog and visual checks in sync.
- Use `Skeleton` for loading visuals; only reach for inline styles to size skeletons when necessary.

## Testing and checks

- Type check: `pnpm tsc --noEmit`
- Lint: `pnpm lint`
- Unit tests: `pnpm test`
- Storybook visual check: `pnpm storybook` (local) or `pnpm storybook:build`

## Submitting changes

- Stick to the atomic folders; avoid inline styles—use the component’s `.module.less` and shared tokens.
- If you add keyboard or interaction patterns, document shortcuts/behaviors in the README and stories.
- Keep PRs focused; include notes on testing performed and any data requirements (e.g., needing `effects.full.json`).

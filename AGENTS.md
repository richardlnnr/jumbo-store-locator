# AGENTS.md

This file provides guidance to AI coding agents working in this repository. It is intentionally framework-agnostic so any agent harness (Claude Code, Cursor, Copilot, OpenCode, Aider, etc.) can consume the same instructions.

## Stack

Nuxt 4 + Vue 3 single-page app rendering a Mapbox GL JS map. UI is Nuxt UI v4 (Tailwind v4 under the hood). Tooling: Vitest (v8 coverage), ESLint via `@nuxt/eslint`, Husky + lint-staged, SonarCloud for analysis.

Node version is pinned in `.nvmrc` (24). `npm install` runs Husky `prepare` and Nuxt `postinstall` automatically.

## Commands

- `npm run dev` — dev server on `http://localhost:3000`
- `npm run build` / `npm run preview` — production build / local preview
- `npm run typecheck` — `nuxt typecheck` (vue-tsc against the references in `tsconfig.json`)
- `npm run lint` / `npm run lint:fix` — ESLint over the repo (CI runs with `--max-warnings=0`)
- `npm test` — full Vitest run (both projects)
- `npm run test:unit` — node-environment project only (matches `**/*.test.ts`)
- `npm run test:nuxt` — Nuxt-runtime project only (matches `**/*.nuxt.test.ts`)
- `npm run test:watch` — watch mode
- `npm run test:coverage` — produces `coverage/lcov.info` (consumed by SonarCloud)
- Run a single test file: `npx vitest run path/to/file.test.ts`
- Run a single test by name: `npx vitest run -t "Should …"`
- To target one project explicitly: append `--project unit` or `--project nuxt`

## Environment

Copy `.env.example` to `.env` and set `NUXT_PUBLIC_MAPBOX_TOKEN=pk.…`. The token is read via `runtimeConfig.public.mapboxToken` in `nuxt.config.ts` and consumed by `useMapbox()`. Restart the dev server after editing `.env`. Public Mapbox tokens are designed to ship to the browser, so `NUXT_PUBLIC_*` exposure is intentional — do not move it to a server-only key.

## Architecture

TBD.

## Tests

Tests are colocated next to source — there is no `test/` folder. The filename suffix selects the Vitest project:

- `*.test.ts` → `unit` project, `node` environment, no Nuxt runtime
- `*.nuxt.test.ts` → `nuxt` project, real Nuxt runtime via `@nuxt/test-utils` (use `mountSuspended`, `mockNuxtImport`, etc.)

Pick the suffix based on what the code under test actually needs. Composables that call `useRuntimeConfig()` need the Nuxt runtime; pure helpers do not. The `nuxt` project is wired through `defineVitestProject` in `vitest.config.ts` and inherits the Nuxt config — do not try to mock `useRuntimeConfig` manually in those tests, mutate `useRuntimeConfig().public.*` directly (see `useMapbox.nuxt.test.ts`).

Coverage includes only `app/**/*.{ts,vue}`; configs and test files are excluded.

## Style

**Use Nuxt UI for every UI primitive.** Buttons, inputs, modals, cards, layouts, icons, toasts, etc. must come from `@nuxt/ui` (`<UButton>`, `<UInput>`, `<UModal>`, `<UCard>`, `<UApp>`, …). Do not hand-roll equivalents in raw HTML/Tailwind, do not pull in another component library, and do not wrap a Nuxt UI component just to rename it. If a primitive seems missing, check the Nuxt UI catalog first (`https://ui.nuxt.com`); only fall back to a custom component when Nuxt UI genuinely has no equivalent, and document why in the component's source. Tailwind utility classes are fine for layout and spacing on top of Nuxt UI components — but the components themselves must be Nuxt UI.

ESLint stylistic rules are configured in `nuxt.config.ts` (`eslint.config.stylistic`): 4-space indent, single quotes, no semicolons, trailing commas always. `lint-staged` auto-fixes JS/TS/Vue on commit (`.husky/pre-commit`). Match this style when writing new code; CI fails on any warning.

## CI

- `.github/workflows/pull-request.yml` runs setup → lint, test (uploads `coverage/lcov.info`), typecheck, build, and SonarCloud (consumes the uploaded coverage).
- `.github/workflows/main.yml` runs SonarCloud on push to `main` with a fresh coverage run.
- `.github/actions/setup` is a composite action that pins Node from `.nvmrc`, caches `node_modules` + `.nuxt` keyed on `package-lock.json` + `nuxt.config.ts`, and `npm ci` on cache miss. Reuse it from new jobs instead of duplicating setup steps.
- Both workflows set `HUSKY=0` so `npm ci` does not try to install hooks in CI.

## Gotchas

- Native deps (`mapbox-gl`) ship platform-specific optional binaries. After adding/upgrading any dep with native bindings on macOS, delete `node_modules` and `package-lock.json`, then reinstall before committing — otherwise Linux CI breaks on `npm ci` (regression history in `548ea84`).
- Do not import `mapbox-gl` at module top level in any file that runs on the server. The dynamic import in `useMapbox` is load-bearing.
- `nuxt typecheck` reads from `tsconfig.json`'s project references (`./.nuxt/tsconfig.*.json`), which only exist after `nuxt prepare` has run. `postinstall` handles this; if typecheck complains about missing files, run `npx nuxt prepare` first.

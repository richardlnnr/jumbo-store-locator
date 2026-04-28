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

### Code style

ESLint stylistic rules are configured in `nuxt.config.ts` (`eslint.config.stylistic`): 4-space indent, single quotes, no semicolons, trailing commas always. `lint-staged` auto-fixes JS/TS/Vue on commit (`.husky/pre-commit`). Match this style when writing new code; CI fails on any warning.

**Always use arrow functions** for top-level functions, helpers, and callbacks: `const fn = (args) => …` instead of `function fn(args) {}`. Class methods and Vue component methods are exceptions. When you touch a file with legacy `function` declarations, migrate them opportunistically — but isolate the move in its own commit so the diff stays reviewable.

## Tests

Tests are colocated next to source — there is no `test/` folder. The filename suffix selects the Vitest project:

- `*.test.ts` → `unit` project, `node` environment, no Nuxt runtime
- `*.nuxt.test.ts` → `nuxt` project, real Nuxt runtime via `@nuxt/test-utils` (use `mountSuspended`, `mockNuxtImport`, etc.)

Pick the suffix based on what the code under test actually needs. Composables that call `useRuntimeConfig()` need the Nuxt runtime; pure helpers do not. The `nuxt` project is wired through `defineVitestProject` in `vitest.config.ts` and inherits the Nuxt config — do not try to mock `useRuntimeConfig` manually in those tests, mutate `useRuntimeConfig().public.*` directly (see `useMapbox.nuxt.test.ts`).

Coverage includes only `app/**/*.{ts,vue}`; configs and test files are excluded.

## Style

**Use Nuxt UI for every UI primitive.** Buttons, inputs, modals, cards, layouts, icons, toasts, etc. must come from `@nuxt/ui` (`<UButton>`, `<UInput>`, `<UModal>`, `<UCard>`, `<UApp>`, …). Do not hand-roll equivalents in raw HTML/Tailwind, do not pull in another component library, and do not wrap a Nuxt UI component just to rename it. If a primitive seems missing, check the Nuxt UI catalog first (`https://ui.nuxt.com`); only fall back to a custom component when Nuxt UI genuinely has no equivalent, and document why in the component's source. Tailwind utility classes are fine for layout and spacing on top of Nuxt UI components — but the components themselves must be Nuxt UI.

## Internationalization (i18n)

All user-facing text MUST go through `@nuxtjs/i18n`. Hardcoded strings in templates, scripts, alt text, aria labels, toast messages, page titles, and error messages are bugs. If a literal string can be read by a user, it must be a translation key.

**Locale files**: `i18n/locales/en.json` (default, source of truth) and `i18n/locales/nl.json`. Both ship in-repo and are bundled eagerly — there is no remote loading. English is the source of truth; Dutch is the supported translation. Supported locales are configured in `nuxt.config.ts` under `i18n.locales`; the `no_prefix` strategy keeps URLs stable when switching.

**Key shape**: Keys are nested objects grouped by surface, addressed with hyphenated paths. Group by where the string lives, not by what it says. Examples:

- `panel-header.title`, `panel-header.subtitle`, `panel-header.search-field`
- `store-list.empty-state`, `store-list.result-count`
- `filters.toggle-open-now`, `filters.clear`
- `store-popup.directions-link`, `store-popup.opening-hours`
- `status.open-now`, `status.opens-today-at`

Pick a surface name that matches the component or page. Do not create a `common` or `shared` bucket — duplication across surfaces is cheaper than a leaky abstraction here.

**Interpolation**: Use Vue I18n's `{name}` syntax — `"Opens today at {time}"` — and pass values via the second argument: `$t('status.opens-today-at', { time: '09:00' })`. Never concatenate strings.

**Adding a new string**:

1. Pick a surface group (or create one for a new component).
2. Add the key + English value to `i18n/locales/en.json`.
3. Add the same key with the Dutch translation to `i18n/locales/nl.json`. Never ship a key that exists only in `en.json` — `nl.json` must always be in sync.
4. Reference the key with `$t('group.key')` in templates or `const { t } = useI18n()` + `t('group.key')` in `<script setup>`.
5. Run `npm run typecheck`. The `experimental.typedOptionsAndMessages: 'default'` option generates types from `en.json`, so a typo in the key path fails the typecheck.

**Switching locale at runtime**: Use the built-in composable.

```ts
const { locale, locales, setLocale } = useI18n()
await setLocale('nl')
```

Switching does not navigate — the `no_prefix` strategy keeps the URL stable and the page re-renders reactively.

**Reactive head metadata**: When using `useHead` (or `useSeoMeta`) with translated values, pass a function so the title/meta re-evaluate on locale change. A bare string snapshot freezes at the first render.

```ts
useHead({
    title: () => t('app.title'),
})
```

**Tests**: Components that render translated text run in the `nuxt` Vitest project (`*.nuxt.test.ts`) so `useI18n` and the auto-loaded messages are available. Assert against the English translation since `en` is the default locale in tests. Do not mock `useI18n` — the real i18n runtime works inside `mountSuspended`.

**Forbidden patterns**:

- Hardcoded user-facing strings in `.vue` templates or scripts.
- A key in `en.json` without the matching key in `nl.json` (or vice versa).
- Conditional language toggles built by hand (`if (locale === 'nl') ...`) — use translation keys instead.
- Interpolation via string concatenation instead of `{name}` placeholders.
- Passing a translated string (not a getter) to `useHead`/`useSeoMeta` when locale switching is expected.

## CI

- `.github/workflows/pull-request.yml` runs setup → lint, test (uploads `coverage/lcov.info`), typecheck, build, and SonarCloud (consumes the uploaded coverage).
- `.github/workflows/main.yml` runs SonarCloud on push to `main` with a fresh coverage run.
- `.github/actions/setup` is a composite action that pins Node from `.nvmrc`, caches `node_modules` + `.nuxt` keyed on `package-lock.json` + `nuxt.config.ts`, and runs `npm install` on cache miss. `npm install` is used instead of `npm ci` so CI tolerates cross-platform lockfile drift — when a contributor runs `npm install` on macOS the lockfile records macOS-only optional binaries (`sharp`, `@emnapi/*`, `@parcel/watcher`) that Linux CI's `npm ci` would reject. `npm install` is idempotent when `package.json` and `package-lock.json` already agree, so unchanged-deps PRs still produce a clean install. Reuse this action from new jobs instead of duplicating setup steps.
- Both workflows set `HUSKY=0` so `npm install` does not try to install Git hooks in CI.

## Gotchas

- Do not import `mapbox-gl` at module top level in any file that runs on the server. The dynamic import in `useMapbox` is load-bearing.
- `nuxt typecheck` reads from `tsconfig.json`'s project references (`./.nuxt/tsconfig.*.json`), which only exist after `nuxt prepare` has run. `postinstall` handles this; if typecheck complains about missing files, run `npx nuxt prepare` first.

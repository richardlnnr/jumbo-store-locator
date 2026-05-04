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

## Components

**Every component lives in its own folder.** A component named `Foo` lives at `app/components/Foo/Foo.vue` and its colocated tests live alongside it (`app/components/Foo/Foo.nuxt.test.ts` or `Foo.test.ts`). Do not place loose `.vue` files directly under `app/components/`. Nuxt's `pathPrefix: true` de-duplicates consecutive path segments, so `Foo/Foo.vue` still auto-imports as `<Foo>` — the folder is purely organisational and does not change the tag.

**Slice large components into sub-components.** When a component has multiple distinct visual or logical sections — header, body sections, footer, list rows, etc. — extract each section into its own sub-component nested under the parent's folder, following the StorePopup layout:

```
app/components/StorePopup/
    StorePopup.vue
    StorePopup.nuxt.test.ts
    Header/
        Header.vue
        Header.nuxt.test.ts
    Address/
        Address.vue
        Address.nuxt.test.ts
    …
```

Sub-components auto-import with the parent's prefix (`StorePopup/Header/Header.vue` → `<StorePopupHeader>`). Slice when a component's template grows past a single screen, mixes unrelated concerns, or duplicates structure that could be data-driven. A bug fix or small feature does not need to slice a component — but a feature that doubles a component's size usually does.

**Forbidden patterns**:

- New components added as flat `.vue` files directly under `app/components/`.
- Sub-components placed in a sibling folder rather than nested inside the parent's folder (`app/components/StorePopupHeader/` instead of `app/components/StorePopup/Header/`).
- Cross-component relative imports between sibling components (`import StatusPill from '../StatusPill/StatusPill.vue'`) — rely on Nuxt auto-import in templates instead. Relative imports inside tests are fine because test files do not benefit from auto-import.

## Composables and utilities

The same folder-per-file convention extends to `app/composables/`, `app/utils/`, and `shared/utils/`. A composable named `useFoo` lives at `app/composables/useFoo/useFoo.ts` with its colocated test alongside; a util named `bar` lives at `app/utils/bar/bar.ts`. Unlike components, these are auto-imported by their named export rather than by file path, so the folder is purely organisational — it does not change the import name. The rule pays its way by giving private helpers a place to land when a composable or utility grows beyond a single file (extract them as siblings under the same folder), and by keeping the boundary mental model consistent across `components/`, `composables/`, and `utils/`. Sub-component slicing has no analogue here — a composable with internal helpers stays one auto-imported function, and its helpers are private.

Nuxt's auto-import only scans the top level of `composables/` and `utils/` by default; nested folders are picked up via `imports.dirs` in `nuxt.config.ts`:

```ts
imports: {
    dirs: [
        'composables/**',
        'utils/**',
    ],
},
```

If you ever flatten this layout, remove that block — but the layout is the standard, so leave it in place.

**Forbidden patterns**:

- New composables or utilities added as flat `.ts` files directly under `app/composables/`, `app/utils/`, or `shared/utils/`.

## Data flow: filters, ranking, aggregations live in the store

All filtering, ranking, and aggregation of `JumboStore` feature data MUST happen inside the Pinia store (`app/stores/useStoreLocator.ts`). Components, composables, and pages consume reactive properties exposed by the store — they never call `array.filter`, `array.sort`, `array.reduce`, or equivalent against `featureCollection.features` themselves.

The store delegates the algorithms to pure utilities under `app/utils/<name>/<name>.ts` (e.g. `matchFeatures`, `rankFeatures`, `aggregateCities`). Each util takes plain inputs and returns plain outputs — no Pinia, no Vue refs, no `useStoreLocator`. This keeps the store body readable, keeps the algorithms unit-testable in isolation, and ensures every consumer of "filtered features" or "ranked suggestions" sees the same answer because they share the same util.

When two views need related-but-different filtering (for example the side-list `filteredFeatureCollection` versus `autocompleteSuggestions`), share the matching predicate via the same util — never re-implement.

**Forbidden patterns**:

- `array.filter(...)`, `array.sort(...)`, or `array.reduce(...)` over `featureCollection.features` (or any reactive feature collection) inside `.vue` files or composables.
- Composables that re-implement matching, ranking, or aggregation already covered by a store computed.
- Adding a new "view" of feature data via component-local state.

**Required when you need a new view**:

1. Extract the algorithm into a pure util at `app/utils/<name>/<name>.ts` with a colocated `*.test.ts`.
2. Add a new `computed` to `useStoreLocator` that calls the util.
3. Consume the computed from the component or page.

```ts
// GOOD — store composes pure utils
const filteredFeatureCollection = computed(() =>
    filterFeatures({ features: features.value, query: query.value, /* ... */ }),
)
const autocompleteSuggestions = computed(() =>
    buildSuggestions(features.value, searchTerm.value),
)

// BAD — component runs its own filter
const matches = computed(() =>
    store.featureCollection?.features.filter(f => f.properties.name.includes(query.value)),
)
```

## Domain types live in `shared/types`

Pinia stores under `app/stores/` MUST NOT declare `interface` or `type` definitions for the data they expose. Every domain-level shape — anything a consumer (component, composable, test, page) might need to import as a type annotation — lives in `shared/types/<name>.ts` and is imported by the store.

This keeps stores focused on state and actions, lets every consumer import from a single canonical location, and avoids circular-import traps where a component reaches into a store just to grab a type.

The rule is scoped to **stores**. Component-internal helper types (e.g. a discriminated union used only inside a single `.vue` for a slot's items) and util-internal types (e.g. `HighlightSegment` returned by `app/utils/highlightMatch/`) stay where they are — only the data shapes the store *exposes* must move.

**Forbidden**:

- `export interface CitySuggestion { ... }` inside `app/stores/useStoreLocator.ts`.
- `type Foo = ...` declarations inside any file under `app/stores/` for shapes consumed outside that file.
- Components importing types from `app/stores/<name>.ts`.

**Required**:

- Add or extend a file under `shared/types/<name>.ts` with the type.
- Type-only imports from a store may use either the relative path (`'../../shared/types/<name>'`) or the `~~/shared/<name>` alias.
- **Value imports** from a store (constants, helper functions exported alongside the types) MUST use the `~~/shared/...` alias. Relative paths crossing out of `app/` for value imports cause Vite's SSR build to externalize the chunk with a literal `.ts` extension, which Nitro's bundler then fails to resolve. The alias is resolved before externalization, so the extension never leaks. The `unit` Vitest project resolves `~~` via `vitest.config.ts` (`resolve.alias`) so unit tests still load these imports.
- Components and composables import the same type from `~~/shared/types/<name>`.

```ts
// shared/types/storeSuggestion.ts
export interface CitySuggestion { /* ... */ }
export interface AutocompleteSuggestions { /* ... */ }
export const SUGGESTION_STORE_LIMIT = 5

// app/stores/useStoreLocator.ts
import type { AutocompleteSuggestions } from '~~/shared/types/storeSuggestion'
import { SUGGESTION_STORE_LIMIT } from '~~/shared/types/storeSuggestion'

// app/components/SearchAutocomplete/Mobile/Mobile.vue
import type { CitySuggestion } from '~~/shared/types/storeSuggestion'
```

## Responsive design

**Author every component mobile-first.** The base styles target the smallest screen, and larger breakpoints are layered on top with Tailwind's `sm:`, `md:`, `lg:`, `xl:`, and `2xl:` variants (which compile to `min-width` media queries). Do not invert this — the codebase relies on the unprefixed class always describing the mobile state, so a contributor can reason about a component on a phone by reading only the unprefixed classes.

**Forbidden patterns**:

- Tailwind `max-*:` variants (`max-md:flex-col`, `max-sm:hidden`, etc.). They reverse the reading order and mix poorly with the rest of the codebase.
- `@media (max-width: …)` queries inside `<style>` blocks. Use `@media (min-width: …)` if a raw query is unavoidable, but prefer Tailwind utilities first.
- Layouts written as desktop and "patched" smaller. If the base set of classes only makes sense on a wide viewport, the component is desktop-first — refactor it.

**Acceptable mobile-first idioms**:

- `class="hidden md:block"` — the element is genuinely mobile-hidden. The base state (`hidden`) describes the mobile reality; `md:block` reveals it on wider screens. This is mobile-first by Tailwind's definition, even though the rendered content is desktop-only.
- `class="flex flex-col md:flex-row"` — stack on mobile, side-by-side on desktop.
- `class="text-sm md:text-base"` — smaller type on mobile, scaled up on desktop.

**Breakpoints**: Use Tailwind's defaults (`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px). The current primary breakpoint in this app is `md` — it's where the two-pane layout (list + map) takes effect. Do not introduce custom breakpoints unless a design genuinely requires one; if you must, register it in the Tailwind config rather than reaching for ad-hoc arbitrary values.

**When you touch a file that violates this rule**, refactor it in a dedicated commit so the responsive flip is reviewable on its own, separate from any behavior change in the same PR.

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

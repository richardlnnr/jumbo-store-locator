# Jumbo Store Locator

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-store-locator&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-store-locator)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-store-locator&metric=coverage)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-store-locator)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-store-locator&metric=bugs)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-store-locator)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-store-locator&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-store-locator)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-store-locator&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-store-locator)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-store-locator&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-store-locator)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-store-locator&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-store-locator)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-store-locator&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-store-locator)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-store-locator&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-store-locator)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-store-locator&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-store-locator)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-store-locator&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-store-locator)

## Deployment

This project is deployed on **Vercel**. You can access the live app at <https://richardlnnr-jumbo.vercel.app/>.

## Setup

### Node version

The Node version is pinned in [`.nvmrc`](./.nvmrc) (currently Node 24). With [nvm](https://github.com/nvm-sh/nvm) installed, run:

```bash
nvm install   # installs the pinned version on first run
nvm use       # switches the current shell to it
```

### Mapbox setup

Mapbox GL JS is wired in through the `useMapbox()` composable (`app/composables/useMapbox.ts`). Provide a public Mapbox access token before running the app.

**Generating a token:** sign in at <https://account.mapbox.com/access-tokens/> (Mapbox accounts are free). You can either reuse the **Default public token** Mapbox creates for every account, or click **Create a token** to mint a new one. Public tokens start with `pk.` and ship with the scopes Mapbox GL JS needs in the browser by default — no extra configuration required.

Then copy it into your local env file:

```bash
cp .env.example .env
# then edit .env and set NUXT_PUBLIC_MAPBOX_TOKEN=pk.your-public-token
```

The token is exposed through `runtimeConfig.public.mapboxToken` and is safe to ship to the browser (public Mapbox tokens are designed for that). Restart the dev server after editing `.env`.

### Install dependencies

```bash
npm install
```

## Design Tokens

Canonical design tokens live in [`app/assets/css/tokens.css`](./app/assets/css/tokens.css) as a Tailwind v4 `@theme static` block. Defining a token there both creates the CSS variable and generates the matching Tailwind utility (e.g. `--color-yellow-500` ↔ `bg-yellow-500` / `text-yellow-500` / `border-yellow-500`).

### Categories

- **Color** — `--color-{name}-{50..950}` (yellow, neutral, green, red, orange, cyan, blue, pink).
- **Type** — `--text-{2xs..xl}` covering 10 / 12 / 14 / 16 / 20 / 24 px.
- **Spacing** — `--spacing-{2xs..3xl}` covering 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px (plus the Tailwind base `--spacing: 0.25rem`).
- **Radius** — `--radius-{sm,md,lg,xl,full}` at 4 / 8 / 12 / 16 / 9999 px.
- **Shadow** — `--shadow-{sm,md,lg}`.

### Rules

- **Color tokens are palette-style, never use-style.** Name by hue and scale step (`--color-neutral-300`), never by role (no `--border`, no `--success-bg`). Semantic meaning is applied at the consumer.
- **Spacing, sizing, and radius values must be multiples of 4.** Typography is exempt — type rhythms allow odd values.
- **Brand hexes come from [jumbo.com](https://www.jumbo.com)** (the live "kompas" stylesheet). New colors require a verified jumbo.com source — never invented, interpolated, or extrapolated. Steps without a brand-site source stay undefined and inherit Tailwind v4 defaults; this is intentional for sparse palettes (yellow, orange, cyan, blue, pink).

### Consumption

Either Tailwind utility classes:

```html
<div class="bg-yellow-500 text-neutral-950 p-md rounded-md shadow-md" />
```

…or raw CSS variables in scoped styles:

```css
.badge {
    background: var(--color-green-50);
    color: var(--color-green-700);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-md);
}
```

### Nuxt UI integration

[`app/app.config.ts`](./app/app.config.ts) aliases Nuxt UI's `primary` and `neutral` color slots to our `yellow` and `neutral` palettes, so every Nuxt UI component (`UButton`, `UInput`, etc.) inherits the brand without per-component overrides.

## Development Server

Start the dev server on `http://localhost:3000`:

```bash
npm run dev
```

## Feature flags

This project does not yet have a dedicated feature-flag system (no LaunchDarkly, Unleash, GrowthBook, or env-driven flag store). When a flag is needed for short-lived A/B testing or dogfooding, the chosen mechanism is the **URL query string**, read via `useRoute()`.

The router is a good fit for this for a few reasons:

- It is **reactive** — flipping the URL re-renders consumers without a reload.
- It is **SSR-safe** — `useRoute()` is available at server-render time, so the initial HTML matches the eventual hydrated UI (no flash of the wrong variant).
- It is **shareable** — paste the URL to QA or a teammate and they see the same variant.
- It needs **zero new dependencies** and no env-var coordination.

Drawbacks (visible to end users; not persistent across navigation; awkward for multi-flag scenarios) are acceptable for the current scope: short-lived, single-flag, dev/QA-driven testing.

### Active flags

| Flag      | URL              | Behavior                                            |
| --------- | ---------------- | --------------------------------------------------- |
| Search UI | `?search=legacy` | Renders `<Search>` (the previous text input).       |
|           | _absent_ / other | Renders `<SearchAutocomplete>` (default).           |

Examples:

- <http://localhost:3000/> — default (autocomplete).
- <http://localhost:3000/?search=legacy> — legacy input.

When the autocomplete has been validated long enough, this flag and its legacy branch can be removed by deleting `app/components/Search/`, the `useSearchVariant` composable, the `v-if`/`v-else` in `app/components/StoreList/StoreList.vue`, and this section.

## API

### `GET /api/stores`

Returns a [GeoJSON](https://geojson.org/) `FeatureCollection` where each `Feature<Point>` is a Jumbo store. Coordinates live in `geometry.coordinates` as `[longitude, latitude]` (per RFC 7946); the rest of the store record (id, name, websiteURL, facilities, commerce availability, address, opening hours) is carried in `properties`.

The handler reads `server/assets/data/jumbo-store-data.json` on every request and projects it into GeoJSON, treating the file as a thin integration layer over an upstream feed: adding a store to the source JSON surfaces it through `/api/stores` with no code change.

## Production

This project is deployed via **Vercel**:

- **Pull request branches** get automatic preview deployments — Vercel posts the preview URL on each PR.
- **`main`** auto-deploys to production at <https://richardlnnr-jumbo.vercel.app/>.

No manual build step is required — Vercel runs `nuxt build` on every push.

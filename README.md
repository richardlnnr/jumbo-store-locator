# Jumbo Store Locator

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-frontend-assignment&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-frontend-assignment)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-frontend-assignment&metric=coverage)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-frontend-assignment)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-frontend-assignment&metric=bugs)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-frontend-assignment)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-frontend-assignment&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-frontend-assignment)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-frontend-assignment&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-frontend-assignment)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-frontend-assignment&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-frontend-assignment)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-frontend-assignment&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-frontend-assignment)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-frontend-assignment&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-frontend-assignment)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-frontend-assignment&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-frontend-assignment)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-frontend-assignment&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-frontend-assignment)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=richardlnnr_jumbo-frontend-assignment&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=richardlnnr_jumbo-frontend-assignment)

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

## Development Server

Start the dev server on `http://localhost:3000`:

```bash
npm run dev
```

## Production

This project is deployed via **Vercel**:

- **Pull request branches** get automatic preview deployments — Vercel posts the preview URL on each PR.
- **`main`** auto-deploys to production at <https://richardlnnr-jumbo.vercel.app/>.

No manual build step is required — Vercel runs `nuxt build` on every push.

# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Mapbox setup

Mapbox GL JS is wired in through the `useMapbox()` composable (`app/composables/useMapbox.ts`). Before running the app, provide a public Mapbox access token:

```bash
cp .env.example .env
# then edit .env and set NUXT_PUBLIC_MAPBOX_TOKEN=pk.your-public-token
```

The token is exposed through `runtimeConfig.public.mapboxToken` and is safe to ship to the browser (public Mapbox tokens are designed for that). Restart the dev server after editing `.env`.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

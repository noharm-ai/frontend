# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server on port 3000
npm run build     # TypeScript check + production build
npm run lint      # ESLint
```

## Architecture

**Stack:** React 19, Redux Toolkit, Ant Design, Styled Components, Formik/Yup, Axios, i18next (PT-BR + EN-US), Vite.

**Directory layout:**

```
src/
  features/       # Feature modules — each has its own Redux slice + components
  pages/          # Full-page route components (Admin/, Reports/, Screening/, etc.)
  components/     # Shared reusable UI components
  containers/     # Legacy smart components connected to Redux
  store/ducks/    # Redux reducers organized by domain (auth, user, drugs, prescriptions…)
  services/       # Axios API calls (api.js is the main entry point)
  routes/         # All 60+ route definitions (routes.jsx)
  models/         # TypeScript enums and permission/feature/role constants
  styles/         # Theme, colors, breakpoints, global CSS
  translations/   # pt.json, en.json
```

**Path aliases** (defined in both `vite.config.ts` and `tsconfig.app.json`): `src`, `features`, `components`, `containers`, `store`, `services`, `lib`, `styles`, `utils`, `assets`, `hooks`, `models`.

## Key Patterns

**Authentication:** Access token is split across `localStorage` keys `ac1` + `ac2`; refresh token across `rt1` + `rt2`. The `autoRefreshToken` Redux middleware proactively refreshes before expiration. All routes are wrapped with `WithAuth` HOC (`lib/withAuth.jsx`).

**State:** Redux ducks pattern (`store/ducks/`). `redux-persist` keeps state in localStorage. New features should use Redux Toolkit slices inside `features/<domain>/`.

**API calls:** Single Axios instance in `services/api.js` with `VITE_APP_API_URL` as base URL and `x-api-key` header auth. Admin, reports, and regulation have separate service files under `services/`.

**Permissions:** `models/Permission.js` and `PermissionService.js` control feature access. `models/Feature.js` drives feature flags.

**Styling:** Prefer Styled Components; Ant Design v6 for structure/layout. Theme tokens are in `styles/theme.js` and `styles/colors.js`.

**Exports:** Always use named exports. Avoid default exports.

**Component file naming:** Each component lives in a folder named after it, with the main file matching the folder name — never `index.tsx`. Example: `TestComponent/TestComponent.tsx`, not `TestComponent/index.tsx`.

## Environment Variables

```
VITE_APP_API_URL           # Backend API base URL (required)
VITE_APP_API_KEY           # API key for x-api-key header (required)
VITE_APP_SITE_TITLE        # Browser tab title
VITE_APP_SUPPORT_EMAIL     # Support contact
VITE_APP_ENVIRONMENT       # DEV / PROD label
```

## E2E Tests

Tests use [Playwright](https://playwright.dev/) against a full local stack: PostgreSQL 11.6 + Python/Flask backend + Vite dev server.

### First-time setup

```bash
npm ci
npx playwright install --with-deps
make e2e-up        # build images and start containers (~2 min on first run)
make e2e-logs      # wait until backend is ready
```

### Running tests

```bash
make e2e           # reset DB + run all tests headless (Chromium)
make e2e-ui        # open Playwright interactive UI
```

### Other useful commands

| Command                 | Description                                  |
| ----------------------- | -------------------------------------------- |
| `make e2e-up`           | Start postgres + backend containers          |
| `make e2e-down`         | Stop and remove containers                   |
| `make e2e-rebuild`      | Rebuild backend image after upstream changes |
| `make e2e-db-reset`     | Reset DB only (without running tests)        |
| `make e2e-logs`         | Tail all container logs                      |
| `make e2e-logs-backend` | Tail backend logs only                       |

### Stack architecture

```
docker-compose.test.yml
  postgres (port 5432)  ← custom image with noharm SQL baked in
  backend  (port 5001)  ← noharm-ai/backend@develop, shares postgres network

Playwright (host)
  webServer: npm run dev   ← auto-started on port 3000
  VITE_APP_API_URL=http://localhost:5001
```

The backend container uses `network_mode: "service:postgres"` so `localhost` inside the backend resolves to the postgres container.

### Test files

```
tests/
  auth.setup.ts                    # login once, save auth state
  prioritization/
    cards.multi.spec.ts
    fastSearch.multi.spec.ts
  prescription/
    check.spec.ts
    intervention.spec.ts
    interventionOutcome.spec.ts
    conciliation.spec.ts
```

Tests run in Chromium only. Firefox/WebKit are commented out in `playwright.config.ts`.

### CI

Tests also run in GitHub Actions via `.github/workflows/playwright-test.yml` (manual trigger).

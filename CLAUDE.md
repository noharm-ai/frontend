# noHarm Frontend

## E2E Tests

Tests use [Playwright](https://playwright.dev/) against a full local stack: PostgreSQL 11.6 + Python/Flask backend (from `noharm-ai/backend`) + Vite dev server.

### Prerequisites

- Docker Desktop running
- Node.js (LTS) + `npm ci` already run

### First-time setup

```bash
npm ci
npx playwright install --with-deps   # install Playwright browsers
make e2e-up                          # build images and start containers (~2 min on first run)
make e2e-logs                        # wait until backend logs show it is ready
```

### Running tests

```bash
make e2e          # reset DB + run all tests headless (Chromium)
make e2e-ui       # open Playwright interactive UI (no auto-reset)
```

`make e2e` always resets the database before running so each run starts from clean state.

### Other useful commands

| Command | Description |
|---|---|
| `make e2e-up` | Start postgres + backend containers |
| `make e2e-down` | Stop and remove containers |
| `make e2e-rebuild` | Rebuild backend image after upstream changes |
| `make e2e-db-reset` | Reset DB only (without running tests) |
| `make e2e-logs` | Tail all container logs |
| `make e2e-logs-backend` | Tail backend logs only |

### Architecture

```
docker-compose.test.yml
  postgres (port 5432)     ← custom image with noharm SQL files baked in
  backend  (port 5001)     ← noharm-ai/backend@develop, shares postgres network
                              (localhost in backend = postgres container)

Playwright (host)
  webServer: npm run dev   ← auto-started on port 3000
  VITE_APP_API_URL=http://localhost:5001
```

The backend container uses `network_mode: "service:postgres"` so that `localhost` inside the backend resolves to the postgres container — matching the hardcoded connection string `postgresql://postgres@localhost/noharm`.

### Test files

```
tests/
  auth.setup.ts                    # login once, save auth state
  prioritization/
    cards.multi.spec.ts            # open patient cards
    fastSearch.multi.spec.ts       # search by prescription / admission
  prescription/
    check.spec.ts                  # check prescriptions with rollback
    intervention.spec.ts           # add interventions
    interventionOutcome.spec.ts    # intervention outcomes (suspension, substitution)
    conciliation.spec.ts           # conciliation view
```

Tests run in Chromium only. Firefox/WebKit are commented out in `playwright.config.ts`.

### DB reset details

`make e2e-db-reset` drops and recreates the `noharm` database inside the running postgres container, re-running the same SQL scripts that seeded it on first start (files are baked into the image at `/docker-entrypoint-initdb.d/db/`). Roles (`demo_user`, `api_user`, `noharmcare`) are dropped and recreated as part of this process.

### CI

Tests also run in GitHub Actions via `.github/workflows/playwright-test.yml` (manual trigger). The workflow provisions the same stack from scratch using GitHub-hosted runners.

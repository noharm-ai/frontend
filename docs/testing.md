# Testing guide

The project is covered by two Playwright end-to-end suites. They answer
different questions and are both run in CI.

| | Mocked suite | Real-backend suite |
|---|---|---|
| Location | `tests/mocked/` | `tests/prescription/`, `tests/prioritization/` |
| Backend | Every request intercepted and answered from fixtures | The real Flask backend and PostgreSQL in Docker |
| Runtime | Seconds | Minutes |
| Needs Docker | No | Yes |
| Good at | Error states, empty states, permission combinations, fast feedback | Catching a real change in the API contract |
| CI trigger | Every pull request (`e2e-mock.yml`) | Pull requests to `develop` / `master` (`playwright-test.yml`) |

Neither replaces the other: fixtures freeze the API contract as of the day they
were recorded, so only the real-backend suite notices when the backend changes a
payload shape.

## First-time setup

```bash
npm ci
npx playwright install --with-deps
```

For the real-backend suite only:

```bash
make e2e-up        # build the images and start the containers (~2 minutes the first time)
make e2e-logs      # wait until the backend reports ready
```

## Running

```bash
make e2e-mock      # mocked suite, headless — no Docker required
make e2e-mock-ui   # mocked suite in the Playwright interactive UI

make e2e           # reset the database, then the real-backend suite (Chromium, headless)
make e2e-ui        # real-backend suite in the interactive UI (no automatic reset)
```

Useful supporting targets:

| Command | Description |
|---|---|
| `make e2e-up` | Start the PostgreSQL and backend containers |
| `make e2e-down` | Stop and remove them |
| `make e2e-rebuild` | Rebuild the backend image after upstream changes |
| `make e2e-rebuild-postgres` | Rebuild the database image after SQL seed changes |
| `make e2e-db-reset` | Reset the database without running tests |
| `make e2e-logs` | Tail all container logs |
| `make e2e-logs-backend` | Tail only the backend |

Tests run in Chromium. Firefox and WebKit are present but commented out in
`playwright.config.ts`.

## How the stack fits together

```
docker-compose.test.yml
  postgres (5432)  ← image with the NoHarm SQL baked in
  backend  (5001)  ← noharm-ai/backend@develop, sharing the postgres network

Playwright (host)
  webServer: npm run dev   ← started automatically on port 3000
  VITE_APP_API_URL=http://localhost:5001
```

The backend container uses `network_mode: "service:postgres"`, so `localhost`
inside the backend resolves to the database container.

The real-backend specs share one seeded database and therefore run with
`--workers=1`: several of them act on the same prescription, and a checked
prescription renders a different interface. The mocked suite has no shared state
and runs in parallel.

## How the mocked suite works

- `support/mockApi.ts` — a `test.extend` fixture that installs a context-level
  route over `http://localhost:5001/**`. Nothing listens there; requests are
  fulfilled before they reach the network. Handlers are keyed by
  `"METHOD /path"`, and `:param` segments match anything
  (`GET /prescriptions/:id`).
- `support/defaultHandlers.ts` — happy-path handlers loaded for every test,
  mapping each endpoint to a file in `fixtures/`. Date placeholders such as
  `__DATE_NOW__` are hydrated at load time, so fixture data never goes stale.
- `support/token.ts` — builds an unsigned JWT with a far-future expiry. The app
  only base64-decodes the payload to schedule token refresh, so no real
  signature is needed.
- `auth.setup.ts` — logs in through the real login screen against the mocked
  `/authenticate`, producing genuine `localStorage` and `redux-persist` state.

To cover a new screen, add the fixture, register the handler, and write the spec
in the matching folder under `tests/mocked/`. `tests/mocked/README.md` has the
details, including how to record a fixture from a live session.

## Writing tests

- Prefer the mocked suite. It is fast enough to run on every save and can
  reproduce states that are impractical to seed.
- Select elements by role and accessible name where possible; fall back to
  `data-testid` rather than CSS structure.
- Assert on the state the user sees — a disabled submit button, a visible error
  — rather than on timers. Waiting on a fixed timeout makes a suite flaky.
- **Never use real people's data.** Fixtures, seeds and specs use invented names
  (`Fulano Beltrano`, `Maria Teste`, `E2E Test`), `example.com` addresses and
  clearly invalid document numbers. This is a healthcare product; real patient
  data in a public repository is a compliance incident.
- Never commit the generated authentication state in `playwright/.auth/`.

## Static checks

```bash
npm run lint     # ESLint
npm run build    # tsc -b + production build — the dev server does not type-check
```

Both run in CI on every pull request. Run them locally before pushing.

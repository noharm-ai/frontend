# Mocked e2e tests

Playwright tests that run against a **fully mocked backend**: every HTTP
request the app makes is intercepted with `context.route()` and answered
from fixture JSONs. No docker, no PostgreSQL, no Flask backend — the whole
suite runs in seconds and can simulate scenarios that are impossible to
seed in a real database (server errors, empty lists, race conditions).

These tests **complement** the suite in `tests/prescription` and
`tests/prioritization`, which runs against the real dockerized backend
(`make e2e`) and remains the integration safety net. Fixtures freeze the
API contract as of the day they were recorded — if the backend changes a
payload shape, only the real-backend suite will notice.

## Running

```bash
make e2e-mock        # headless (npm run test:e2e:mock)
make e2e-mock-ui     # Playwright interactive UI
```

No `make e2e-up` needed. The Vite dev server is started automatically.

## How it works

- `support/mockApi.ts` — a `test.extend` fixture that installs a
  context-level route on `http://localhost:5001/**` (nothing listens
  there; requests are fulfilled before they reach the network, popups
  included). Handlers are keyed by `"METHOD /path"`; `:param` segments
  match anything (`GET /prescriptions/:id`).
- `support/defaultHandlers.ts` — happy-path handlers loaded for every
  test, mapping endpoints to `fixtures/*.json`. Date placeholders like
  `__DATE_NOW__` are hydrated at load time so data is always fresh.
- `support/token.ts` — builds a fake (unsigned) JWT with a far-future
  `exp`. The app only base64-decodes the payload to schedule token
  refresh (`src/store/middlewares/autoRefreshToken.js`), so no real
  signature is needed.
- `auth.setup.ts` — logs in through the real login UI against the mocked
  `/authenticate`, producing genuine localStorage/redux-persist state in
  `playwright/.auth/mock-user.json` (never commit that file).

## Writing a test

```ts
import { test, expect } from "../support/mockApi";

test("shows empty state", async ({ page, mockApi }) => {
  // override any default handler (also works mid-test)
  mockApi.override("GET /prescriptions", {
    json: { status: "success", data: [] },
  });

  await page.goto("/priorizacao/pacientes/cards");
  // ...

  // inspect what the app sent
  const calls = mockApi.requests.filter((r) => r.path === "/prescriptions");
});
```

### Strict mode

Any request to an endpoint without a handler is fulfilled with status 599
and **fails the test** at teardown, listing the missing endpoints. That
list is your TODO list when mocking a new page. To explore a page before
writing fixtures, opt out with:

```ts
test.use({ strictMocks: false });
```

## Adding fixtures for a new page

1. Start the real stack (`make e2e-up`) and the dev server.
2. Record real payloads:
   `TEST_USER=... TEST_USER_PASSWORD=... npx tsx tests/mocked/support/record.ts /some/page`
   → JSON files land in `fixtures/recorded/` (git-ignored).
3. Curate: trim lists, remove volatile fields, replace dates with the
   `__DATE_*__` tokens documented in `support/defaultHandlers.ts`.
4. Move the curated file into `fixtures/<domain>/` and register it in
   `defaultHandlers()` (or `mockApi.override` it inside a single test).

Alternatively, run the page with `strictMocks: false`, look at the 599
list, and hand-write minimal fixtures based on what the reducers consume.

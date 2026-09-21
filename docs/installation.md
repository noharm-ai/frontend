# Installation guide

How to get the NoHarm web application running on a development machine, and how
to point it at a backend. If you only want to *use* a deployed instance, read
the [user guide](user-guide.md) instead.

## 1. Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 22.x | The version CI builds with |
| npm | 10+ | Ships with Node 22 |
| A running NoHarm backend | matching minor version | See below |
| Docker + Docker Compose | recent | Only for the real-backend end-to-end suite |

The application is a browser client and cannot do anything on its own — it needs
an API. You have three options:

1. Point it at a backend you already have (`VITE_APP_API_URL`).
2. Run the [backend](https://github.com/noharm-ai/backend) locally, following
   its installation guide.
3. Work against the mocked end-to-end suite, which intercepts every request and
   needs no backend at all — see [testing.md](testing.md).

## 2. Quick start

```bash
git clone https://github.com/noharm-ai/frontend.git
cd frontend

npm ci                 # install exactly the pinned dependency versions

cp .env.sample .env    # then set VITE_APP_API_URL (and VITE_APP_API_KEY if your
                       # backend requires one)

npm run dev            # http://localhost:3000
```

The Vite dev server runs on port 3000 with hot module replacement. Log in with
credentials that exist in the backend you pointed at; the backend's seed data
creates demo users.

## 3. Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Type-check (`tsc -b`) and build the production bundle into `dist/` |
| `npm run preview` | Serve the built bundle locally, to check a production build |
| `npm run lint` | Run ESLint over the project |
| `npm run test:e2e` | Playwright suite against a real backend |
| `npm run test:e2e:mock` | Playwright suite against the mocked backend |

The `Makefile` wraps the end-to-end infrastructure — see
[testing.md](testing.md).

## 4. Configuration

Configuration comes from environment variables read at **build time**. Vite only
exposes variables prefixed with `VITE_`. Copy `.env.sample` to `.env` and edit
it; `.env` is git-ignored.

### Required

| Variable | Description |
|---|---|
| `VITE_APP_API_URL` | Base URL of the NoHarm backend, e.g. `http://localhost:5000` |
| `VITE_APP_API_KEY` | Value sent in the `x-api-key` header. Required when the backend sits behind an API gateway that demands one |

### Interface

| Variable | Description |
|---|---|
| `VITE_APP_SITE_TITLE` | Browser tab title |
| `VITE_APP_URL` | Public URL of this application, used to build absolute links |
| `VITE_APP_VERSION` | Version shown in the interface; CI injects it from `package.json` |

### Optional links

| Variable | Description |
|---|---|
| `VITE_APP_SUPPORT_EMAIL` | Support address shown in the interface |
| `VITE_APP_ADMIN_LINK` | Link to the separate administration application |
| `VITE_APP_ODOO_LINK` | Link to the support/ERP portal |
| `VITE_MAIL_TEMPLATE_HOST` | Base URL for assets referenced by e-mail templates |

> **Everything in `.env` ends up in the bundle.** Vite inlines these values at
> build time and the result is downloaded by every browser that opens the app.
> Never put a password, a private key, a real personal e-mail address or a
> client identifier in a `VITE_*` variable. `VITE_APP_API_KEY` identifies the
> application to the gateway — it is not, and must never be, a user credential.

## 5. Connecting to a local backend

Run the backend on port 5000 (its default) and set:

```bash
VITE_APP_API_URL=http://localhost:5000
```

The backend must allow this origin in its CORS configuration. `development`
already permits `http://localhost:3000`; if you changed the dev server port,
update the backend configuration to match.

Frontend and backend are released together — run matching minor versions. A
frontend that is several versions ahead of its backend will call endpoints that
do not exist yet.

## 6. Editor setup

- **Path aliases** are declared in `vite.config.ts` and `tsconfig.app.json`.
  TypeScript-aware editors pick them up automatically; import
  `components/Button`, not `../../components/Button`.
- **ESLint** uses the flat config in `eslint.config.js`. Enable the ESLint
  extension for your editor so problems surface while you type.
- The project mixes `.jsx` and `.tsx`. New files should be TypeScript where the
  surrounding code allows it.

## 7. Troubleshooting

**Blank page and console errors about `undefined` URLs** — `VITE_APP_API_URL` is
not set. Vite reads `.env` only at startup; restart the dev server after
changing it.

**Every request fails with a CORS error** — the backend does not allow the
frontend's origin. Fix it on the backend side; it cannot be worked around in the
client.

**`401` on every call right after logging in** — the backend rejected the API
key, or the clock skew between machines invalidates the token. Check
`VITE_APP_API_KEY` first.

**Login succeeds but the app immediately returns to `/login`** — token storage
was blocked. The session lives in `localStorage` (keys `ac1`/`ac2` and
`rt1`/`rt2`); private-browsing modes and aggressive privacy extensions can
block it.

**`npm run build` fails on types but `npm run dev` works** — the dev server does
not type-check. Run `npm run build` (or `tsc -b`) before pushing.

**Playwright cannot find a browser** — run `npx playwright install --with-deps`
once.

**Dependency install fails behind a proxy** — `npm ci` needs access to the npm
registry; this repository pins exact versions and a `package-lock.json`, so
`npm ci` is the supported command rather than `npm install`.

## 8. Next steps

- [architecture.md](architecture.md) — how the application is organized
- [user-guide.md](user-guide.md) — what the screens do
- [testing.md](testing.md) — the two Playwright suites
- [deployment.md](deployment.md) — building and hosting the bundle
- [../CONTRIBUTING.md](../CONTRIBUTING.md) — making a change

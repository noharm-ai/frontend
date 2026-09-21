# Deployment guide

The application builds to a folder of static files. Anything that can serve
static files over HTTPS can host it — object storage behind a CDN, nginx, or a
container.

## 1. Build

```bash
npm ci
npm run build      # tsc -b && vite build  →  dist/
```

`dist/` contains `index.html`, hashed JavaScript and CSS bundles, and the
contents of `public/`.

**Environment variables are inlined at build time.** The bundle is tied to the
environment it was built for; you cannot repoint a built bundle at a different
API. Build once per environment, with that environment's variables set:

```bash
VITE_APP_API_URL=https://api.example.org \
VITE_APP_API_KEY=<gateway key> \
VITE_APP_SITE_TITLE='NoHarm' \
VITE_APP_URL=https://app.example.org \
VITE_APP_VERSION=$(node -p "require('./package.json').version") \
npm run build
```

Everything in the bundle is public. Never build with a secret in a `VITE_*`
variable.

## 2. Hosting

### Object storage + CDN (how the hosted platform runs)

```bash
aws s3 sync dist/ s3://<bucket> --acl public-read

# index.html must never be cached — it references the hashed bundles
aws s3 cp s3://<bucket>/index.html s3://<bucket>/index.html \
  --metadata-directive REPLACE \
  --cache-control "max-age=0,no-cache,no-store,must-revalidate" \
  --content-type text/html \
  --acl public-read
```

The hashed asset files can be cached aggressively; `index.html` cannot, or
browsers keep loading the previous release.

### A web server

Serve `dist/` and rewrite unknown paths to `index.html` — this is a
single-page app, so deep links such as `/priorizacao/prescricoes` must reach the
client router rather than return 404.

```nginx
server {
    root /var/www/noharm;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location = /index.html {
        add_header Cache-Control "no-store";
    }
}
```

## 3. Requirements around the deployment

- **HTTPS.** Session tokens live in the browser; serving the app over plain HTTP
  exposes them.
- **CORS on the backend** must allow the origin the app is served from.
- **A matching backend version.** Frontend and backend are released together;
  run matching minor versions.

## 4. Continuous delivery

Workflows in `.github/workflows/`:

| Workflow | Trigger | What it does |
|---|---|---|
| `build.yml` | Pull requests to `develop` / `master` | `npm ci` and `npm run build` on Node 22 |
| `e2e-mock.yml` | Every pull request | The mocked Playwright suite |
| `playwright-test.yml` | Pull requests to `develop` / `master` | The real-backend Playwright suite |
| `deploy-dev.yml`, `deploy-test.yml` | Push to the respective branches | Build and publish to the development / test bucket |
| `deploy-prod.yml` | Push to `master` | Build with production variables and publish to the production bucket |
| `*-manual.yml` | Manual dispatch | Redeploy an environment without a new commit |

The production workflow injects `VITE_APP_VERSION` from `package.json`, builds
with values from GitHub Actions secrets, syncs to the bucket and fixes the
cache headers on `index.html`. No environment value is stored in the
repository.

## 5. Release checklist

- [ ] `npm run lint` and `npm run build` pass.
- [ ] Both Playwright suites pass.
- [ ] `package.json` version bumped (see [CHANGELOG.md](../CHANGELOG.md)).
- [ ] The backend version this release expects is deployed first.
- [ ] Environment variables for the target environment are set in CI — no
      secret among them.
- [ ] After deploying, hard-reload and confirm the version shown in the
      interface.
- [ ] `index.html` is served with no-store caching.

## 6. Rolling back

Because the build is static, rolling back means republishing the previous
build. Keep the previous `dist/` artifact, or rebuild from the previous tag:

```bash
git checkout <previous-tag>
npm ci && npm run build
# publish dist/ again
```

If the rollback crosses a backend release that changed the API, roll the backend
back as well.

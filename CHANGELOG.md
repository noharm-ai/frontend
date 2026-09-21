# Changelog and release notes

## Where release notes live

Release notes for every version are published on the GitHub releases page:

**<https://github.com/noharm-ai/frontend/releases>**

Each release lists the pull requests merged since the previous one, with their
authors and a link to the full diff. That page is the authoritative record;
this file documents how versions are numbered and how a release is produced.

## Versioning scheme

Versions follow `MAJOR.MINOR.PATCH`, as recorded in `package.json` and shown in
the interface (CI injects it into the build as `VITE_APP_VERSION`).

| Component | Incremented when |
|---|---|
| `MAJOR` | A significant platform change — a new navigation model, a new major dependency generation, or anything requiring a coordinated backend release |
| `MINOR` | A regular release: new screens, new capabilities, reworked flows |
| `PATCH` | Fixes and small improvements with no new capability |

The [backend](https://github.com/noharm-ai/backend) is versioned separately
(`v<MAJOR>.<MINOR>-beta`) but released in step with this repository. **Running
matching minor versions of both is the supported configuration** — the frontend
calls endpoints that a older backend may not have.

## Recent releases

| Version | Date |
|---|---|
| [v6.3.10](https://github.com/noharm-ai/frontend/releases/tag/v6.3.10) | 2026-08-26 |
| [v6.3.3](https://github.com/noharm-ai/frontend/releases/tag/v6.3.3) | 2026-07-15 |
| [v6.2.14](https://github.com/noharm-ai/frontend/releases/tag/v6.2.14) | 2026-06-01 |
| [v6.2.2](https://github.com/noharm-ai/frontend/releases/tag/v6.2.2) | 2026-04-13 |
| [v6.1.0](https://github.com/noharm-ai/frontend/releases/tag/v6.1.0) | 2026-03-16 |

See the [releases page](https://github.com/noharm-ai/frontend/releases) for the
complete history and the notes of each version.

## Release process

1. Work is merged into `develop` through pull requests. Every pull request runs
   the build, the mocked end-to-end suite and the real-backend suite; merging
   deploys to the test environment.
2. The version in `package.json` is bumped.
3. When `develop` is ready to ship, it is merged into `master`.
4. A push to `master` builds with the production variables and publishes the
   static bundle.
5. A tagged release is published on GitHub with generated notes.

## Upgrading a deployment

Deploy a compatible backend version first, then publish the new bundle. The
release checklist is in
[docs/deployment.md](docs/deployment.md#5-release-checklist); rolling back is
covered in the section after it.

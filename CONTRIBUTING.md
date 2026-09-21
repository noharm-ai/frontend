# Contributing to the NoHarm frontend

Thank you for considering a contribution. This project is open source and open
to outside contributors — bug reports, translations, accessibility fixes,
documentation and features are all welcome.

By participating you agree to abide by our
[Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

| | Where to start |
|---|---|
| Report a bug | [Open an issue](https://github.com/noharm-ai/frontend/issues) with steps to reproduce, the browser, and what you expected |
| Suggest a feature | Open an issue describing the clinical or operational problem first |
| Improve documentation | Edit `docs/` and open a pull request; no issue required |
| Improve a translation | Edit `src/translations/pt.json` or `en.json` |
| Fix a bug or build a feature | Follow the workflow below |
| Report a vulnerability | **Do not open an issue** — follow [SECURITY.md](SECURITY.md) |

## Development workflow

### 1. Set up

Follow [docs/installation.md](docs/installation.md):

```bash
git clone https://github.com/<your-username>/frontend.git
cd frontend
npm ci
cp .env.sample .env      # set VITE_APP_API_URL
npm run dev
```

You need a backend to talk to — either a local
[noharm-ai/backend](https://github.com/noharm-ai/backend) or the mocked
Playwright suite, which needs none.

Read [docs/architecture.md](docs/architecture.md) before your first change. It
explains the two generations of code in the repository and which one new work
belongs in.

### 2. Fork and branch

| Branch | Purpose |
|---|---|
| `master` | Production. Never commit to it directly. |
| `develop` | Integration branch. **Branch from here and target it in your pull request.** |
| `feature/...`, `fix/...` | Your work |

```bash
git remote add upstream https://github.com/noharm-ai/frontend.git
git fetch upstream
git checkout -b fix/short-description upstream/develop
```

### 3. Write the change

Conventions that reviewers check:

- **New state goes in `features/<domain>/`** as a Redux Toolkit slice. Do not
  add to `containers/` or `store/ducks/` — those are legacy and are migrated
  opportunistically.
- **Named exports only.** No default exports.
- **One component per folder, named after the folder** —
  `TestComponent/TestComponent.tsx`, never `index.tsx`.
- **Import through the path aliases** (`components/…`, `features/…`), not
  `../../../`.
- **Styled Components for styling**, Ant Design for structure and layout, and
  the tokens in `styles/theme.js` / `styles/colors.js` instead of literal
  colors.
- **All user-facing text through i18next.** Add the key to both `pt.json` and
  `en.json`; never hard-code a string in a component.
- **API calls go through `services/`**, never `axios` directly from a component.
- **Gate features by permission and feature flag** using
  `PermissionService` and `FeatureService`. Hiding a control is a usability
  measure — the backend enforces the rule, so never rely on the client for
  security.
- **TypeScript for new files** wherever the surrounding code allows it.

### 4. Test

```bash
npm run lint         # ESLint
npm run build        # tsc -b + build — the dev server does not type-check
make e2e-mock        # mocked Playwright suite (fast, no Docker)
make e2e             # real-backend suite, when your change touches the API contract
```

New user-facing behaviour needs coverage in the mocked suite. See
[docs/testing.md](docs/testing.md).

All three must pass locally before you push.

### 5. Commit

Imperative mood, with a type prefix:

```
fix: keep the segment filter after switching organization
feat: show culture alerts on the prescription card
docs: document the authentication flow
test(e2e): cover password recovery in the mocked suite
refactor: move the drug list into a feature slice
```

Keep the subject under ~72 characters; explain *why* in the body when it is not
obvious.

### 6. Open a pull request

Target `develop`. Describe what changed, why, and how you tested it; link the
issue it closes. If the change is visual, include before/after images —
screenshots of invented data only, never a real patient's record.

Pull requests run the build, the mocked suite and the real-backend suite
automatically. Keep them focused: one problem per pull request.

## Test data

**Never put a real person's data in this repository.** Not in code, tests,
fixtures, comments, commit messages or screenshots. This covers names, e-mail
addresses, phone numbers, CPF, CNS, addresses, patient records and credentials —
including your own and the maintainers'.

Use obviously fictitious values:

| Kind | Use |
|---|---|
| People | `Fulano Beltrano`, `Ciclano de Tal`, `Maria Teste`, `E2E Test` |
| E-mail | `fulano@example.com` (`example.com` is reserved for this) |
| Documents | Clearly invalid placeholders — never a real or checksum-valid CPF/CNS |
| Patients | Synthetic names and identifiers only |

The same holds for configuration: no API keys, client names, hospital hostnames
or environment URLs. `.env` is git-ignored — keep it that way, and remember that
every `VITE_*` value ends up in the public bundle.

Never commit the Playwright authentication state in `playwright/.auth/`.

## Dependencies

Pin exact versions in `package.json` (the existing entries have no `^`), commit
the updated `package-lock.json`, and explain in the pull request why the
dependency is needed. Bundle size matters — the application is loaded over
hospital networks.

## Accessibility and internationalization

- Interactive elements need accessible names; tests select by role.
- The interface must work at the zoom levels and screen sizes hospital
  workstations actually use.
- Portuguese is the reference language, English the second. A feature landing
  with only one of them translated is incomplete.

## Review and merge

A maintainer reviews every pull request. Expect questions about clinical clarity
as well as code — an ambiguous label on a dose alert is a patient-safety issue.
Once approved and green, a maintainer merges into `develop`; it reaches
production on the next release.

## Licence

Contributions are accepted under the repository's [MIT licence](LICENSE). By
submitting a pull request you confirm that you have the right to contribute the
code and that it may be distributed under that licence.

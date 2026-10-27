---
name: release
description: >
  Cut a frontend release: bump the version in package.json, run npm install so
  package-lock.json follows, commit "vX.Y.Z" on develop, push develop and open the
  develop → master release PR listing what ships. Use when the user asks to
  "release", "cut a release", "bump the version", "open the PR to master" or
  invokes /release. Takes an optional argument: patch (default), minor, major or
  an explicit version such as 6.6.0.
---

# Release

Every release is one commit on `develop` that touches only `package.json` and
`package-lock.json`, followed by a PR from `develop` to `master` titled with the
version. Reference: commit `59caa26f` / PR #718 (v6.5.6).

## 1. Preconditions

```bash
git fetch origin
git status -sb   # must be on develop, clean, and even with origin/develop
```

Stop and report if the tree is dirty, the branch isn't `develop`, or it is
ahead/behind `origin/develop`. Also stop if `git log origin/master..origin/develop`
is empty — there is nothing to release.

## 2. Bump the version

Read the current `"version"` in `package.json`. Bump **patch** unless the user
passed `minor`, `major` or an explicit version (feat commits do not imply a
minor bump here — history bumps patch for them too).

Edit the version line in `package.json` directly. Do **not** use `npm version`:
it commits and tags on its own.

```bash
npm install
git diff --stat
```

The diff must be exactly `package.json` (1 line) and `package-lock.json`
(2 lines, the two `"version"` fields). If npm moved anything else in the lock,
stop and report it instead of folding dependency drift into the release commit.

## 3. Commit and push

```bash
git add package.json package-lock.json
git commit -m "vX.Y.Z"   # plus the Co-Authored-By trailer
git push origin develop
```

The review-gate pre-push hook skips protected refs (`develop`, `master`), so no
review receipt is needed. GitHub prints a "Changes must be made through a pull
request" bypass notice; the push still goes through.

## 4. Open the release PR

Collect what ships, newest first:

```bash
git log --merges --format=%s origin/master..origin/develop   # "Merge pull request #N ..."
gh pr view <N> --json number,title -q '"- #\(.number) — \(.title)"'
git log --no-merges --format=%s origin/master..origin/develop
```

List each merged PR as `- #N — title`. Commits made straight on develop (no
PR) go in as plain `- subject` lines. Leave out the `vX.Y.Z` commit itself and
commits that belong to a listed PR.

Write the body to a scratchpad file:

```markdown
## Release vX.Y.Z

- #720 — test(e2e-mock): ...
- #719 — feat(reports): ...
- fix: some direct commit

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

```bash
gh pr create --base master --head develop --title vX.Y.Z --body-file <file>
```

Reply with the PR URL and the version.

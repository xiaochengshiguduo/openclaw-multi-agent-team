English | [中文](release-checklist.zh-CN.md)

# Release Checklist

Use this checklist before creating a release tag, GitHub release, or changing repository visibility.

## 1. Scope confirmation

- [ ] This is a reusable template/toolkit, not a private workspace backup.
- [ ] v1 is Linux only.
- [ ] OpenClaw installation/update is out of scope.
- [ ] Config patching remains preview-first: one-command reproduction requires explicit `--apply`; lower-level config helpers remain manual.
- [ ] Gateway restart can happen only in the dedicated reproducer after explicit `--apply`; ordinary helpers do not restart Gateway.
- [ ] Telegram binding remains on `main` only by default.

## 2. Required local checks

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
node scripts/repro-check.js --target /tmp/oc-mat-release-repro
node scripts/repro-check.js --target /tmp/oc-mat-ci-repro --allow-missing-openclaw  # repository CI only
node tests/smoke/run.js
```

Expected:

```text
# doctor-local: ok
# healthcheck-local: ok
# repro-check: ok or warning only
smoke tests passed
```

## 3. Secret/private-data scan

Before staging, confirm no private runtime state is present:

```bash
git status --short
git ls-files --others --exclude-standard
```

Must not include:

- `openclaw.json`
- `openclaw.json.*`
- auth profiles
- sessions/transcripts/logs
- `.env`
- private keys
- real `MEMORY.md`
- private `USER.md`
- private `TOOLS.md`
- real task archives

## 4. Git staging review

```bash
git add .
git status --short
git diff --cached --stat
git diff --cached --name-only
```

Review before commit.

## 5. Release commit

Only after maintainer confirmation:

```bash
git commit -m "Prepare v1.0.0 release"
```

## 6. GitHub release readiness

Before creating a release tag or changing repository visibility:

- [ ] repository name is correct
- [ ] README renders properly
- [ ] CI passes
- [ ] SECURITY.md is present
- [ ] LICENSE is present
- [ ] issue/PR templates are present
- [ ] no private local paths are exposed in docs/examples except intentional generic placeholders

## 7. Post-release sanity

After creating a tag, GitHub release, or visibility change:

- [ ] clone into a clean temp directory
- [ ] run local checks
- [ ] run `repro-check.js`
- [ ] verify README quick start

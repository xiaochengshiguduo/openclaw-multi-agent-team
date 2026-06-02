English | [中文](preflight.zh-CN.md)

# Preflight

Preflight is the final local audit before staging or publishing.

Recommended commands:

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
node scripts/repro-check.js --target /tmp/oc-mat-preflight-repro
node tests/smoke/run.js
git status --short
git ls-files --others --exclude-standard
```

For a detailed release process, see [`release-checklist.md`](release-checklist.md).

# 预检

Preflight 是暂存或发布前的最后一次本地审计。

推荐命令：

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
node scripts/repro-check.js --target /tmp/oc-mat-preflight-repro
node tests/smoke/run.js
git status --short
git ls-files --others --exclude-standard
```

详细发布流程请参见 [`release-checklist.md`](release-checklist.md)。

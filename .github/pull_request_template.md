English | [中文](pull_request_template.zh-CN.md)

## Summary

## Type of change

- [ ] Docs only
- [ ] Role/template change
- [ ] Script change
- [ ] Test/check change
- [ ] Security/safety boundary change

## Safety checklist

- [ ] No real `openclaw.json` or backups
- [ ] No tokens, API keys, auth profiles, Telegram bot tokens, Gateway tokens
- [ ] No real `MEMORY.md`, private `USER.md`, sessions, transcripts, or logs
- [ ] Write-capable script remains dry-run by default
- [ ] `--apply` is required for writes
- [ ] No automatic Gateway restart
- [ ] No automatic Telegram binding for sub-agents

## Validation

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
node scripts/repro-check.js --target /tmp/oc-mat-repro
node tests/smoke/run.js
```

## Notes

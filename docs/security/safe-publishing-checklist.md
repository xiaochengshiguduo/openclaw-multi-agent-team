English | [中文](safe-publishing-checklist.zh-CN.md)

# Safe Publishing Checklist

Before git commit or GitHub upload:

- [ ] No real OpenClaw config files
- [ ] No config backups
- [ ] No tokens or API keys
- [ ] No Telegram bot tokens
- [ ] No Gateway tokens
- [ ] No auth profiles
- [ ] No sessions/transcripts/logs
- [ ] No real memory or private user files
- [ ] No private task archives
- [ ] Examples are fake/sanitized
- [ ] `node scripts/healthcheck-local.js` passes
- [ ] `node tests/smoke/run.js` passes
- [ ] secret/path scan passes

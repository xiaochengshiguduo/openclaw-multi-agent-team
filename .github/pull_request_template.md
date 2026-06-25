## 摘要

## 变更类型

- [ ] 仅文档
- [ ] Role/template 变更
- [ ] Script 变更
- [ ] Test/check 变更
- [ ] Security/safety boundary 变更

## 安全检查清单

- [ ] 不包含真实 `openclaw.json` 或备份
- [ ] 不包含 tokens、API keys、auth profiles、Telegram bot tokens、Gateway tokens
- [ ] 不包含真实 `MEMORY.md`、私有 `USER.md`、sessions、transcripts 或 logs
- [ ] 可写脚本默认仍然是 dry-run
- [ ] 写入必须显式使用 `--apply`
- [ ] 不自动 Gateway restart
- [ ] 不自动为 sub-agents 绑定 Telegram

## 验证

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
node scripts/repro-check.js --target /tmp/oc-mat-repro
node tests/smoke/run.js
```

## 备注

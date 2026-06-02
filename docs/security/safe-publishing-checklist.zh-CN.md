[English](safe-publishing-checklist.md) | 中文

# 安全发布检查清单

在 git commit 或上传到 GitHub 之前：

- [ ] 没有真实 OpenClaw 配置文件
- [ ] 没有配置备份
- [ ] 没有 token 或 API key
- [ ] 没有 Telegram bot token
- [ ] 没有 Gateway token
- [ ] 没有认证配置
- [ ] 没有会话 / 转录记录 / 日志
- [ ] 没有真实记忆或用户私有文件
- [ ] 没有私有任务归档
- [ ] 示例均为虚构 / 已脱敏
- [ ] `node scripts/healthcheck-local.js` 通过
- [ ] `node tests/smoke/run.js` 通过
- [ ] secret / path 扫描通过

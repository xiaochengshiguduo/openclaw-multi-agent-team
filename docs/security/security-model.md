# 安全模型

本仓库绝不能包含真实 OpenClaw runtime 状态或私人用户数据。

## 永远不要提交

- `openclaw.json` 或备份
- API keys 或 model provider tokens
- Telegram bot tokens
- Gateway tokens
- auth profiles
- sessions 或 transcripts
- 包含 secrets 的 logs
- 真实 `MEMORY.md`
- 私有 `USER.md`
- 私有 `TOOLS.md`
- 真实任务档案

## 脚本规则

- 可写脚本默认 dry-run。
- 写入、执行命令、修改配置或重启 Gateway 都必须显式使用 `--apply`。
- Config helpers 必须 preview-first。
- 低层辅助脚本不重启 Gateway。
- 专用复现/更新流程可以在显式 `--apply` 后重启 Gateway，让已验证的路由配置或托管 runtime 更新生效；支持时可用 `--no-restart` 延后重启。
- 子 Agents 默认不绑定 Telegram。

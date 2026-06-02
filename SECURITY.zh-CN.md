[English](SECURITY.md) | 中文

# 安全策略

本项目绝不能包含真实的 OpenClaw 运行时密钥或私有用户数据。

## 不要提交

- OpenClaw 配置文件：`openclaw.json`、`openclaw.json.*`
- API key、模型 key、Telegram bot token、Gateway token
- 认证 profile、会话、日志、转录记录
- 真实的 `MEMORY.md`、私有的 `USER.md`、私有的 `TOOLS.md`
- 私有任务归档
- SSH key、云凭据、`.env` 文件

## 脚本安全规则

- 具备写入能力的脚本默认使用 dry-run。
- 写入必须显式使用 `--apply`。
- Gateway 重启绝不会自动执行。
- Agent 注册/配置辅助工具必须先预览变更，再应用。
- 子 Agent 默认不绑定到 Telegram。

## 支持的平台

首个版本：仅 Linux。

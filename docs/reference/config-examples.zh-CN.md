[English](config-examples.md) | 中文

# 配置示例

配置示例是占位示例。它们不是真实的 OpenClaw 运行时配置文件。

参见：

- `examples/config/agent-to-agent.example.json5`
- `examples/config/agents.example.json`
- `examples/config/openclaw-config-patch.example.json5`

## 安全

应用任何配置补丁之前：

1. 备份当前 OpenClaw 配置。
2. 审查补丁。
3. 根据你的 OpenClaw 版本 / schema 进行验证。
4. 显式应用。
5. 仅在确有需要时手动重启 Gateway。

本项目不包含真实 token、认证配置、Telegram bot token、模型密钥或 Gateway token。

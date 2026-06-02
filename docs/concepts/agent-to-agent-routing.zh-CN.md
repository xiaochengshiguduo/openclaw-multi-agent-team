[English](agent-to-agent-routing.md) | 中文

# Agent 到 Agent 路由

OpenClaw 的 Agent 到 Agent 通信允许 `main` 向角色 Agent 发送任务简报。

重要边界：

- Agent 到 Agent 允许列表必须同时包含 `main` 和目标角色 Agent ID。
- `main` 必须在 `agents.list[].subagents.allowAgents` 中显式允许角色 Agent；否则 `sessions_spawn(agentId=<role>)` 会退回 requester-only，只允许 `main`。
- 根据 OpenClaw 的版本/配置，Session 可见性可能需要允许跨 Agent 访问。
- 默认情况下，子 Agent 不应绑定 Telegram。
- 子 Agent 应向 `main` 返回结构化输出。
- 配置变更后可能需要重启 Gateway，并且必须由人工确认。

使用 `scripts/configure-agent-routing.js` 预览一个安全的示例补丁。此版本不会自动修改配置。

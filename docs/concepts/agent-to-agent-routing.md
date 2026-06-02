English | [中文](agent-to-agent-routing.zh-CN.md)

# Agent-to-Agent Routing

OpenClaw agent-to-agent communication lets `main` send briefs to role Agents.

Important boundaries:

- The agent-to-agent allowlist must include both `main` and target role Agent IDs.
- `main` must explicitly allow role Agents in `agents.list[].subagents.allowAgents`; otherwise `sessions_spawn(agentId=<role>)` falls back to requester-only and only allows `main`.
- Session visibility may need to allow cross-agent access, depending on OpenClaw version/config.
- Sub-agents should not be Telegram-bound by default.
- Sub-agents should return structured output to `main`.
- Gateway restart may be required after config changes and must be manually confirmed.

Use `scripts/configure-agent-routing.js` to preview a safe example patch. It does not modify config automatically in this version.

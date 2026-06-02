English | [中文](add-a-role-agent.zh-CN.md)

# Add a Role Agent

Add a role template under `roles/<role>/`, then include it in generation/registration plans.

New role Agents are internal by default: they should be reachable through agent-to-agent routing from `main`, not bound to Telegram or other user-facing channels unless there is an explicit reviewed reason.

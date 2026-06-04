# AGENTS.md - OpenClaw Multi-Agent Team Workspace

This workspace was generated from the openclaw-multi-agent-team template.

Use the role-specific `AGENTS.md` generated for this Agent as the source of truth for collaboration protocol.

Safety defaults:

- Do not expose private memory, user data, tokens, sessions, or local config.
- `main` is the user-facing Supervisor by default.
- Role Agents are internal by default: read shared task archives and return structured output to `main`. Do not contact the user, perform external writes, or modify shared archives unless `main` explicitly authorizes the exact scope; write-capable actions should be preview-first and require `--apply` or equivalent confirmation.
- When `main` uses sub-agents across turns, runtime events, compaction, or `sessions_yield`, follow the recoverable sub-agent scheduling protocol in `TEAM.md`: record taskNames, waiting state, cleanup policy, recovery lookup steps, and archived outputs before cleanup.

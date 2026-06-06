# Task Metadata

## Identity

- Task ID: TASK-YYYYMMDD-HHMM-short-name
- Title: <简短、可读的标题>
- Created: YYYY-MM-DD HH:mm TZ
- Last updated: YYYY-MM-DD HH:mm TZ
- Owner: main
- Current stage: intake | clarify | plan | execute | review | final | archived
- Current status: active | waiting-user | waiting-agent | blocked | completed | cancelled

## Source

- User request: <简短引用或摘要>
- Source channel: Telegram / Web / Other
- Source agent: main
- Related messages: <可选的脱敏引用；不要在提交示例中保存私有 Telegram/runtime ID>

## Visibility

- Archive path: shared/tasks/TASK-YYYYMMDD-HHMM-short-name/
- Workspace visibility: 通过 `<role-workspace>/shared -> <OPENCLAW_HOME>/workspace/shared` 共享
- Sensitive data: none | redacted | present-with-restrictions
- External action risk: none | low | medium | high

## Participants

- main: owner / user-facing supervisor
- pm: not-needed | pending | done | blocked
- architect: not-needed | pending | done | blocked
- backend: not-needed | pending | done | blocked
- frontend: not-needed | pending | done | blocked
- qa: not-needed | pending | done | blocked
- reviewer: not-needed | pending | done | blocked
- security: not-needed | pending | done | blocked
- devops: not-needed | pending | done | blocked
- docs: not-needed | pending | done | blocked
- research: not-needed | pending | done | blocked

## Downstream Context Contract

当 main 要求某个角色 Agent 处理本任务时，至少包含：

- Task ID
- Objective
- Current stage/status
- Relevant shared files
- Upstream conclusions
- Scope / non-goals
- Acceptance criteria
- Known risks / blockers
- Explicit permissions

## Decision Log

- YYYY-MM-DD HH:mm TZ — <decision> — owner: <main/role/user>

## Blockers

- [info] ...
- [warning] ...
- [blocking] ...

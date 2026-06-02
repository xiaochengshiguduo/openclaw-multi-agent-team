# Task Metadata

## Identity

- Task ID: TASK-YYYYMMDD-HHMM-short-name
- Title: <short human-readable title>
- Created: YYYY-MM-DD HH:mm TZ
- Last updated: YYYY-MM-DD HH:mm TZ
- Owner: main
- Current stage: intake | clarify | plan | execute | review | final | archived
- Current status: active | waiting-user | waiting-agent | blocked | completed | cancelled

## Source

- User request: <short quote or summary>
- Source channel: Telegram / Web / Other
- Source agent: main
- Related messages: <optional sanitized references; do not store private Telegram/runtime IDs in committed examples>

## Visibility

- Archive path: shared/tasks/TASK-YYYYMMDD-HHMM-short-name/
- Workspace visibility: shared via `<role-workspace>/shared -> <OPENCLAW_HOME>/workspace/shared`
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

When main asks a role Agent to work on this task, include at minimum:

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

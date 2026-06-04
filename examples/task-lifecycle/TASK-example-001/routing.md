English | [中文](routing.zh-CN.md)

# Routing Decision

## Decision

- Decision: multi-agent
- Created by: main
- Date: 2026-05-30

## Reasoning

- Is the task chat/read-only/non-durable/low-risk? No.
- Why direct handling is allowed or not: the task changes durable workflow documentation, templates, and tests.
- User override: the user requested a persistent routing decision model.

## Direct handling allowed

- Chat or explanation: no
- Read-only inspection: no
- Non-durable planning/advice: no
- Low-risk: yes, but the task is durable, so direct handling is not allowed

## Mandatory Multi-Agent entry triggers

- Durable artifacts: yes — docs, templates, and tests
- Formal project outcomes: yes — changelog/commit may be produced after implementation
- Runtime/environment state: no
- Review/testing/verification/audit/risk assessment/release readiness: yes — validation and review are part of acceptance
- Reusable procedures/templates/skills/SOPs/long-term rules: yes — routing protocol is a long-term rule

## Notes for TEAM.md routing

- Context for TEAM.md: route this as a workflow/protocol documentation task with validation coverage.
- Known constraints: no runtime config or external write unless separately approved.
- User confirmations required: GitHub push, PR, release, or runtime config changes.

## Re-routing log

| Time | Change | Reason |
|---|---|---|
| 2026-05-30 | Initial multi-agent entry | User requested a persistent routing decision model |

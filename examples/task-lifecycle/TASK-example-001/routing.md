English | [中文](routing.zh-CN.md)

# Routing Decision

## Decision

- Level: Level 3
- Mode: multi-agent-archived
- Created by: main
- Date: 2026-05-30

## Reasoning

- Complexity: Documentation and process update with design, validation, and review needs.
- Impact: Affects future task intake, role selection, and shared task archives.
- Risk: Low implementation risk, but high workflow impact.
- Durability need: Required, because the routing decision should be auditable.
- Uncertainty: Some process tradeoffs require review.
- User override: User requested the four-level routing model and explainable routing decisions.

## Score

| Dimension | Score | Notes |
|---|---:|---|
| Complexity | 2 | Design + documentation + validation |
| Impact | 2 | Multiple docs/templates/tests |
| Roles | 2 | main, pm, architect, docs, qa, reviewer |
| Risk | 1 | Workflow impact, no production mutation |
| Durability | 2 | Needs task archive convention |
| Uncertainty | 1 | Process wording and thresholds |
| Total | 10 | Level 3 |

## High-risk triggers

- Secrets/credentials/private config: No
- Auth/authorization/network exposure: No
- Destructive or irreversible writes: No
- Runtime/Gateway/model/provider/scheduler config: No
- systemd/cron/nginx/SSH/DNS/CI/CD/deployment/release: No
- External writes/public resources: No, unless the user later approves push/PR
- Privacy-sensitive data/memory/session transcript: No

## Selected Agents

- `main`: Owns routing, user communication, and final delivery.
- `pm`: Confirms user value, scope, and acceptance criteria.
- `architect`: Checks the four-level model and archive integration.
- `docs`: Writes bilingual documentation and handoff wording.
- `qa`: Defines smoke coverage for routing docs/templates.
- `reviewer`: Checks clarity, maintainability, and over-complexity.

## Not Selected

- `backend`:
  - Reason: No backend/runtime implementation expected.
- `frontend`:
  - Reason: No UI/client work.
- `security`:
  - Reason: No secrets or runtime changes in the example; would join if external write or config mutation is added.
- `devops`:
  - Reason: No deployment/runtime mutation in the example; would join if CI/CD or OpenClaw runtime changes are added.
- `research`:
  - Reason: Prior art research is assumed complete before implementation.

## Escalation conditions

- Upgrade to Level 2 if: not applicable; this is already Level 3.
- Upgrade to Level 3 if: already Level 3.
- Add Level 4 overlay if: push/release/runtime config/external-write work is added.
- Ask user before: pushing to GitHub, opening a PR, publishing, or mutating runtime config.

## Re-routing log

| Time | Change | Reason |
|---|---|---|
| 2026-05-30 | Initial Level 3 routing | User requested durable routing decision optimization |

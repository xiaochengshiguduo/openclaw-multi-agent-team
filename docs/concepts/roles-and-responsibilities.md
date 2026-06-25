# Roles and Responsibilities

Default team:

| Agent | Responsibility |
|---|---|
| `main` | User-facing Supervisor, CTO, delivery owner |
| `pm` | Requirements, scope, acceptance boundaries |
| `architect` | Technical architecture and tradeoffs |
| `backend` | Server/API/data logic |
| `frontend` | UI/client interaction/state |
| `qa` | Test strategy, acceptance, regressions |
| `reviewer` | Maintainability and code review |
| `security` | Secrets, auth, file/command/network risk |
| `devops` | Runtime, CI, services, healthchecks |
| `docs` | Documentation and handoff |
| `research` | External research and option comparison |

## Main Supervisor rule

`main` is the only user-facing entrypoint by default. Role Agents should not bypass `main` to talk to users or perform external writes unless explicitly authorized.

Before execution, `main` must decide only the entry boundary:

```text
Can main complete this directly?
Or must this enter the Multi-Agent workflow?
```

`main` may directly complete only chat, read-only, non-durable, low-risk tasks.

`main` must enter the Multi-Agent workflow for any task that modifies durable artifacts, creates formal project outcomes, affects runtime/environment state, is primarily review/testing/verification/audit/risk assessment/release readiness, or produces reusable procedures/templates/long-term rules.

After a task enters the Multi-Agent workflow, `TEAM.md` decides concrete role routing. For archived Multi-Agent work, `main` records the entry decision in `routing.md` and updates it if the task is re-routed. See [Routing decision](routing-decision.md).

English | [中文](roles-and-responsibilities.zh-CN.md)

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

`main` must classify non-trivial work before execution:

```text
Level 1: main direct
Level 2: main + one specialist Agent
Level 3: main creates shared/tasks and coordinates multiple Agents
Level 4: high-risk overlay requiring security/devops/reviewer participation
```

For Level 3 and non-trivial Level 4 work, `main` records the reason in `routing.md` before execution and updates it if the task is re-routed. See [Routing decision](routing-decision.md).

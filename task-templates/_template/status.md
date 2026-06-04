# Task Status

## State Machine

```text
intake → clarify → plan → execute → review → final → archived
```

Alternative terminal states:

```text
cancelled
blocked
```

## Current State

- Stage: intake | clarify | plan | execute | review | final | archived | cancelled | blocked
- Status: active | waiting-user | waiting-agent | blocked | completed | cancelled
- Owner: main | pm | architect | backend | frontend | qa | reviewer | security | devops | docs | research
- Updated: YYYY-MM-DD HH:mm TZ

## Stage Definitions

### intake

main captures the user's goal, creates the task archive if needed, and records initial constraints.

Exit criteria:

- User goal is understood enough to route, or blocking questions are identified.

### clarify

pm or main clarifies goal, scope, success criteria, users/scenarios, constraints, and risks.

Exit criteria:

- Requirements package exists, or explicit assumptions/blockers are documented.

### plan

main and relevant specialist Agents decide approach, routing, files, validation, and permissions.

Exit criteria:

- plan.md has routing, expected outputs, and next action.

### execute

Specialist Agents perform scoped work or produce scoped analysis.

Exit criteria:

- Role outputs are returned to main and archived.

### review

qa/reviewer/security/devops/docs review as appropriate.

Exit criteria:

- Verification results and remaining risks are documented.

### final

main resolves conflicts, writes final.md, and reports to user.

Exit criteria:

- User-facing summary delivered.
- Task archive has final.md.

### archived

No active work remains.

## Transition Log

| Time | From | To | Owner | Reason |
|---|---|---|---|---|
| YYYY-MM-DD HH:mm TZ | intake | clarify | main | ... |

## Current Blockers

- [blocking] ...

## Waiting For Agents

Use this section when status is `waiting-agent` or when main has yielded for sub-agent work.

- Recovery required on runtime event: yes | no
- Waiting for:
  - taskName: <stable-task-name>
    role: pm | architect | backend | frontend | qa | reviewer | security | devops | docs | research
    label: <session label if known>
    expected output: <short description>
    result path: <role.md or subagents/taskName.md>

## Recovery Checklist

After runtime event / compact / continuation while waiting for agents:

- [ ] Read this `status.md` and `subagents.md`.
- [ ] Check active/recent subagents.
- [ ] If needed, search sessions by label/taskName.
- [ ] Pull session history for completed agents.
- [ ] Archive recovered outputs into task files.
- [ ] Update agent status and transition log.
- [ ] Only then decide whether to continue waiting, retry, or proceed without the agent.

## Next Action

- ...

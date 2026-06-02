English | [中文](healthcheck-runtime.zh-CN.md)

# Runtime Healthcheck

This checklist verifies a real OpenClaw runtime after workspaces, Agent registration, and routing configuration have been applied.

It is intentionally manual/SOP-driven in v1. Do not use it to bypass config review, Gateway restart approval, or Telegram binding safety.

## Preconditions

- OpenClaw is installed and running.
- Model/provider auth is configured.
- Workspaces were generated from this project.
- Role Agents were registered.
- Agent-to-agent routing patch was reviewed and applied manually.
- Gateway was restarted manually if OpenClaw required it.

## Expected Agents

```text
main
pm
architect
backend
frontend
qa
reviewer
security
devops
docs
research
```

## Check 1 — Runtime status

Run:

```bash
openclaw status
```

Expected:

- Gateway is running.
- Agent count includes the expected role Agents.
- No critical task/runtime errors.

If this fails, stop here and fix OpenClaw runtime first.

## Check 2 — Agent inventory

Run:

```bash
openclaw agents list
```

Expected:

- `main` exists.
- all role Agents exist.
- role Agents use generated `workspace-<role>` paths.
- only `main` has user-facing channel binding, if Telegram is used.

Sub-agents should not be Telegram-bound by default.

## Check 3 — Shared task archive path

From the host, verify:

```bash
ls -la "$HOME/.openclaw/workspace/shared/tasks/_template/requirements-package.md"
ls -la "$HOME/.openclaw/workspace-pm/shared"
```

Expected:

- task template exists.
- role workspace `shared` path points to main workspace `shared`.

## Check 4 — main → role Agent communication

From `main`, send a low-risk read-only task to `pm`:

```text
Please verify you can read your AGENTS.md, TEAM.md, and shared/tasks/_template/requirements-package.md. Return only pass/fail and any missing path.
```

Expected from `pm`:

```text
pass
```

Repeat for all role Agents if doing full verification.

## Check 5 — All-role shared read matrix

Expected matrix:

| Role | AGENTS.md | TEAM.md | shared task template |
|---|---|---|---|
| pm | pass | pass | pass |
| architect | pass | pass | pass |
| backend | pass | pass | pass |
| frontend | pass | pass | pass |
| qa | pass | pass | pass |
| reviewer | pass | pass | pass |
| security | pass | pass | pass |
| devops | pass | pass | pass |
| docs | pass | pass | pass |
| research | pass | pass | pass |

If a role cannot read `shared/tasks`, check the role workspace `shared` symlink.

## Check 6 — Fake e2e drill

Create a fake task archive using this project’s task helper, or manually using templates:

```bash
node scripts/create-task-archive.js --slug e2e-drill --tasks-root "$HOME/.openclaw/workspace/shared/tasks" --apply
```

Then from `main`:

1. write a short fake brief
2. ask `pm` for requirements/acceptance criteria
3. ask `reviewer` for safety/maintainability review
4. write `final.md`
5. summarize result to user

Expected:

- task archive exists
- role outputs are captured or summarized by `main`
- final result is delivered by `main`, not raw role output

## Check 7 — Safety boundaries

Confirm:

- no sub-agent has Telegram binding unless explicitly intended
- no role Agent has been given broad external-write authority by default
- no real secrets were copied into generated workspaces
- `main` remains the user-facing entrypoint

## Pass criteria

Runtime reproduction passes when:

- Gateway/runtime is healthy
- all expected Agents exist
- `main` can call role Agents
- role Agents can read shared task archive templates
- fake e2e drill completes
- user-facing delivery stays with `main`

## Failure handling

Common failures:

### Agent-to-agent disabled

Symptom:

```text
Agent-to-agent messaging is disabled
```

Fix:

- review `configure-agent-routing.js` output
- apply required config manually
- restart Gateway manually if required

### Role cannot read shared/tasks

Fix:

- check role workspace path
- check `shared` symlink
- regenerate workspace if safe

### Agent missing

Fix:

- run `register-agents.js` preview
- apply registration only after review

### Telegram routed to sub-agent

Fix:

- remove sub-agent channel binding
- keep Telegram on `main` only

# Overview

`openclaw-multi-agent-team` models a long-lived software team inside OpenClaw.

```text
User → main Supervisor → role Agents → shared/tasks → final delivery
```

The key design is not simply “many Agents”. The key design is controlled coordination:

- `main` talks to the user.
- `main` creates and owns task archives.
- Role Agents read shared task context and return structured outputs.
- `main` resolves conflicts, verifies results, and delivers final answers.

This keeps context, responsibility, and user-facing communication centralized.

## Why shared task archives?

Long-running multi-agent work needs durable context. Chat history alone is fragile. The shared task archive gives every role a common source of truth:

```text
shared/tasks/TASK-YYYYMMDD-HHMM-slug/
```

A task archive can contain:

- `brief.md`
- `plan.md`
- role outputs
- review/QA/security notes
- `final.md`

## Why independent workspaces?

Each role Agent can have stable role identity, collaboration protocol, and local notes without mixing responsibilities. A Linux symlink connects each role workspace to the common `shared/` directory.

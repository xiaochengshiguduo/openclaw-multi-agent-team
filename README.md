English | [中文](README.zh-CN.md)

# OpenClaw Multi-Agent Team

[![CI](https://github.com/xiaochengshiguduo/openclaw-multi-agent-team/actions/workflows/ci.yml/badge.svg)](https://github.com/xiaochengshiguduo/openclaw-multi-agent-team/actions/workflows/ci.yml)
![Linux](https://img.shields.io/badge/platform-Linux-blue)
![Node.js](https://img.shields.io/badge/node-24%2B-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

A reproducible, long-lived multi-agent software team template for OpenClaw.

> Status: v1.0.0 local validation. This repository is a sanitized OpenClaw multi-agent team template and setup toolkit. Review the safety boundaries, development guidelines, and local checks before publishing or applying it to a real runtime.

## What this is

`openclaw-multi-agent-team` helps you reproduce a durable OpenClaw software team on Linux:

- `main` is the only user-facing Supervisor / CTO / delivery owner.
- Role Agents handle specialized work: PM, Architect, Backend, Frontend, QA, Reviewer, Security, DevOps, Docs, and Research.
- Each Agent has its own workspace.
- All roles share a durable task archive under `shared/tasks`.
- Important work follows a documented lifecycle: intake → clarify → plan → execute → review → final → archived.
- Scripts are preview-first and designed for complete reproduction on another new machine.

It is a **template and setup toolkit**, not a backup of a private OpenClaw workspace.

## Architecture at a glance

```text
User / Telegram
      │
      ▼
main Supervisor
  CTO + delivery owner + only user-facing entrypoint
      │
      ├── pm          requirements, scope, acceptance boundaries
      ├── architect   architecture and technical tradeoffs
      ├── backend     server/API/data logic
      ├── frontend    UI/client interaction/state
      ├── qa          test strategy, acceptance, regressions
      ├── reviewer    maintainability and code review
      ├── security    secrets, auth, command/file/network risk
      ├── devops      runtime, CI, services, healthchecks
      ├── docs        documentation and handoff
      └── research    external research and option comparison
      │
      ▼
shared/tasks/TASK-YYYYMMDD-HHMM-slug/
      │
      ▼
final user-facing delivery from main
```

## What you get

- 11 [role templates](roles/)
- a sanitized [main workspace template](workspace-template/)
- 18 [task archive templates](task-templates/_template/)
- [safe setup scripts](scripts/)
- local healthchecks and smoke tests
- runtime healthcheck SOP for a real OpenClaw environment
- [sanitized examples](examples/)

## Safety defaults

- No real `openclaw.json`, config backups, auth profiles, tokens, Telegram bot tokens, Gateway tokens, memories, sessions, transcripts, or private user data are included.
- Write-capable scripts default to dry-run / preview.
- `--apply` is required for writes or command execution.
- The one-command new-machine reproducer can update project-managed OpenClaw config and restart Gateway after preview and explicit `--apply` confirmation.
- Lower-level config helpers still output reviewable patches for phased/debug workflows.
- Sub-agents are not bound to Telegram by default.
- `main` remains the only user-facing entrypoint.

## Requirements

- Linux
- Node.js 24+
- OpenClaw installed and configured separately
- OpenClaw CLI available for registration/runtime steps

This project does **not** install, update, downgrade, or pin OpenClaw. See the [OpenClaw version policy](docs/reference/openclaw-version-policy.md).

Known-good development reference:

```text
OpenClaw 2026.5.27 (27ae826)
```

## Quick start

Run local checks:

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
node tests/smoke/run.js
```

Preview complete new-machine reproduction:

```bash
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw"
```

Remote one-command bootstrap after review:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/bootstrap-new-machine.sh)" -- --apply
```

Run the interactive complete reproduction from a local checkout after review:

```bash
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw" --apply
```

For phased/debug workflows, you can still run `generate-workspaces.js`, `register-agents.js`, and `configure-agent-routing.js` separately.

For a complete new-machine walkthrough, see the [new-machine reproduction guide](docs/getting-started/reproduce-on-new-machine.md).

## Main scripts

| Script | Purpose | Writes by default? |
|---|---|---|
| `scripts/bootstrap-new-machine.sh` | public clone/update wrapper around `reproduce-new-machine.js` | No, unless forwarded `--apply` |
| `scripts/reproduce-new-machine.js` | one-command new-machine reproduction | No, unless `--apply` |
| `scripts/doctor-local.js` | prerequisite checks | No |
| `scripts/healthcheck-local.js` | repository/template checks | No |
| `scripts/healthcheck-runtime.js` | real OpenClaw runtime shape checks | No |
| `scripts/repro-check.js` | new-machine reproduction readiness | No |
| `scripts/generate-workspaces.js` | generate workspaces and shared symlinks | No, unless `--apply` |
| `scripts/create-task-archive.js` | create task archive from templates | No, unless `--apply` |
| `scripts/register-agents.js` | preview/run `openclaw agents add` | No, unless `--apply` |
| `scripts/configure-agent-routing.js` | output routing config patch | No real config writes |
| `scripts/preflight.js` | release-preflight checks | No |

See the [script reference](docs/reference/scripts.md).

## Repository structure

```text
openclaw-multi-agent-team/
├── .github/              # CI and contribution templates
├── docs/                 # user/developer documentation
├── roles/                # main + role Agent templates
├── workspace-template/   # sanitized main workspace template
├── task-templates/       # shared task archive templates
├── scripts/              # setup/check/reproduction helpers
├── examples/             # sanitized examples
├── tests/                # smoke/link checks
└── dist/                 # reserved for generated packages
```

See the [directory structure reference](docs/reference/directory-structure.md).

## What this project does not include

- OpenClaw installation itself
- committed real OpenClaw runtime config
- committed provider credentials or API keys
- Telegram bot tokens
- Gateway tokens
- real private `MEMORY.md`, `USER.md`, `TOOLS.md`, sessions, transcripts, or logs
- automatic Telegram binding for sub-agents
- OpenClaw installation or external channel onboarding

## Documentation

Start here:

- [Documentation index](docs/index.md)
- [New-machine reproduction guide](docs/getting-started/reproduce-on-new-machine.md)
- [Project overview](docs/concepts/overview.md)
- [Routing decision](docs/concepts/routing-decision.md)
- [Security model](docs/security/security-model.md)
- [Development guidelines](docs/reference/development-guidelines.md)
- [Examples](examples/)
- [Release checklist](docs/reference/release-checklist.md)
- [Release notes draft](docs/reference/release-notes-draft.md)

## Validation

```bash
node scripts/healthcheck-local.js
node tests/smoke/run.js
node scripts/preflight.js
```

The GitHub repository also runs CI on push and pull request.

## License

MIT

English | [中文](index.zh-CN.md)

# Documentation

Documentation for reproducing, operating, and safely publishing an OpenClaw long-lived multi-agent software team.

## Start here

Choose the path that matches what you are trying to do.

| Goal | Read |
|---|---|
| Understand the project quickly | [Project overview](concepts/overview.md) |
| Reproduce the team on a new Linux machine | [New-machine reproduction guide](getting-started/reproduce-on-new-machine.md) |
| Create a team from templates | [Team creation guide](guides/create-a-new-team.md) |
| Create and manage task archives | [Task archive guide](guides/create-a-task.md) |
| Run local/runtime checks | [Healthcheck guide](guides/run-healthchecks.md) and [runtime healthcheck automation](guides/runtime-healthcheck-automation.md) |
| Review safety boundaries | [Security model](security/security-model.md) |
| Maintain this repository | [Development guidelines](reference/development-guidelines.md) |
| Prepare a release | [Release checklist](reference/release-checklist.md) |

## New-machine reproduction path

If OpenClaw is already installed and configured through the official onboarding flow, use this path:

1. [Prerequisites](getting-started/prerequisites.md)
2. [New-machine reproduction guide](getting-started/reproduce-on-new-machine.md)
3. [OpenClaw version policy](reference/openclaw-version-policy.md)
4. [Script reference](reference/scripts.md)
5. [Healthcheck guide](guides/run-healthchecks.md)
6. [E2E drill guide](guides/run-an-e2e-drill.md)

Important boundary: this project does **not** install, upgrade, downgrade, or pin OpenClaw. It starts after OpenClaw exists. The dedicated new-machine reproducer may restart Gateway after explicit `--apply` so the generated multi-agent config is loaded; ordinary helper scripts remain preview-first and do not restart Gateway.

## Concept map

Read these when you want to understand how the system is designed.

- [Project overview](concepts/overview.md) — high-level architecture and purpose
- [Roles and responsibilities](concepts/roles-and-responsibilities.md) — `main` and role Agent boundaries
- [Routing decision](concepts/routing-decision.md) — when to use `main`, one specialist, or full multi-agent collaboration
- [Workspaces](concepts/workspaces.md) — independent workspaces and shared symlinks
- [Shared task archive](concepts/shared-task-archive.md) — durable task archive convention
- [Agent-to-agent routing](concepts/agent-to-agent-routing.md) — routing and session visibility model
- [Task lifecycle](concepts/task-lifecycle.md) — intake to final archive
- [Safety model](concepts/safety-model.md) — preview-first and manual-risk boundaries

## Operator guides

Practical workflows for using and maintaining the template.

- [Create a new team](guides/create-a-new-team.md)
- [Create a task archive](guides/create-a-task.md)
- [Run healthchecks](guides/run-healthchecks.md)
- [Runtime healthcheck automation](guides/runtime-healthcheck-automation.md)
- [Run an E2E drill](guides/run-an-e2e-drill.md)
- [Add a role Agent](guides/add-a-role-agent.md)
- [Sync team docs](guides/sync-team-docs.md)
- [Migrate an existing workspace](guides/migrate-existing-workspace.md)

## Reference

Use these when checking details, scripts, compatibility, or release readiness.

- [Directory structure](reference/directory-structure.md)
- [Script reference](reference/scripts.md)
- [Config examples](reference/config-examples.md)
- [OpenClaw version policy](reference/openclaw-version-policy.md)
- [Compatibility matrix](reference/compatibility.md)
- [Environment variables](reference/environment-variables.md)
- [Runtime localization design](reference/runtime-localization.md)
- [Role template reference](reference/role-template.md)
- [Workspace template reference](reference/workspace-template.md)
- [Task template reference](reference/task-template.md)
- [Development guidelines](reference/development-guidelines.md)
- [Preflight checks](reference/preflight.md)
- [Release checklist](reference/release-checklist.md)
- [Release notes draft](reference/release-notes-draft.md)

## Security and publishing

Read these before applying changes on a real OpenClaw environment or publishing a repository.

- [Security model](security/security-model.md)
- [Secrets and redaction](security/secrets-and-redaction.md)
- [Dry-run and apply policy](security/dry-run-and-apply.md)
- [Safe publishing checklist](security/safe-publishing-checklist.md)

## Examples

Sanitized examples for understanding expected outputs and workflows.

- [Minimal team example](examples/minimal-team.md)
- [Full software team example](examples/full-software-team.md)
- [Task archive example](examples/task-archive-example.md)
- [Multi-agent E2E drill example](examples/multi-agent-e2e-drill.md)

## Troubleshooting and FAQ

- [Setup troubleshooting](getting-started/troubleshooting-setup.md)
- [Troubleshooting](troubleshooting.md)
- [FAQ](faq.md)

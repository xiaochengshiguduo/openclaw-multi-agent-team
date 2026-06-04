English | [中文](scripts.zh-CN.md)

# Scripts Reference

All write-capable scripts are preview-first. Run without `--apply` to inspect the plan.

## Common conventions

```text
node scripts/<script>.js --help
node scripts/<script>.js            # dry-run / preview
node scripts/<script>.js --apply    # write/execute when supported
```

First version supports Linux only.

## `doctor-local.js`

Diagnose local prerequisites. No writes.

```bash
node scripts/doctor-local.js
node scripts/doctor-local.js --json
```

Checks:

- Linux platform
- Node.js 24+
- OpenClaw CLI availability
- project root exists and is writable
- directory symlink support

## `reproduce-new-machine.js`

Automated reproduction controller for a new OpenClaw machine.

```bash
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw"
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw" --apply
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw" --apply --yes --model custom-openai/gpt-5.5 --base-url https://api.openai.com/v1 --api-key-env OPENCLAW_MODEL_API_KEY
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw" --apply --keep-config-backups 3
```

Config reuse (default ON):

- If `<target>/openclaw.json` exists, the script reuses it as *defaults* and only prompts for missing required values in `--apply` mode.
- CLI flags always win.
- Use `--no-reuse-config` to force fresh input.
- The script only reads/reuses these fields:
  - `agents.defaults.model.primary`
  - `agents.defaults.models[primary].alias`
  - `models.providers[provider].baseUrl`, `models.providers[provider].api`, `models.providers[provider].apiKey`

Default mode is dry-run and prints the complete plan. With `--apply`, it:

- overwrites repository-managed workspaces/templates
- overwrites the project-managed OpenClaw model/provider/A2A routing config
- registers role agents through `register-agents.js --apply` (OpenClaw native `agents add` flow)
- validates config with `openclaw config patch --dry-run` and `openclaw config validate`
- restarts Gateway by default so the reproduced team is usable immediately
- prunes OpenClaw config patch backups to the newest 1 `openclaw.json.bak*` file by default
- never binds Telegram to role Agents

OpenClaw itself may create `openclaw.json.bak*` files when applying config patches. To avoid backup buildup during repeated reproduction runs, the script removes older `openclaw.json.bak*` files after a successful patch write. It does not remove `openclaw.json.last-good` or unrelated files. Use `--keep-config-backups <n>` to keep more, or `--no-prune-config-backups` to disable this cleanup.

Secrets are local inputs only. Use `--api-key-env` when you prefer not to paste a key into the interactive prompt. Use `--skip-config` or `--skip-restart` only for debugging or constrained environments.


## `update-runtime-workspace.js`

Safe incremental updater for an OpenClaw runtime workspace that has already been used.

```bash
node scripts/update-runtime-workspace.js --target "$HOME/.openclaw"
node scripts/update-runtime-workspace.js --target "$HOME/.openclaw" --apply
node scripts/update-runtime-workspace.js --target "$HOME/.openclaw" --apply --no-restart
node scripts/update-runtime-workspace.js --target "$HOME/.openclaw" --apply --overwrite-conflicts
node scripts/update-runtime-workspace.js --target "$HOME/.openclaw" --to 1.1.0 --apply
node scripts/update-runtime-workspace.js --target "$HOME/.openclaw" --only task-templates --apply
```

Default mode is dry-run and writes only an audit plan under `state/openclaw-multi-agent-team/last-plan.json`.

With `--apply`, the updater:

- applies versioned manifests from `updates/runtime/*.json`
- writes only allowlisted runtime workspace files:
  - `workspace/AGENTS.md`
  - `workspace/TEAM.md`
  - `workspace/shared/tasks/_template/*.md`
- denies OpenClaw config, agent config, memory, sessions, state, transcripts, and user context paths
- treats user-modified managed files as conflicts and does not overwrite them by default
- in interactive TTY `--apply` runs, asks whether to overwrite the listed modified managed conflicts: empty/`n` keeps no-overwrite behavior; `y`/`Y` overwrites only those listed files
- requires non-interactive automation to pass explicit `--overwrite-conflicts` before overwriting modified managed conflicts
- backs up changed or overwritten files under `backups/openclaw-multi-agent-team/update-*`
- uses atomic writes and an update lock
- writes `state/openclaw-multi-agent-team/update-state.json`
- restarts Gateway after successful no-conflict updates unless `--no-restart` is used

If conflicts or forbidden targets remain, no update is applied and Gateway is not restarted.

Exit codes:

```text
0 = success / no changes / dry-run ok
1 = runtime error
2 = conflicts detected
3 = forbidden target in manifest or target path
4 = validation failed
5 = rollback failed
6 = restart failed after successful update
```

This updater is intentionally narrower than `reproduce-new-machine.js`: it does not modify `openclaw.json`, model/provider settings, credentials, A2A routing, memory, sessions, state, or Gateway configuration.


## `update-runtime-workspace.sh`

Public clone/update wrapper around `update-runtime-workspace.js`. Use this for one-command remote updates from GitHub.

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/update-runtime-workspace.sh)" --
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/update-runtime-workspace.sh)" -- --apply
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/update-runtime-workspace.sh)" -- --apply --no-restart
```

The wrapper:

- clones the public repo to `~/openclaw-multi-agent-team` when missing
- fast-forwards an existing clean checkout when possible
- leaves dirty checkouts untouched
- runs `node scripts/update-runtime-workspace.js --target ~/.openclaw` plus forwarded args

Review the script before running remote `curl | bash` commands in sensitive environments.


## `bootstrap-new-machine.sh`

Bootstrap helper for public repos:

- clones `openclaw-multi-agent-team` when `--dest` does not exist (public `git clone` only)
- fast-forwards an existing clean `--dest` from its upstream when possible
- leaves an existing `--dest` with local changes untouched
- runs `scripts/reproduce-new-machine.js`

```bash
scripts/bootstrap-new-machine.sh
scripts/bootstrap-new-machine.sh --apply
scripts/bootstrap-new-machine.sh --apply --yes -- --api-key-env OPENCLAW_MODEL_API_KEY
```

Remote bootstrap (optional):

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/bootstrap-new-machine.sh)" --
```

Safety notes:

- Review the script before running it.
- This script performs network calls (`git clone` / `git fetch`).
- Existing local changes in `--dest` are preserved; the script skips auto-update when the checkout is dirty.

## `generate-workspaces.js`

Generate OpenClaw Agent workspaces and shared symlinks.

```bash
node scripts/generate-workspaces.js --target "$HOME/.openclaw"
node scripts/generate-workspaces.js --target "$HOME/.openclaw" --apply
node scripts/generate-workspaces.js --target /tmp/demo --roles main,pm,docs --apply
node scripts/generate-workspaces.js --target "$HOME/.openclaw" --apply --preserve-existing
```

Creates:

```text
<target>/workspace
<target>/workspace-pm
<target>/workspace-architect
...
```

Role workspaces get:

```text
shared -> <target>/workspace/shared
```

New-machine reproduction semantics:

- dry-run remains the default and writes nothing.
- `--apply` overwrites repository-managed workspace template files and role `shared` links so the generated team matches this repository.
- Use `--preserve-existing` only for manual migrations where existing files must be kept.
- This script still does not modify OpenClaw config, credentials, sessions, memories outside generated template files, or Gateway state.

## `create-task-archive.js`

Create a task archive from templates.

```bash
node scripts/create-task-archive.js --slug demo --tasks-root "$HOME/.openclaw/workspace/shared/tasks"
node scripts/create-task-archive.js --slug demo --tasks-root "$HOME/.openclaw/workspace/shared/tasks" --apply
```

Slug must match:

```text
^[a-z0-9][a-z0-9-]{0,63}$
```

## `register-agents.js`

Preview or execute OpenClaw agent registration commands.

```bash
node scripts/register-agents.js --target "$HOME/.openclaw" --model gpt/gpt-5.5
node scripts/register-agents.js --target "$HOME/.openclaw" --model gpt/gpt-5.5 --apply
```

Safety:

- no Telegram binding is added
- commands are printed before execution
- `--apply` is required to run commands

## `configure-agent-routing.js`

Print an agent-to-agent config patch.

```bash
node scripts/configure-agent-routing.js
node scripts/configure-agent-routing.js --output /tmp/openclaw-agent-routing.patch.json
```

This patch enables cross-agent sends, all-agent session visibility, and `main`'s internal subagent allowlist for role Agents. When generated by `reproduce-new-machine.js`, the patch preserves existing `agents.list` entries and updates only `main`'s managed subagent routing fields. This version refuses automatic config modification. Apply manually only after backup, validation, and explicit confirmation.

## `repro-check.js`

Read-only check for new-machine reproduction readiness.

```bash
node scripts/repro-check.js --target "$HOME/.openclaw"
node scripts/repro-check.js --target "$HOME/.openclaw" --json
```

Checks:

- Linux platform
- Node.js version
- OpenClaw CLI
- required project files
- role templates
- target writability
- symlink support
- existing workspace/agent hints

## `preflight.js`

Read-only release-preflight wrapper.

```bash
node scripts/preflight.js
node scripts/preflight.js --target /tmp/oc-mat-preflight-repro
```

Runs doctor, local healthcheck, reproduction check, smoke tests, and a small dangerous-file scan. It does not stage, commit, push, change OpenClaw config, or restart Gateway.

## `sync-team-docs.js`

Planned preview-first sync helper.

It must not overwrite private:

- `MEMORY.md`
- `USER.md`
- `TOOLS.md`
- `IDENTITY.md`

## `healthcheck-local.js`

Check repository templates and structure. No writes or external calls.

```bash
node scripts/healthcheck-local.js
node scripts/healthcheck-local.js --json
```

## `healthcheck-runtime.js`

Read-only healthcheck for a real OpenClaw multi-agent team installation.

```bash
node scripts/healthcheck-runtime.js --target "$HOME/.openclaw"
node scripts/healthcheck-runtime.js --target "$HOME/.openclaw" --json
node scripts/healthcheck-runtime.js --target "$HOME/.openclaw" --skip-openclaw
```

Checks:

- Linux runtime target
- main and role workspace directories
- role `AGENTS.md` and `TEAM.md`
- role `shared` symlinks
- shared task archive templates
- `main` subagent allowlist for role Agents in OpenClaw config
- OpenClaw CLI/version/status when available
- expected Agent IDs from `openclaw agents list`
- obvious user-facing binding markers on sub-agents

Safety:

- no config writes
- no Agent registration
- no Gateway restart
- no task creation
- no agent-to-agent messages
- `--skip-openclaw` is filesystem-only and should not be used as final runtime validation

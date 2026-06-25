# Runtime Healthcheck Automation

`healthcheck-runtime.js` is a read-only helper for validating a real OpenClaw multi-agent team installation.

It complements the manual SOP in `scripts/healthcheck-runtime.md` by checking the local filesystem layout and, when available, OpenClaw CLI/runtime inventory.

## Usage

```bash
node scripts/healthcheck-runtime.js --target "$HOME/.openclaw"
```

JSON output:

```bash
node scripts/healthcheck-runtime.js --target "$HOME/.openclaw" --json
```

Filesystem-only mode, for environments where OpenClaw CLI is unavailable:

```bash
node scripts/healthcheck-runtime.js --target "$HOME/.openclaw" --skip-openclaw
```

Do not use `--skip-openclaw` as final production validation. It only verifies files and symlinks.

## What it checks

- Linux runtime target
- target OpenClaw directory exists
- main workspace exists
- shared task archive root exists
- all shared task templates exist
- every role workspace exists
- every role workspace has `AGENTS.md` and `TEAM.md`
- every role workspace has a `shared` symlink pointing to main `workspace/shared`
- OpenClaw CLI version, unless skipped
- `openclaw status`, unless skipped
- expected Agent IDs from `openclaw agents list`, unless skipped
- obvious user-facing binding markers on sub-agents, when visible in `agents list` output

## What it does not do

- does not write config
- does not register Agents
- does not restart Gateway
- does not create task archives
- does not send messages to Agents
- does not modify Telegram/channel bindings
- does not prove that model/provider auth works

## Interpreting results

The script reports one of:

```text
ok
warning
blocking
```

- `ok`: checks passed.
- `warning`: likely usable, but requires manual attention.
- `blocking`: v1 runtime reproduction is not complete enough to rely on.

Warnings are expected if the installed OpenClaw version differs from the known-good reference version:

```text
OpenClaw 2026.5.27
```

Version mismatch is not automatically blocking because this project does not install, upgrade, downgrade, or pin OpenClaw.

## Relation to manual SOP

Use both:

1. Run `healthcheck-runtime.js` for automated local/runtime shape checks.
2. Follow `scripts/healthcheck-runtime.md` for manual agent-to-agent message verification and fake e2e drill.

The script intentionally avoids sending messages because that can consume model calls and interact with live runtime state.

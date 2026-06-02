English | [中文](openclaw-version-policy.zh-CN.md)

# OpenClaw Version Policy

This project does **not** install, upgrade, downgrade, or pin OpenClaw.

`openclaw-multi-agent-team` starts after OpenClaw already exists on the target machine. It provides role templates, workspace generation, Agent registration helpers, routing patch previews, task templates, docs, and checks.

## Current policy

- OpenClaw installation is out of scope.
- OpenClaw official onboarding/setup remains the source of truth for installing and configuring OpenClaw.
- This project does not guarantee that the installed OpenClaw is the latest version.
- This project does not automatically update OpenClaw.
- This project does not modify real OpenClaw config or restart Gateway in dry-run mode.
- The complete new-machine reproducer may apply project-managed config and restart Gateway only after preview and explicit `--apply` confirmation.

## Verified development version

The project was developed and locally tested with:

```text
OpenClaw 2026.5.27 (27ae826)
```

This does not mean older/newer versions cannot work. It means this is the known-good local reference version used during initial project creation.

## New-machine behavior

On a target machine that already has OpenClaw installed and configured, the recommended flow is:

```bash
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw"
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw" --apply
```

The checks call:

```bash
openclaw --version
```

They report the installed version, but they do not install or update OpenClaw.

## If OpenClaw is already configured

This project should not clobber existing official setup state.

Expected behavior:

- preserve existing OpenClaw installation
- preserve existing auth/model/channel config
- preserve existing `main` user-facing channel binding
- generate or update multi-agent team workspace files only when `--apply` is used
- register role Agents only when `register-agents.js --apply` or `reproduce-new-machine.js --apply` is used
- apply project-managed agent-to-agent routing only from the complete reproducer after preview and explicit `--apply`; lower-level config helpers output patches for review

If a target machine already has workspaces or Agents with the same names, review before applying generation/registration.

## Compatibility expectations

Compatibility expectations for v1.0.0 are conservative:

- Linux only
- Node.js 24+
- OpenClaw CLI must be available
- OpenClaw must support isolated agents and agent-to-agent/session tooling used by this workflow
- routing config fields may vary by OpenClaw version and must be manually validated

## Why not auto-install latest OpenClaw?

Automatic latest-version installation sounds convenient, but it creates risks:

- installer behavior can change without this project changing
- latest version may introduce config schema changes
- automatic install/update can disturb a working Gateway
- auth/channel setup is user-specific and may require interactive approval
- safe rollback is outside this project’s current scope

Therefore, this project keeps OpenClaw lifecycle separate from team-template lifecycle.

## Future options

Possible future improvements:

- compatibility matrix
- minimum supported OpenClaw version check
- `--expected-openclaw-version` flag
- optional installer guide that pins a version
- automated config schema validation through OpenClaw CLI if stable and safe

These should remain explicit and preview-first.

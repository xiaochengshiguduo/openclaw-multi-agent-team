English | [中文](compatibility.zh-CN.md)

# Compatibility

## Current support matrix

| Component | Support |
|---|---|
| OS | Linux only in v1 |
| Node.js | 24+ |
| OpenClaw install | external / official setup |
| OpenClaw verified reference | OpenClaw 2026.5.27 (27ae826) |
| macOS | not tested / not supported in v1 |
| WSL | not tested / not supported in v1 |
| native Windows | not supported in v1 |
| Telegram binding | `main` only by default |
| Gateway restart | dedicated reproducer may restart after explicit `--apply`; ordinary helpers do not restart |
| Config patching | preview-first; apply only in explicit reproduction workflows |

## Compatibility philosophy

This project avoids controlling the OpenClaw lifecycle. It does not install, update, downgrade, or pin OpenClaw.

The project only manages reusable team artifacts:

- role templates
- workspace generation
- task templates
- registration command preview/apply
- routing config preview/apply in explicit reproduction workflows
- local/reproduction checks

## What to test for new OpenClaw versions

When using a different OpenClaw version, verify:

- `openclaw agents add` flags are compatible
- role workspace paths are accepted
- agent-to-agent config fields are still valid
- session visibility behavior still works
- Gateway restart and config-apply semantics are unchanged
- Telegram binding remains isolated to `main`

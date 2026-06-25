# Release Notes Draft

Draft release notes for `v1.1.0`. Review before creating a GitHub Release.

## v1.1.0 — Runtime update and preflight polish

`openclaw-multi-agent-team` is a reproducible, long-lived multi-agent software team template for OpenClaw.

### Highlights

- `main` Supervisor as the only user-facing entrypoint.
- 10 long-lived role Agent templates: PM, Architect, Backend, Frontend, QA, Reviewer, Security, DevOps, Docs, and Research.
- Independent role workspaces connected through a shared task archive.
- Safe setup scripts with dry-run defaults and explicit `--apply` for writes.
- Preview-only OpenClaw routing config patch generation.
- Local, reproduction, preflight, and runtime healthchecks.
- Sanitized examples and task lifecycle templates.
- English/Chinese README entrypoints and language switching for core docs.
- GitHub CI using Node 24 and current GitHub Actions runtime.

### Safety boundaries

This release does not include or modify:

- real OpenClaw config
- tokens or auth profiles
- Telegram bot tokens
- Gateway tokens
- private memories, sessions, transcripts, or task archives
- automatic Gateway restart outside dedicated reproduction/update workflows
- automatic production config mutation outside explicit `--apply` reproduction workflows
- sub-agent Telegram binding

### Validation before release

Expected final gates:

- local healthcheck passes
- smoke tests pass
- preflight passes
- clean clone regression passes
- sensitive/private-data scan passes
- GitHub CI passes

### Known limitations

- Linux only for v1.
- OpenClaw installation is out of scope. Provider credentials are local inputs only and are never committed; the reproduction script may use them to configure project-managed provider settings after preview and explicit `--apply`.
- Runtime message-based all-role healthcheck remains manual/SOP-driven.
- Lower-level config helpers remain preview/manual by design.

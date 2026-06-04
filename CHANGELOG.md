English | [中文](CHANGELOG.zh-CN.md)

# Changelog

## 1.1.0 - 2026-06-04

- Tightened the `main` self-handling boundary: `main` may directly complete only chat, read-only, non-durable, low-risk tasks; durable artifacts, formal project outcomes, runtime/environment changes, review/testing/verification/audit/risk assessment, and reusable long-term procedures must enter the Multi-Agent workflow.
- Added `scripts/update-runtime-workspace.sh`, a public clone/update wrapper so used runtime workspaces can be updated with a remote command such as `bash -c "$(curl -fsSL .../scripts/update-runtime-workspace.sh)" -- --apply`.
- Added `scripts/update-runtime-workspace.js`, a manifest-driven updater for already-used OpenClaw runtime workspaces.
- Added versioned runtime update manifest `updates/runtime/1.1.0.json`.
- The updater is dry-run by default, applies only with `--apply`, writes only allowlisted project-managed workspace/template paths, denies config/memory/session/state paths, backs up changed files, records update state and plan files, detects user-modified files as conflicts, uses atomic writes and a lock, and restarts Gateway after successful no-conflict applies unless `--no-restart` is used.
- Added smoke tests for dry-run no-write behavior, apply/restart behavior, `--no-restart`, user modification conflicts, forbidden targets, and symlink escape rejection.

## 1.0.1 - 2026-06-04

- Added a durable sub-agent recovery protocol for runtime events, compaction, and missed `sessions_yield` completion callbacks.
- Added `subagents.md` task template and included it in generated task archives.
- Updated main Supervisor and workspace team protocols to record child agent task names, waiting state, cleanup policy, recovery lookup steps, and archived outputs.
- Updated smoke tests to cover the new task template.

## 1.0.0 - 2026-05-30

- Initial reproducible OpenClaw multi-agent software team template.
- Added `main` Supervisor plus 10 long-lived role Agent templates.
- Added sanitized workspace and shared task archive templates.
- Added safe, preview-first setup scripts for workspace generation, task archive creation, Agent registration previews, routing patch generation, reproduction checks, local/runtime healthchecks, and preflight checks.
- Added documentation for new-machine reproduction, architecture, security boundaries, OpenClaw version policy, scripts, compatibility, release readiness, and examples.
- Added English/Chinese README entrypoints and language switchers for core documentation.
- Added GitHub CI, issue templates, pull request template, license, contributing guide, and security policy.

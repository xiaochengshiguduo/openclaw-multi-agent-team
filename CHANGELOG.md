English | [中文](CHANGELOG.zh-CN.md)

# Changelog

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


## 2.0.0 - 2026-06-25

**Major architecture migration: Agent-to-Agent → Subagent Announce Chain**

This release completely replaces the legacy agent-to-agent (A2A) `sessions_send` ping-pong pattern with OpenClaw's native subagent announce chain architecture. This eliminates the stability issues caused by `maxPingPongTurns` limits.

**Breaking changes:**

- Removed `session.agentToAgent.maxPingPongTurns` configuration (no longer needed)
- Removed `tools.agentToAgent` configuration block
- Removed section 3.6 "Recoverable Sub-Agent Dispatch Protocol" from `TEAM.md` (replaced with depth architecture)
- Removed `configure-agent-routing.js` script (replaced with `configure-subagent-policy.js`)
- Removed `docs/concepts/agent-to-agent-routing.md` (replaced with `subagent-architecture.md`)

**New architecture:**

- Added `agents.defaults.subagents.maxSpawnDepth: 2` for nested orchestrator pattern
- Added `agents.defaults.subagents.maxChildrenPerAgent` and `maxConcurrent` controls
- Depth-0 (main): only user-facing entry point
- Depth-1 (orchestrator): optional coordinator, spawns depth-2 workers
- Depth-2 (worker): specialized roles, results use `deliver=false` internal injection
- Worker results flow via announce chain, preventing Telegram spam

**Core changes:**

- Rewrote `scripts/lib/openclaw-config.js` to generate subagent policy instead of A2A routing
- Added `scripts/configure-subagent-policy.js` with depth architecture documentation
- Replaced `TEAM.md` section 3.6 with "Subagent Depth Architecture" explanation
- Updated `task-templates/_template/subagents.md` from recovery tracking to depth coordination
- Added `docs/concepts/subagent-architecture.md` with usage patterns and comparison table
- Updated `scripts/reproduce-new-machine.js` to use `subagentPolicyPatch`
- Rewrote `tests/smoke/configure-subagent-policy.dry-run.test.js` with depth assertions

**Benefits:**

- Eliminates "only 4-5 out of 10 agents return results" instability
- No turn-limit constraints on agent communication
- Push-based completion events, no manual recovery needed
- Worker results never spam user's Telegram
- Clearer orchestration semantics (depth-based)

**Migration guide:**

1. Update `~/.openclaw/openclaw.json`:
   - Remove `session.agentToAgent`
   - Remove `tools.agentToAgent`
   - Add `agents.defaults.subagents.maxSpawnDepth: 2`
   - Add `agents.defaults.subagents.maxChildrenPerAgent: 6`
   - Add `agents.defaults.subagents.maxConcurrent: 8`

2. Update workspace protocols:
   - Review and update any A2A `sessions_send` patterns to use `sessions_spawn`
   - Use `sessions_yield` after spawning to wait for completion events
   - For complex tasks, spawn an orchestrator agent to coordinate workers

3. Re-test multi-agent workflows to confirm stable result delivery

**Compatibility:**

- Requires OpenClaw 2026.6.10 or later for stable subagent announce behavior
- Role agent workspaces remain compatible
- Task archive format remains compatible


## 1.1.1 - 2026-06-06

- Kept version 1.1.1 as a compatibility runtime manifest with no workspace file changes.

## 1.1.0 - 2026-06-04

- Tightened the `main` self-handling boundary: `main` may directly complete only chat, read-only, non-durable, low-risk tasks; durable artifacts, formal project outcomes, runtime/environment changes, review/testing/verification/audit/risk assessment, and reusable long-term procedures must enter the Multi-Agent workflow.
- Hardened `TEAM.md` as the post-entry Multi-Agent dispatch manual with dispatch modes, serial/parallel coordination rules, conflict handling, an Agent permission matrix, and completion criteria.
- Expanded `TEAM.md` with detailed post-entry task routing examples, and added role-specific checklists to every `roles/*/AGENTS.md` file.
- Added smoke coverage for bash one-click deployment/update remote command shapes.
- Tightened role `SOUL.md` governance/safety boundaries and added SOUL protocol smoke coverage.
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

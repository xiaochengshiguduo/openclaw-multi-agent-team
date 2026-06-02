English | [中文](reproduce-on-new-machine.zh-CN.md)

# Reproduce on a New Machine

This guide describes how to reproduce the long-lived OpenClaw multi-agent team on a new Linux machine.

The recommended flow is the automated bootstrap: preview first, then execute after explicit confirmation. Because this project targets complete new-machine reproduction, apply mode overwrites project-managed workspace templates and OpenClaw multi-agent config, then restarts Gateway when needed.

## Target result

```text
User → main Supervisor → role Agents → shared/tasks → final delivery
```

Generated OpenClaw workspace layout:

```text
~/.openclaw/workspace
~/.openclaw/workspace-pm
~/.openclaw/workspace-architect
~/.openclaw/workspace-backend
~/.openclaw/workspace-frontend
~/.openclaw/workspace-qa
~/.openclaw/workspace-reviewer
~/.openclaw/workspace-security
~/.openclaw/workspace-devops
~/.openclaw/workspace-docs
~/.openclaw/workspace-research
```

Each role workspace links to:

```text
~/.openclaw/workspace/shared
```

## Install prerequisites

Required:

- Linux
- Node.js 24+
- OpenClaw installed separately
- OpenClaw CLI in `PATH`
- a usable model provider/base URL/API key

Optional:

- Telegram binding for `main` only

Do not bind Telegram to sub-agents by default.

## Automated complete reproduction (recommended)

This single command bootstraps a new machine end-to-end: it clones the public repository and runs the automated reproducer.

Preview (recommended first):

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/bootstrap-new-machine.sh)" --
```

Apply (makes changes):

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/bootstrap-new-machine.sh)" -- --apply
```

Notes:

- Public `git clone` only (no `gh` auth).
- Default clone path is `~/openclaw-multi-agent-team`.
- Non-interactive mode (for example, when running with `--yes`) cannot prompt for input. For secrets, pass the name of an existing environment variable, for example `--api-key-env OPENCLAW_MODEL_API_KEY`, or rely on existing OpenClaw config reuse. Do not paste raw API keys, tokens, runtime config, logs, or private notes into CLI flags or docs. If required non-secret values are missing, the script will exit and tell you what's missing.
- Extra flags for the reproducer go after `--`:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/bootstrap-new-machine.sh)" -- \
  --apply --yes -- --api-key-env OPENCLAW_MODEL_API_KEY
```

## Manual run (alternative)

If you prefer not to use `curl | bash`, you can still clone and run the reproducer manually.

This is an alternative path and is not required for a successful new-machine reproduction.

```bash
git clone https://github.com/xiaochengshiguduo/openclaw-multi-agent-team.git
cd openclaw-multi-agent-team
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw"
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw" --apply
```

Optional (debugging only):

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
node tests/smoke/run.js
```

Normally you do not need to run these manually because `reproduce-new-machine.js --apply` runs the local checks for you.

## Behavior validation (copy/paste)

After `--apply` completes and Gateway is restarted, validate that routing and role behavior work as intended.

This is intentionally not a script-only check: it verifies real agent-to-agent collaboration and supervisor ownership.

### Quick validation (5-10 minutes)

Send this message to your user-facing `main` agent. It validates the actual product shape of this repository: `main` owns the Telegram-facing conversation, classifies task complexity, delegates to the right internal role agents, and consolidates the final answer.

```text
You are the user-facing `main` Supervisor for this OpenClaw multi-agent team.

Goal: run a post-reproduction acceptance check for this team installation.

Rules:
- Do not modify config, files, secrets, channels, or Gateway state.
- Do not ask the user for credentials.
- Treat all role agents as internal collaborators.
- Keep the final response concise and give an explicit verdict.

Check 1 - Team roster and boundaries
Confirm that you understand this team shape:
- `main` is the only default user-facing/Telegram-facing agent.
- `pm`, `architect`, `backend`, `frontend`, `qa`, `reviewer`, `security`, `devops`, `docs`, and `research` are internal role agents.
- Child role agents should report back to `main`; they should not contact the Telegram user directly.

Check 2 - Minimal delegation smoke test
Ask these internal agents for short outputs:
- `pm`: define a 3-bullet acceptance checklist for verifying this new-machine reproduction.
- `architect`: identify the main runtime/config boundary this project must preserve.
- `qa`: confirm whether `shared/tasks/_template/requirements-package.md` is readable and report pass/fail.

Check 3 - Task classification and routing plan
Before delegating, classify these tasks by complexity and choose the correct internal agents for each one:
- Simple: "Fix a typo in one documentation page."
- Medium: "Add a dry-run flag to an existing script and update its smoke test."
- Complex: "Add a new role agent type, update generated workspaces, routing config, docs, and release checks."

For each task, report:
- complexity: simple|medium|complex
- selected agents: one or more of the internal role agents
- reason: one short sentence explaining why this routing is appropriate

Expected routing behavior:
- simple tasks should normally use `main` alone or one narrowly relevant role such as `docs` or `reviewer`.
- medium tasks should use a small set of focused roles, for example `backend` + `qa` + `reviewer` when script behavior changes.
- complex tasks should involve multiple complementary roles, commonly `pm`, `architect`, implementation roles, `qa`, `reviewer`, `security` when risk is relevant, and `docs` for user-facing changes.

Check 4 - Cross-role synthesis
Ask `reviewer` to review the PM/architect/QA results and the task classification/routing plan for contradictions, missing safety checks, over-routing, under-routing, or signs that role routing is broken.

Success criteria:
- `main` can reach the requested internal agents through agent-to-agent routing.
- Role outputs stay in their lanes.
- `main` can classify simple, medium, and complex tasks differently.
- `main` can assign one or more appropriate internal agents based on task complexity and domain.
- `qa` can read the shared task template path.
- `reviewer` can inspect outputs from other roles and review routing decisions.
- `main`, not a child role agent, returns the final user-facing summary.

Final response format:
- verdict: ok|warning|blocking
- reached agents: list the agents that responded
- classification check: one line saying whether simple/medium/complex routing was appropriate
- failures: list any missing/failed checks, or `none`
- next action: one short recommendation
```

Expected result: `verdict: ok`, all four requested role agents (`pm`, `architect`, `qa`, `reviewer`) listed as reached, and the classification check showing different routing for simple, medium, and complex tasks. A `warning` is acceptable only if the issue is cosmetic or documentation-only. A `blocking` result means the reproduction should be debugged before relying on the team.

### Full validation (optional)

If you want a deeper check, run the SOP in:

- `scripts/healthcheck-runtime.md`

Note: Host-side filesystem/runtime checks can be run with:

```bash
node scripts/healthcheck-runtime.js --target "$HOME/.openclaw"
```

## Troubleshooting (debugging only)

Use this section only if Phase 1/2 fails.

1) Re-run the read-only checks:

```bash
node scripts/repro-check.js --target "$HOME/.openclaw"
node scripts/doctor-local.js
```

2) If `reproduce-new-machine.js --apply` fails, narrow down with these steps:

- Workspaces/templates:

```bash
node scripts/generate-workspaces.js --target "$HOME/.openclaw"
node scripts/generate-workspaces.js --target "$HOME/.openclaw" --apply
```

- Agent registration (preview first):

```bash
node scripts/register-agents.js --target "$HOME/.openclaw" --model g
```

- Routing config patch (review output):

```bash
node scripts/configure-agent-routing.js --output /tmp/openclaw-agent-routing.patch.json
openclaw config patch --file /tmp/openclaw-agent-routing.patch.json --dry-run
```

3) If you changed config, validate and restart:

```bash
openclaw config validate
openclaw gateway restart
```

4) If agent-to-agent sends fail:

- Ensure the Gateway is restarted after config changes.
- Ensure `tools.agentToAgent.enabled=true` in your OpenClaw config.

For the full script list and flags, see:

- `docs/reference/scripts.md`

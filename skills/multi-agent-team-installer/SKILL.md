---
name: multi-agent-team-installer
description: Guided merge-based installer for the OpenClaw multi-agent team. Use when a user wants to install, set up, or migrate the openclaw-multi-agent-team into their existing OpenClaw without overwriting their API keys, agents, or workspace files.
---

English | [中文](SKILL.zh-CN.md)

# Multi-Agent Team Installer

You are an installation guide for the OpenClaw multi-agent software team. Your
job is to install or migrate the team into the user's existing OpenClaw safely,
**without destroying any of their data**.

## Core Principle

**NEVER blind-overwrite user config or workspace files.** Always merge, always
preview, always confirm before writing. The user's API keys, existing agents,
model providers, and workspace content (MEMORY.md, task archives) must survive.

## Installation Flow

Follow these steps in order. Stop and ask the user when you hit a decision point.

### Step 1: Understand the current state

```bash
# Read the user's existing config (do NOT print secrets to chat)
cat ~/.openclaw/openclaw.json
```

Note what already exists:
- `models.providers` (API keys — preserve these)
- `agents.list[]` (existing agents — merge by id, never replace)
- `agents.defaults.subagents` (may already have policy)
- Legacy `tools.agentToAgent` / `session.agentToAgent` (flag for removal)

### Step 2: Preview the merge

```bash
node scripts/install-wizard.js --target ~/.openclaw
```

This is dry-run. It prints:
- The merge plan (what will be added/merged/kept)
- Warnings (legacy A2A config, visibility conflicts)

**Show the plan to the user. Explain each change in plain language.**

### Step 3: Confirm and apply config

Only after the user confirms:

```bash
node scripts/install-wizard.js --target ~/.openclaw --apply
```

This backs up `openclaw.json` first, then writes the merged config. Report the
backup path so the user knows how to roll back.

### Step 4: Generate worker workspaces (additive only)

```bash
node scripts/generate-workspaces.js --target ~/.openclaw --preserve-existing
```

`--preserve-existing` ensures existing workspace files are never overwritten —
only missing files are added.

### Step 5: Register role agents

```bash
# Preview first
node scripts/register-agents.js --target ~/.openclaw
# Apply after confirmation (skips agents that already exist)
node scripts/register-agents.js --target ~/.openclaw --apply
```

### Step 6: Verify and report

```bash
node scripts/healthcheck-local.js --target ~/.openclaw
openclaw agents list
```

Then produce an installation report:
- What was added (new agents, subagent policy)
- What was preserved (API keys, existing agents, workspace files)
- What needs manual attention (legacy A2A removal, model config per role)
- How to roll back (backup path)
- Reminder to restart Gateway manually

## Decision Points (always ask the user)

1. **Existing `main` agent with different config** → ask whether to merge subagent
   policy into it or keep theirs.
2. **Legacy A2A config detected** → explain it's no longer used; ask before removing.
3. **Model assignment per role** → ask which model each role agent should use
   (e.g., orchestrator on a strong model, workers on cheaper models).
4. **Worker workspace conflicts** → if a workspace file already exists, keep the
   user's version and note it.

## Safety Rules

- Config writes go through `install-wizard.js --apply` (backs up first).
- Workspace writes use `--preserve-existing` (additive only).
- Never run `--apply` without showing the dry-run plan first.
- Never print API keys, tokens, or secrets into the chat.
- Restart Gateway only with explicit user confirmation.

## Architecture Reference

See `docs/concepts/subagent-architecture.md` for the depth model:
- Depth-0 (main): user-facing entry
- Depth-1 (orchestrator): coordinator
- Depth-2 (worker): results via internal injection

The installer configures `maxSpawnDepth: 2` so orchestrators can spawn workers.

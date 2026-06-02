English | [中文](workspaces.zh-CN.md)

# Workspaces

Each long-lived role Agent has an independent OpenClaw workspace.

Typical Linux layout:

```text
<OPENCLAW_HOME>/workspace              # main
<OPENCLAW_HOME>/workspace-pm
<OPENCLAW_HOME>/workspace-architect
<OPENCLAW_HOME>/workspace-backend
...
```

Each role workspace contains:

```text
AGENTS.md
SOUL.md
USER.md
TOOLS.md
MEMORY.md
IDENTITY.md
memory/
shared -> <OPENCLAW_HOME>/workspace/shared
```

## Private files

Generated private placeholders are local. Do not commit real:

- `MEMORY.md`
- `USER.md`
- `TOOLS.md`
- sessions
- logs
- auth profiles

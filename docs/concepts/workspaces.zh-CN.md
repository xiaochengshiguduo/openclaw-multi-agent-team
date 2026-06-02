[English](workspaces.md) | 中文

# Workspaces

每个长期存在的角色 Agent 都有独立的 OpenClaw workspace。

典型 Linux 布局：

```text
<OPENCLAW_HOME>/workspace              # main
<OPENCLAW_HOME>/workspace-pm
<OPENCLAW_HOME>/workspace-architect
<OPENCLAW_HOME>/workspace-backend
...
```

每个角色 workspace 包含：

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

## 私有文件

生成的私有占位文件是本地文件。不要提交真实的：

- `MEMORY.md`
- `USER.md`
- `TOOLS.md`
- sessions
- logs
- auth profiles

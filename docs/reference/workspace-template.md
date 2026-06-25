# 工作区模板

`workspace-template/` 包含工作区生成期间使用的通用文件。

生成的工作区会收到角色专属的 `AGENTS.md` 和 `SOUL.md`，以及本地占位文件：

```text
USER.md
TOOLS.md
MEMORY.md
HEARTBEAT.md
IDENTITY.md
memory/
```

这些本地文件可能变成私有文件，生成后不应提交。

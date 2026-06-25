# 创建新团队

本指南只创建本地 Linux 工作区。它不会修改 OpenClaw 配置，也不会重启 Gateway。

```bash
node scripts/generate-workspaces.js --target "$HOME/.openclaw"
```

查看输出。然后运行：

```bash
node scripts/generate-workspaces.js --target "$HOME/.openclaw" --apply
```

生成的布局：

```text
~/.openclaw/workspace
~/.openclaw/workspace-pm
~/.openclaw/workspace-architect
...
```

角色工作区包含一个指向主工作区 shared 目录的 `shared` 符号链接。

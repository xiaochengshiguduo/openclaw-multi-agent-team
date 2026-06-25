# 首次运行

预览工作区生成计划：

```bash
node scripts/generate-workspaces.js --target "$HOME/.openclaw"
```

审核计划后再应用：

```bash
node scripts/generate-workspaces.js --target "$HOME/.openclaw" --apply
```

运行本地健康检查：

```bash
node scripts/healthcheck-local.js
```

预览 Agent 注册：

```bash
node scripts/register-agents.js --target "$HOME/.openclaw" --model gpt/gpt-5.5
```

预览 Agent 到 Agent 的配置补丁：

```bash
node scripts/configure-agent-routing.js
```

这些命令仅用于预览。请先审核生成的注册 / 配置变更，再执行对应的 `--apply` 或 `openclaw config patch` 步骤。

运行时验证见 `scripts/healthcheck-runtime.md`。

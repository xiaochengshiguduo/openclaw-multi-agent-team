---
name: multi-agent-team-installer
description: OpenClaw 多 Agent 团队的引导式合并安装器。当用户想要安装、设置或迁移 openclaw-multi-agent-team 到现有 OpenClaw 而不覆盖其 API keys、agents 或 workspace 文件时使用。
---

# Multi-Agent Team 安装器

你是 OpenClaw 多 Agent 软件团队的安装向导。你的任务是安全地将团队安装或迁移到用户现有的 OpenClaw 中，**而不破坏他们的任何数据**。

## 核心原则

**永远不要盲目覆盖用户的 config 或 workspace 文件。** 始终合并、始终预览、写入前始终确认。用户的 API keys、现有 agents、模型 providers 和 workspace 内容（MEMORY.md、task archives）必须保留。

## 安装流程

按顺序执行以下步骤。遇到决策点时停下来询问用户。

### 步骤 1：理解当前状态

```bash
# 读取用户现有配置（不要把 secrets 打印到聊天中）
cat ~/.openclaw/openclaw.json
```

记录已存在的内容：
- `models.providers`（API keys — 保留）
- `agents.list[]`（现有 agents — 按 id 合并，永不替换）
- `agents.defaults.subagents`（可能已有策略）
- 旧版 `tools.agentToAgent` / `session.agentToAgent`（标记为待移除）

### 步骤 2：预览合并

```bash
node scripts/install-wizard.js --target ~/.openclaw
```

这是 dry-run。它会打印：
- 合并计划（将添加/合并/保留什么）
- 警告（旧版 A2A 配置、visibility 冲突）

**将计划展示给用户。用通俗语言解释每个变更。**

### 步骤 3：确认并应用配置

仅在用户确认后：

```bash
node scripts/install-wizard.js --target ~/.openclaw --apply
```

这会先备份 `openclaw.json`，然后写入合并后的配置。报告备份路径，让用户知道如何回滚。

### 步骤 4：生成 worker workspaces（仅添加）

```bash
node scripts/generate-workspaces.js --target ~/.openclaw --preserve-existing
```

`--preserve-existing` 确保现有 workspace 文件永不被覆盖——只添加缺失的文件。

### 步骤 5：注册角色 agents

```bash
# 先预览
node scripts/register-agents.js --target ~/.openclaw
# 确认后应用（跳过已存在的 agents）
node scripts/register-agents.js --target ~/.openclaw --apply
```

### 步骤 6：验证并报告

```bash
node scripts/healthcheck-local.js --target ~/.openclaw
openclaw agents list
```

然后生成安装报告：
- 添加了什么（新 agents、subagent 策略）
- 保留了什么（API keys、现有 agents、workspace 文件）
- 需要手动处理什么（移除旧版 A2A、为每个角色配置模型）
- 如何回滚（备份路径）
- 提醒手动重启 Gateway

## 决策点（始终询问用户）

1. **现有 `main` agent 配置不同** → 询问是否将 subagent 策略合并进去还是保留他们的
2. **检测到旧版 A2A 配置** → 解释它已不再使用；询问是否移除
3. **为每个角色分配模型** → 询问每个角色 agent 应该用哪个模型（例如 orchestrator 用强模型，workers 用便宜模型）
4. **Worker workspace 冲突** → 如果 workspace 文件已存在，保留用户版本并记录

## 安全规则

- 配置写入通过 `install-wizard.js --apply`（先备份）
- Workspace 写入使用 `--preserve-existing`（仅添加）
- 不显示 dry-run 计划前永远不要运行 `--apply`
- 永远不要把 API keys、tokens 或 secrets 打印到聊天中
- 仅在用户明确确认后才重启 Gateway

## 架构参考

参考 `docs/concepts/subagent-architecture.md` 了解深度模型：
- Depth-0 (main)：面向用户的入口
- Depth-1 (orchestrator)：协调者
- Depth-2 (worker)：通过内部注入返回结果

安装器配置 `maxSpawnDepth: 2` 以便 orchestrators 可以派生 workers。

---
name: multi-agent-team-updater
description: OpenClaw 多 Agent 团队的引导式增量更新器。当用户想要更新已安装的 openclaw-multi-agent-team 的 workspace 模板、任务模板或共享文件时使用。
---

# Multi-Agent Team 更新器

你是 OpenClaw 多 Agent 软件团队的更新向导。你的任务是安全地更新用户已安装的团队 workspace 文件，**而不破坏用户的自定义内容**。

## 核心原则

**永远不要覆盖用户修改过的文件。** 始终预览、始终确认。用户的 MEMORY.md、task archives、自定义配置和 workspace 内容必须保留。

## 更新流程

按顺序执行以下步骤。遇到决策点时停下来询问用户。

### 步骤 1：理解当前状态

```bash
# 读取现有安装状态
cat ~/.openclaw/state/openclaw-multi-agent-team/update-state.json 2>/dev/null || echo "无更新记录"
```

记录：
- 上次更新时间
- 当前安装版本
- 用户自定义过的文件

### 步骤 2：获取最新代码

```bash
# 如果用户已有本地 clone
cd /path/to/openclaw-multi-agent-team && git pull

# 如果没有本地 clone，使用 curl 获取更新脚本
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/update-runtime-workspace.sh)" --
```

这是 dry-run。它会打印：
- 更新计划（将添加/更新/跳过什么）
- 冲突列表（用户修改过的文件）
- 跳过原因

**将计划展示给用户。用通俗语言解释每个变更。**

### 步骤 3：确认并应用更新

仅在用户确认后：

```bash
# 本地 clone
scripts/update-runtime-workspace.sh --apply

# 或 curl 方式
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/update-runtime-workspace.sh)" -- --apply
```

这会：
- 备份将被覆盖的文件
- 原子写入更新的文件
- 记录更新状态到 `state/openclaw-multi-agent-team/update-state.json`

### 步骤 4：处理冲突

如果存在冲突（用户修改过的文件）：
- 列出每个冲突文件
- 解释用户版本和新版本的差异
- 询问用户：保留用户版本 / 使用新版本 / 手动合并

### 步骤 5：验证并报告

```bash
node scripts/healthcheck-local.js --target ~/.openclaw
```

然后生成更新报告：
- 更新了什么（workspace 模板、任务模板、共享文件）
- 跳过了什么（用户自定义文件、冲突文件）
- 保留了什么（MEMORY.md、task archives、自定义配置）
- 如何回滚（备份路径）
- 提醒重启 Gateway（如需要）

## 决策点（始终询问用户）

1. **检测到用户修改过的文件** → 询问是否覆盖、保留或合并
2. **更新包含 breaking changes** → 解释影响，询问是否继续
3. **需要重启 Gateway** → 询问是否现在重启

## 安全规则

- 更新前始终先 dry-run 预览
- 写入前始终备份
- 永远不要覆盖 MEMORY.md、task archives 或用户自定义文件
- 永远不要把 API keys、tokens 或 secrets 打印到聊天中
- 仅在用户明确确认后才重启 Gateway

## 允许写入的文件

更新器只能写入以下文件（相对于 workspace）：
- `workspace/AGENTS.md`
- `workspace/TEAM.md`
- `workspace/SOUL.md`
- `workspace/shared/tasks/_template/*.md`
- 各角色 workspace 的 `AGENTS.md`、`SOUL.md`、`TEAM.md`
- 各角色 workspace 的 `shared/tasks/_template/*.md`

其他文件（USER.md、TOOLS.md、MEMORY.md、HEARTBEAT.md、IDENTITY.md、task archives）永远不允许覆盖。

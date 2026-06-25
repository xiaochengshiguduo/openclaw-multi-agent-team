# 运行时健康检查

此检查清单用于在工作区、Agent 注册和路由配置已应用后，验证真实的 OpenClaw 运行时。

v1 中它有意保持为手动/SOP 驱动。不要用它绕过配置审查、Gateway 重启审批或 Telegram 绑定安全要求。

## 前置条件

- OpenClaw 已安装并正在运行。
- 模型/provider 认证已配置。
- 工作区已从本项目生成。
- 角色 Agent 已注册。
- Agent-to-agent 路由补丁已审查，并已手动应用。
- 如果 OpenClaw 要求，Gateway 已手动重启。

## 预期 Agent

```text
main
pm
architect
backend
frontend
qa
reviewer
security
devops
docs
research
```

## 检查 1 — 运行时状态

运行：

```bash
openclaw status
```

预期：

- Gateway 正在运行。
- Agent 数量包含预期的角色 Agent。
- 没有严重的任务/运行时错误。

如果此项失败，请在这里停止，并先修复 OpenClaw 运行时。

## 检查 2 — Agent 清单

运行：

```bash
openclaw agents list
```

预期：

- `main` 存在。
- 所有角色 Agent 都存在。
- 角色 Agent 使用生成的 `workspace-<role>` 路径。
- 如果使用 Telegram，只有 `main` 绑定了面向用户的频道。

子 Agent 默认不应绑定到 Telegram。

## 检查 3 — 共享任务归档路径

在宿主机上验证：

```bash
ls -la "$HOME/.openclaw/workspace/shared/tasks/_template/requirements-package.md"
ls -la "$HOME/.openclaw/workspace-pm/shared"
```

预期：

- 任务模板存在。
- 角色工作区的 `shared` 路径指向 main 工作区的 `shared`。

## 检查 4 — main → 角色 Agent 通信

从 `main` 向 `pm` 发送一个低风险、只读任务：

```text
Please verify you can read your AGENTS.md, TEAM.md, and shared/tasks/_template/requirements-package.md. Return only pass/fail and any missing path.
```

`pm` 的预期返回：

```text
pass
```

如果要做完整验证，请对所有角色 Agent 重复此检查。

## 检查 5 — 全角色共享读取矩阵

预期矩阵：

| 角色 | AGENTS.md | TEAM.md | shared task template |
|---|---|---|---|
| pm | pass | pass | pass |
| architect | pass | pass | pass |
| backend | pass | pass | pass |
| frontend | pass | pass | pass |
| qa | pass | pass | pass |
| reviewer | pass | pass | pass |
| security | pass | pass | pass |
| devops | pass | pass | pass |
| docs | pass | pass | pass |
| research | pass | pass | pass |

如果某个角色无法读取 `shared/tasks`，请检查该角色工作区的 `shared` symlink。

## 检查 6 — 模拟 e2e 演练

使用本项目的任务辅助工具创建一个模拟任务归档，或手动使用模板创建：

```bash
node scripts/create-task-archive.js --slug e2e-drill --tasks-root "$HOME/.openclaw/workspace/shared/tasks" --apply
```

然后从 `main`：

1. 写一份简短的模拟 brief
2. 请求 `pm` 给出需求/验收标准
3. 请求 `reviewer` 做安全性/可维护性审查
4. 写入 `final.md`
5. 向用户总结结果

预期：

- 任务归档存在
- 角色输出由 `main` 捕获或总结
- 最终结果由 `main` 交付，而不是直接转发原始角色输出

## 检查 7 — 安全边界

确认：

- 没有子 Agent 绑定 Telegram，除非这是明确有意的设置
- 默认情况下，没有给任何角色 Agent 授予宽泛的外部写入权限
- 没有真实密钥被复制到生成的工作区中
- `main` 仍然是面向用户的入口点

## 通过标准

运行时复现通过的条件：

- Gateway/运行时健康
- 所有预期 Agent 都存在
- `main` 能调用角色 Agent
- 角色 Agent 能读取共享任务归档模板
- 模拟 e2e 演练完成
- 面向用户的交付仍由 `main` 完成

## 失败处理

常见失败：

### Agent-to-agent disabled

症状：

```text
Agent-to-agent messaging is disabled
```

修复：

- 审查 `configure-agent-routing.js` 输出
- 手动应用所需配置
- 如有需要，手动重启 Gateway

### 角色无法读取 shared/tasks

修复：

- 检查角色工作区路径
- 检查 `shared` symlink
- 如果安全，重新生成工作区

### Agent 缺失

修复：

- 运行 `register-agents.js` 预览
- 仅在审查后应用注册

### Telegram 路由到了子 Agent

修复：

- 移除子 Agent 的频道绑定
- 仅将 Telegram 保留在 `main` 上

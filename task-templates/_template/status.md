# 任务状态

## 状态机

```text
intake → clarify → plan → execute → review → final → archived
```

替代终态：

```text
cancelled
blocked
```

## 当前状态

- 阶段：intake | clarify | plan | execute | review | final | archived | cancelled | blocked
- 状态：active | waiting-user | waiting-agent | blocked | completed | cancelled
- 负责人：main | pm | architect | backend | frontend | qa | reviewer | security | devops | docs | research
- 更新时间：YYYY-MM-DD HH:mm TZ

## 阶段定义

### intake

main 捕获用户目标，必要时创建任务档案，并记录初始约束。

退出标准：

- 已足够理解用户目标并可路由，或已识别 blocking questions。

### clarify

pm 或 main 澄清目标、范围、成功标准、用户/场景、约束和风险。

退出标准：

- 已有 requirements package，或明确记录假设/阻塞项。

### plan

main 与相关专业 Agent 决定方案、路由、文件、验证方式和权限边界。

退出标准：

- plan.md 已包含路由、预期输出和 next action。

### execute

专业 Agent 执行限定范围的工作或产出限定范围的分析。

退出标准：

- 角色输出已返回 main 并归档。

### review

qa/reviewer/security/devops/docs 按需审查。

退出标准：

- 已记录验证结果和剩余风险。

### final

main 解决冲突，写 final.md，并向用户汇报。

退出标准：

- 已交付面向用户的摘要。
- 任务档案包含 final.md。

### archived

没有剩余活动工作。

## 状态变更日志

| 时间 | 从 | 到 | 负责人 | 原因 |
|---|---|---|---|---|
| YYYY-MM-DD HH:mm TZ | intake | clarify | main | ... |

## 当前阻塞项

- [info] ...
- [warning] ...
- [blocking] ...

## 等待中的 Agent

| 岗位 | 任务 | 开始时间 | 期望输出 | 备注 |
|---|---|---|---|---|
|  |  |  |  |  |

## 结果追踪清单

main 在 runtime event、compact 或等待子 Agent 后继续时：

- [ ] 读取本 status.md 确认 stage/status/owner。
- [ ] 读取 subagents.md 确认 taskNames、session hints、cleanup policy。
- [ ] 查找未归档的子 Agent 输出或 session history。
- [ ] 将结果写入 subagents.md 结果记录。
- [ ] 继续下一步前更新当前状态。

## 下一步动作
- ...

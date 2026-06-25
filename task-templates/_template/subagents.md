# 子 Agent

追踪本任务派生的子 agent，用于协调、深度管理和结果流向可视化。

## 架构

本任务使用 OpenClaw 的 subagent announce 链：

- **Depth 0 (main)：** 任务所有者，唯一面向用户的 agent
- **Depth 1：** main 的直接子级（编排者或工作者）
- **Depth 2：** depth-1 编排者派生的工作者

Depth-2 工作者的结果通过内部注入（`deliver=false`）流向其 depth-1 父级，防止刷屏 Telegram。

## 已派生 Agent

| taskName | role | depth | parent | status | spawned at | output location |
|---|---|---|---|---|---|---|
| backend_api | backend | 2 | tech_lead_coord | completed | YYYY-MM-DD HH:mm TZ | backend.md |
| frontend_ui | frontend | 2 | tech_lead_coord | completed | YYYY-MM-DD HH:mm TZ | frontend.md |
| tech_lead_coord | architect | 1 | main | completed | YYYY-MM-DD HH:mm TZ | architecture.md |

状态值：`planned | running | completed | failed | cancelled`

**深度管理：**

- 如果 main 直接派生工作者 → depth-1，announce 给 main
- 如果 main 派生编排者 → 编排者处于 depth-1，派生 depth-2 工作者
- 工作者通过第一条消息中的 `[Subagent Task]` 接收任务
- 结果流向：工作者 → （编排者） → main → 用户

## 完成流程

所有预期子级完成后：

1. Depth-2 工作者 announce 给其 depth-1 编排者（内部注入）
2. 编排者综合结果，announce 给 main
3. main 整合编排者输出，交付给用户

## 备注

- 派生后使用 `sessions_yield` 等待完成事件
- 完成事件作为运行时消息到达，无需轮询
- `subagents list` 显示本会话的活跃/最近子级
- 子级输出在任务归档中，按角色对应的文件存放

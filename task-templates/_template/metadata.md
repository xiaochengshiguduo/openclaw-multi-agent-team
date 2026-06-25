# 任务元数据

## 标识

- 任务 ID：TASK-YYYYMMDD-HHMM-简短名称
- 标题：<简短、可读的标题>
- 创建时间：YYYY-MM-DD HH:mm TZ
- 最后更新：YYYY-MM-DD HH:mm TZ
- 负责人：main
- 当前阶段：intake | clarify | plan | execute | review | final | archived
- 当前状态：active | waiting-user | waiting-agent | blocked | completed | cancelled

## 来源

- 用户请求：<简短引用或摘要>
- 来源渠道：Telegram / Web / Other
- 来源 agent：main
- 相关消息：<可选的脱敏引用；不要在提交示例中保存私有 Telegram/runtime ID>

## 可见性

- 归档路径：shared/tasks/TASK-YYYYMMDD-HHMM-简短名称/
- 工作空间可见性：通过 `<role-workspace>/shared -> <OPENCLAW_HOME>/workspace/shared` 共享
- 敏感数据：none | redacted | present-with-restrictions
- 外部操作风险：none | low | medium | high

## 参与者

- main：负责人 / 面向用户的 supervisor
- pm：not-needed | pending | done | blocked
- architect：not-needed | pending | done | blocked
- backend：not-needed | pending | done | blocked
- frontend：not-needed | pending | done | blocked
- qa：not-needed | pending | done | blocked
- reviewer：not-needed | pending | done | blocked
- security：not-needed | pending | done | blocked
- devops：not-needed | pending | done | blocked
- docs：not-needed | pending | done | blocked
- research：not-needed | pending | done | blocked

## 下游上下文契约

当 main 要求某个角色 Agent 处理本任务时，至少包含：

- 任务 ID
- 目标
- 当前阶段/状态
- 相关共享文件
- 上游结论
- 范围 / 非目标
- 验收标准
- 已知风险 / 阻塞项
- 明确权限

## 决策日志

- YYYY-MM-DD HH:mm TZ — <决策> — 负责人：<main/角色/用户>

## 阻塞项

- [info] ...
- [warning] ...
- [blocking] ...

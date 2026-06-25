# 路由决策

## 决策

- Decision: multi-agent
- Created by: main
- Date: 2026-05-30

## 原因

- 任务是否属于聊天/只读/非持久/低风险：否。
- 为什么允许或不允许 main 直接处理：任务会修改持久化工作流文档、模板和测试。
- 用户 override：用户要求持久化路由决策模型。

## 是否允许直接处理

- 聊天或解释：否
- 只读检查：否
- 非持久计划/建议：否
- 低风险：是，但任务具有持久产物，因此不允许直接处理

## 必须进入 Multi-Agent 的触发条件

- 持久产物：是 — 文档、模板和测试
- 正式项目结果：是 — 实现后可能产生 changelog/commit
- runtime/环境状态：否
- 审查/测试/验证/审计/风险评估/发布就绪：是 — 验证和审查属于验收内容
- 可复用流程/模板/skill/SOP/长期规则：是 — 路由协议是长期规则

## 给 TEAM.md 路由的备注

- Context for TEAM.md：这是工作流/协议文档任务，需要验证覆盖。
- Known constraints：不修改 runtime config，不做外部写入，除非用户另行批准。
- User confirmations required：GitHub push、PR、release 或 runtime config 变更。

## 重新路由日志

| 时间 | 变更 | 原因 |
|---|---|---|
| 2026-05-30 | 初始进入 Multi-Agent | 用户要求持久化路由决策模型 |

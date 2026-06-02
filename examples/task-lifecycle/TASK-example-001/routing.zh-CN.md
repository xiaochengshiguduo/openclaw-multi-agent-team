[English](routing.md) | 中文

# 路由决策

## 决策

- Level: Level 3
- Mode: multi-agent-archived
- Created by: main
- Date: 2026-05-30

## 原因

- 复杂度：文档和流程更新，需要设计、验证和审查。
- 影响范围：影响未来任务入口、角色选择和共享任务档案。
- 风险：实现风险低，但工作流影响较高。
- 持久化需求：需要，因为路由决策应可审计。
- 不确定性：部分流程表述和阈值需要审查。
- 用户 override：用户要求采用四级路由模型和可解释 routing decision。

## 评分

| 维度 | 分数 | 说明 |
|---|---:|---|
| 复杂度 | 2 | 设计 + 文档 + 验证 |
| 影响范围 | 2 | 多份文档/模板/测试 |
| 角色 | 2 | main、pm、architect、docs、qa、reviewer |
| 风险 | 1 | 工作流影响，无生产变更 |
| 持久化 | 2 | 需要任务档案约定 |
| 不确定性 | 1 | 流程措辞和阈值 |
| 总分 | 10 | Level 3 |

## 高风险触发条件

- 密钥/凭证/私有配置：否
- 认证/授权/网络暴露：否
- destructive 或不可逆写入：否
- Runtime/Gateway/model/provider/scheduler 配置：否
- systemd/cron/nginx/SSH/DNS/CI/CD/deployment/release：否
- 外部写入/公开资源：否，除非用户之后批准 push/PR
- 隐私敏感数据/memory/session transcript：否

## 选择的 Agent

- `main`：负责路由、用户沟通和最终交付。
- `pm`：确认用户价值、范围和验收标准。
- `architect`：检查四级模型和任务档案集成。
- `docs`：编写双语文档和交接说明。
- `qa`：定义 routing 文档/模板的 smoke 覆盖。
- `reviewer`：检查清晰度、可维护性和是否过度复杂。

## 未选择

- `backend`：
  - 原因：预计没有后端/runtime 实现。
- `frontend`：
  - 原因：没有 UI/client 工作。
- `security`：
  - 原因：示例不涉及密钥或 runtime 变更；如果加入外部写入或配置变更则参与。
- `devops`：
  - 原因：示例不涉及部署/runtime 变更；如果加入 CI/CD 或 OpenClaw runtime 变更则参与。
- `research`：
  - 原因：实现前已完成先例调研。

## 升级条件

- Upgrade to Level 2 if：不适用，当前已经是 Level 3。
- Upgrade to Level 3 if：已经是 Level 3。
- Add Level 4 overlay if：加入 push/release/runtime config/external-write 工作。
- Ask user before：推送到 GitHub、开 PR、发布或修改 runtime config。

## 重新路由日志

| 时间 | 变更 | 原因 |
|---|---|---|
| 2026-05-30 | 初始 Level 3 路由 | 用户要求持久化路由决策优化 |

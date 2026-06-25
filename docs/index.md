# 文档

用于复现、运行和安全发布 OpenClaw 长期多 Agent 软件团队的文档。

## 从这里开始

根据你的目标选择入口。

| 目标 | 阅读 |
|---|---|
| 快速理解项目 | [项目概览](concepts/overview.md) |
| 在新的 Linux 机器上复现团队 | [安装指南](../README.md#安装) 和 [子 Agent 架构](concepts/subagent-architecture.md) |
| 从模板创建团队 | [团队创建指南](guides/create-a-new-team.md) |
| 创建和管理任务档案 | [任务档案指南](guides/create-a-task.md) |
| 运行本地/runtime 检查 | [健康检查指南](guides/run-healthchecks.md) 和 [runtime healthcheck 自动化](guides/runtime-healthcheck-automation.md) |
| 审查安全边界 | [安全模型](security/security-model.md) |
| 维护本仓库 | [开发规范](reference/development-guidelines.md) |
| 准备发布 | [发布检查清单](reference/release-checklist.md) |

## 安装路径

如果 OpenClaw 已经通过官方引导流程安装并配置好，建议按这个顺序阅读：

1. [前置要求](getting-started/prerequisites.md)
2. [安装指南](../README.md#安装) — 引导式 AI 辅助合并安装器
3. [子 Agent 架构](concepts/subagent-architecture.md)
4. [OpenClaw 版本策略](reference/openclaw-version-policy.md)
5. [脚本参考](reference/scripts.md)
6. [健康检查指南](guides/run-healthchecks.md)
7. [E2E 演练指南](guides/run-an-e2e-drill.md)

重要边界：本项目**不安装、不升级、不降级、不固定** OpenClaw。它从 OpenClaw 已经存在之后开始工作。引导式安装器将团队配置合并进你现有的 OpenClaw 设置，而不覆盖你的 API keys、现有 agents 或 workspace 文件。

## 概念地图

如果你想理解系统设计，读这些：

- [项目概览](concepts/overview.md) — 高层架构和项目目的
- [角色和职责](concepts/roles-and-responsibilities.md) — `main` 和岗位 Agent 的边界
- [路由决策](concepts/routing-decision.md) — 判断何时由 `main`、单个专家或完整多 Agent 协作处理
- [工作区](concepts/workspaces.md) — 独立 workspace 和 shared symlink
- [共享任务档案](concepts/shared-task-archive.md) — 持久任务档案约定
- [子 Agent 架构](concepts/subagent-architecture.md) — 基于深度的编排和结果流转
- [任务生命周期](concepts/task-lifecycle.md) — 从 intake 到 final archive
- [安全模型](concepts/safety-model.md) — preview-first 和人工风险边界

## 操作指南

使用和维护模板的实用流程。

- [创建新团队](guides/create-a-new-team.md)
- [创建任务档案](guides/create-a-task.md)
- [运行健康检查](guides/run-healthchecks.md)
- [Runtime healthcheck 自动化](guides/runtime-healthcheck-automation.md)
- [运行 E2E 演练](guides/run-an-e2e-drill.md)
- [添加岗位 Agent](guides/add-a-role-agent.md)
- [同步团队文档](guides/sync-team-docs.md)
- [迁移已有 workspace](guides/migrate-existing-workspace.md)

## 参考资料

用于查细节、脚本、兼容性或发布准备。

- [目录结构](reference/directory-structure.md)
- [脚本参考](reference/scripts.md)
- [配置示例](reference/config-examples.md)
- [OpenClaw 版本策略](reference/openclaw-version-policy.md)
- [兼容性矩阵](reference/compatibility.md)
- [环境变量](reference/environment-variables.md)
- [Runtime localization 设计](reference/runtime-localization.md)
- [角色模板参考](reference/role-template.md)
- [Workspace 模板参考](reference/workspace-template.md)
- [任务模板参考](reference/task-template.md)
- [开发规范](reference/development-guidelines.md)
- [Preflight 检查](reference/preflight.md)
- [发布检查清单](reference/release-checklist.md)
- [Release notes 草稿](reference/release-notes-draft.md)

## 安全和发布

在真实 OpenClaw 环境应用改动或发布仓库前，先阅读这些：

- [安全模型](security/security-model.md)
- [Secrets 和脱敏](security/secrets-and-redaction.md)
- [Dry-run 和 apply 策略](security/dry-run-and-apply.md)
- [安全发布检查清单](security/safe-publishing-checklist.md)

## 示例

用于理解期望输出和工作流的脱敏示例。

- [Minimal team 示例](examples/minimal-team.md)
- [Full software team 示例](examples/full-software-team.md)
- [任务档案示例](examples/task-archive-example.md)
- [多 Agent E2E 演练示例](examples/multi-agent-e2e-drill.md)

## 故障排查和 FAQ

- [Setup 故障排查](getting-started/troubleshooting-setup.md)
- [故障排查](troubleshooting.md)
- [FAQ](faq.md)

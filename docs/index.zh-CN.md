[English](index.md) | 中文

# 文档

用于复现、运行和安全发布 OpenClaw 长期多 Agent 软件团队的文档。

## 从这里开始

根据你的目标选择入口。

| 目标 | 阅读 |
|---|---|
| 快速理解项目 | [项目概览](concepts/overview.zh-CN.md) |
| 在新的 Linux 机器上复现团队 | [新机器复现指南](getting-started/reproduce-on-new-machine.zh-CN.md) |
| 从模板创建团队 | [团队创建指南](guides/create-a-new-team.zh-CN.md) |
| 创建和管理任务档案 | [任务档案指南](guides/create-a-task.zh-CN.md) |
| 运行本地/runtime 检查 | [健康检查指南](guides/run-healthchecks.zh-CN.md) 和 [runtime healthcheck 自动化](guides/runtime-healthcheck-automation.zh-CN.md) |
| 审查安全边界 | [安全模型](security/security-model.zh-CN.md) |
| 维护本仓库 | [开发规范](reference/development-guidelines.zh-CN.md) |
| 准备发布 | [发布检查清单](reference/release-checklist.zh-CN.md) |

## 新机器复现路径

如果 OpenClaw 已经通过官方引导流程安装并配置好，建议按这个顺序阅读：

1. [前置要求](getting-started/prerequisites.zh-CN.md)
2. [新机器复现指南](getting-started/reproduce-on-new-machine.zh-CN.md)
3. [OpenClaw 版本策略](reference/openclaw-version-policy.zh-CN.md)
4. [脚本参考](reference/scripts.zh-CN.md)
5. [健康检查指南](guides/run-healthchecks.zh-CN.md)
6. [E2E 演练指南](guides/run-an-e2e-drill.zh-CN.md)

重要边界：本项目**不安装、不升级、不降级、不固定** OpenClaw。它从 OpenClaw 已经存在之后开始工作。专用新机器复现脚本可以在显式 `--apply` 后重启 Gateway，让生成的多 Agent 配置生效；普通辅助脚本仍保持 preview-first，且不重启 Gateway。

## 概念地图

如果你想理解系统设计，读这些：

- [项目概览](concepts/overview.zh-CN.md) — 高层架构和项目目的
- [角色和职责](concepts/roles-and-responsibilities.zh-CN.md) — `main` 和岗位 Agent 的边界
- [路由决策](concepts/routing-decision.zh-CN.md) — 判断何时由 `main`、单个专家或完整多 Agent 协作处理
- [工作区](concepts/workspaces.zh-CN.md) — 独立 workspace 和 shared symlink
- [共享任务档案](concepts/shared-task-archive.zh-CN.md) — 持久任务档案约定
- [Agent-to-agent routing](concepts/agent-to-agent-routing.zh-CN.md) — 路由和 session visibility 模型
- [任务生命周期](concepts/task-lifecycle.zh-CN.md) — 从 intake 到 final archive
- [安全模型](concepts/safety-model.zh-CN.md) — preview-first 和人工风险边界

## 操作指南

使用和维护模板的实用流程。

- [创建新团队](guides/create-a-new-team.zh-CN.md)
- [创建任务档案](guides/create-a-task.zh-CN.md)
- [运行健康检查](guides/run-healthchecks.zh-CN.md)
- [Runtime healthcheck 自动化](guides/runtime-healthcheck-automation.zh-CN.md)
- [运行 E2E 演练](guides/run-an-e2e-drill.zh-CN.md)
- [添加岗位 Agent](guides/add-a-role-agent.zh-CN.md)
- [同步团队文档](guides/sync-team-docs.zh-CN.md)
- [迁移已有 workspace](guides/migrate-existing-workspace.zh-CN.md)

## 参考资料

用于查细节、脚本、兼容性或发布准备。

- [目录结构](reference/directory-structure.zh-CN.md)
- [脚本参考](reference/scripts.zh-CN.md)
- [配置示例](reference/config-examples.zh-CN.md)
- [OpenClaw 版本策略](reference/openclaw-version-policy.zh-CN.md)
- [兼容性矩阵](reference/compatibility.zh-CN.md)
- [环境变量](reference/environment-variables.zh-CN.md)
- [角色模板参考](reference/role-template.zh-CN.md)
- [Workspace 模板参考](reference/workspace-template.zh-CN.md)
- [任务模板参考](reference/task-template.zh-CN.md)
- [开发规范](reference/development-guidelines.zh-CN.md)
- [Preflight 检查](reference/preflight.zh-CN.md)
- [发布检查清单](reference/release-checklist.zh-CN.md)
- [Release notes 草稿](reference/release-notes-draft.zh-CN.md)

## 安全和发布

在真实 OpenClaw 环境应用改动或发布仓库前，先阅读这些：

- [安全模型](security/security-model.zh-CN.md)
- [Secrets 和脱敏](security/secrets-and-redaction.zh-CN.md)
- [Dry-run 和 apply 策略](security/dry-run-and-apply.zh-CN.md)
- [安全发布检查清单](security/safe-publishing-checklist.zh-CN.md)

## 示例

用于理解期望输出和工作流的脱敏示例。

- [Minimal team 示例](examples/minimal-team.zh-CN.md)
- [Full software team 示例](examples/full-software-team.zh-CN.md)
- [任务档案示例](examples/task-archive-example.zh-CN.md)
- [多 Agent E2E 演练示例](examples/multi-agent-e2e-drill.zh-CN.md)

## 故障排查和 FAQ

- [Setup 故障排查](getting-started/troubleshooting-setup.zh-CN.md)
- [故障排查](troubleshooting.zh-CN.md)
- [FAQ](faq.zh-CN.md)

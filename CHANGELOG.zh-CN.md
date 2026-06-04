[English](CHANGELOG.md) | 中文

# 更新日志

## 1.0.1 - 2026-06-04

- 新增可持久恢复的子 Agent 调度协议，用于 runtime event、会话压缩和错过 `sessions_yield` 完成回调等场景。
- 新增 `subagents.md` 任务模板，并在新建任务档案时自动包含。
- 更新 main Supervisor 和 workspace 团队协议，要求记录子 Agent taskName、等待状态、cleanup 策略、恢复查询步骤和归档输出。
- 更新 smoke tests，覆盖新的任务模板。

## 1.0.0 - 2026-05-30

- 初始的可复现 OpenClaw 多 Agent 软件团队模板。
- 添加了 `main` Supervisor，以及 10 个长期运行的角色 Agent 模板。
- 添加了已脱敏的工作区和共享任务归档模板。
- 添加了安全、优先预览的设置脚本，用于生成工作区、创建任务归档、预览 Agent 注册、生成路由补丁、复现检查、本地/运行时健康检查，以及预检检查。
- 添加了关于新机器复现、架构、安全边界、OpenClaw 版本策略、脚本、兼容性、发布就绪性和示例的文档。
- 添加了英文/中文 README 入口，以及核心文档的语言切换器。
- 添加了 GitHub CI、issue 模板、pull request 模板、许可证、贡献指南和安全策略。

[English](CHANGELOG.md) | 中文

# 更新日志

## 1.1.0 - 2026-06-04

- 收紧 `main` 自处理边界：`main` 只能直接完成聊天、只读、非持久、低风险任务；持久产物、正式项目结果、runtime/环境变更、审查/测试/验证/审计/风险评估和可复用长期流程必须进入 Multi-Agent 流程。
- 新增 `scripts/update-runtime-workspace.sh` 公开 clone/update wrapper，使已经使用过的 runtime workspace 可以用类似 `bash -c "$(curl -fsSL .../scripts/update-runtime-workspace.sh)" -- --apply` 的远程命令更新。
- 新增 `scripts/update-runtime-workspace.js`，用于已经使用过一段时间的 OpenClaw runtime workspace 的 manifest 驱动增量更新。
- 新增版本化 runtime update manifest：`updates/runtime/1.1.0.json`。
- updater 默认 dry-run，只有 `--apply` 才写入；只写 allowlist 中的项目托管 workspace/template 路径；禁止写配置、memory、session、state 路径；写入前备份；记录 update state 和 plan；用户修改过的文件按 conflict 处理；使用原子写入和锁；无冲突成功 apply 后默认重启 Gateway，可用 `--no-restart` 跳过。
- 新增 smoke tests，覆盖 dry-run 不写入、apply/restart、`--no-restart`、用户修改 conflict、禁止目标路径和 symlink escape 拒绝。

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

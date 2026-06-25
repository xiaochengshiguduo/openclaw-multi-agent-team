[English](CHANGELOG.md) | 中文


## 2.0.0 - 2026-06-25

**重大架构迁移：Agent-to-Agent → Subagent Announce 链**

本版本完全替换了旧版 agent-to-agent (A2A) `sessions_send` ping-pong 模式，改用 OpenClaw 原生的 subagent announce 链架构。这消除了 `maxPingPongTurns` 限制导致的稳定性问题。

**破坏性变更：**

- 移除 `session.agentToAgent.maxPingPongTurns` 配置（不再需要）
- 移除 `tools.agentToAgent` 配置块
- 从 `TEAM.md` 中移除 3.6 节"子 Agent 可恢复调度协议"（替换为深度架构）
- 移除 `configure-agent-routing.js` 脚本（替换为 `configure-subagent-policy.js`）
- 移除 `docs/concepts/agent-to-agent-routing.md`（替换为 `subagent-architecture.md`）

**新架构：**

- 添加 `agents.defaults.subagents.maxSpawnDepth: 2` 支持嵌套编排者模式
- 添加 `agents.defaults.subagents.maxChildrenPerAgent` 和 `maxConcurrent` 控制
- Depth-0 (main)：唯一面向用户的入口
- Depth-1 (编排者)：可选协调者，派生 depth-2 工作者
- Depth-2 (工作者)：专业角色，结果使用 `deliver=false` 内部注入
- 工作者结果通过 announce 链流转，防止刷屏 Telegram

**核心变更：**

- 重写 `scripts/lib/openclaw-config.js` 生成 subagent 策略而非 A2A 路由
- 添加 `scripts/configure-subagent-policy.js` 及深度架构文档
- 替换 `TEAM.md` 3.6 节为"子 Agent 深度架构"说明
- 更新 `task-templates/_template/subagents.md` 从恢复追踪改为深度协调
- 添加 `docs/concepts/subagent-architecture.md` 含使用模式和对比表
- 更新 `scripts/reproduce-new-machine.js` 使用 `subagentPolicyPatch`
- 重写 `tests/smoke/configure-subagent-policy.dry-run.test.js` 含深度断言

**优势：**

- 消除"10个agent只有4-5个返回结果"的不稳定现象
- agent 通信无轮数限制
- 推送式完成事件，无需手动恢复
- 工作者结果不会刷屏用户 Telegram
- 更清晰的编排语义（基于深度）

**迁移指南：**

1. 更新 `~/.openclaw/openclaw.json`：
   - 移除 `session.agentToAgent`
   - 移除 `tools.agentToAgent`
   - 添加 `agents.defaults.subagents.maxSpawnDepth: 2`
   - 添加 `agents.defaults.subagents.maxChildrenPerAgent: 6`
   - 添加 `agents.defaults.subagents.maxConcurrent: 8`

2. 更新 workspace 协议：
   - 检查并更新任何 A2A `sessions_send` 模式改用 `sessions_spawn`
   - 派生后使用 `sessions_yield` 等待完成事件
   - 复杂任务时，派生编排者 agent 来协调工作者

3. 重新测试多 agent 工作流，确认结果稳定交付

**兼容性：**

- 需要 OpenClaw 2026.6.10 或更高版本以获得稳定的 subagent announce 行为
- 角色 agent workspace 保持兼容
- 任务归档格式保持兼容


## 1.1.1 - 2026-06-06

- 保留 1.1.1 作为兼容性 runtime manifest，不包含 workspace 文件变更。

## 1.1.0 - 2026-06-04

- 收紧 `main` 自处理边界：`main` 只能直接完成聊天、只读、非持久、低风险任务；持久产物、正式项目结果、runtime/环境变更、审查/测试/验证/审计/风险评估和可复用长期流程必须进入 Multi-Agent 流程。
- 强化 `TEAM.md` 作为进入 Multi-Agent 后的调度手册，新增调度模式、串行/并行协作规则、冲突处理、Agent 权限矩阵和完成定义。
- 扩展 `TEAM.md` 的进入 Multi-Agent 后任务路由示例，并为每个 `roles/*/AGENTS.md` 增加岗位专属 checklist。
- 新增 bash 一键部署/更新远程命令形态的 smoke 覆盖。
- 收紧角色 `SOUL.md` 的治理/安全边界，并新增 SOUL 协议 smoke 覆盖。
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

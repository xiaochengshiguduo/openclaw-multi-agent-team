# AGENTS.md - OpenClaw 多 Agent 团队工作区

此工作区由 openclaw-multi-agent-team 模板生成。

请使用为当前 Agent 生成的角色专属 `AGENTS.md` 作为协作协议的事实来源。

安全默认值：

- 不要暴露私有记忆、用户数据、token、会话或本地配置。
- 默认由 `main` 作为面向用户的 Supervisor。
- `main` 只能直接完成聊天、只读、非持久、低风险任务。任何会修改持久产物、产出正式项目结果、影响 runtime/环境状态、主要目标是审查/测试/验证/审计/风险评估，或创建可复用流程的任务，都必须进入 Multi-Agent 工作流。进入后由 `TEAM.md` 决定具体岗位路由。
- 角色 Agent 默认是内部协作者：读取共享任务档案，并向 `main` 返回结构化输出。除非 `main` 明确授权精确范围，否则不要联系用户、执行外部写操作或修改共享档案；可写动作应先预览，并要求 `--apply` 或等效确认。
- 当 `main` 跨 turn 使用子 Agent、runtime event、compaction 或 `sessions_yield` 时，遵循 `TEAM.md` 中的可恢复子 Agent 调度协议：记录 taskNames、等待状态、清理策略、恢复查找步骤，并在清理前归档输出。

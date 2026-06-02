[English](overview.md) | 中文

# 项目概览

`openclaw-multi-agent-team` 在 OpenClaw 内建模一套长期可用的软件团队。

```text
用户 → main Supervisor → 岗位 Agents → shared/tasks → 最终交付
```

关键设计不是简单地“很多 Agents”，而是受控协作：

- `main` 与用户沟通。
- `main` 创建并拥有任务档案。
- 岗位 Agents 读取共享任务上下文，并返回结构化输出。
- `main` 解决冲突、验证结果，并交付最终答案。

这样可以集中管理上下文、责任边界和用户侧沟通。

## 为什么需要 shared task archives？

长期多 Agent 工作需要持久上下文。只依赖聊天历史很脆弱。共享任务档案为所有角色提供共同的事实来源：

```text
shared/tasks/TASK-YYYYMMDD-HHMM-slug/
```

一个任务档案可以包含：

- `brief.md`
- `plan.md`
- role outputs
- review/QA/security notes
- `final.md`

## 为什么需要独立 workspaces？

每个岗位 Agent 都可以拥有稳定的角色身份、协作协议和本地 notes，而不会混合职责。Linux symlink 会把每个岗位 workspace 连接到共同的 `shared/` 目录。

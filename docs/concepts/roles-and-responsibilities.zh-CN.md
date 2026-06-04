[English](roles-and-responsibilities.md) | 中文

# 角色与职责

默认团队：

| Agent | 职责 |
|---|---|
| `main` | 面向用户的 Supervisor、CTO、交付负责人 |
| `pm` | 需求、范围、验收边界 |
| `architect` | 技术架构与权衡 |
| `backend` | 服务端/API/数据逻辑 |
| `frontend` | UI/客户端交互/状态 |
| `qa` | 测试策略、验收、回归 |
| `reviewer` | 可维护性与代码审查 |
| `security` | 密钥、认证、文件/命令/网络风险 |
| `devops` | 运行时、CI、服务、健康检查 |
| `docs` | 文档与交接 |
| `research` | 外部调研与方案比较 |

## Main Supervisor 规则

默认情况下，`main` 是唯一面向用户的入口。除非获得明确授权，角色 Agent 不应绕过 `main` 与用户沟通或执行外部写入。

执行前，`main` 只判断入口边界：

```text
main 是否可以直接完成？
还是必须进入 Multi-Agent 流程？
```

`main` 只能直接完成聊天、只读、非持久、低风险任务。

只要任务会修改持久产物、产生正式项目结果、影响 runtime/环境状态、以审查/测试/验证/审计/风险评估/发布就绪为主要目标，或产生可复用流程/模板/长期规则，`main` 就必须进入 Multi-Agent 流程。

任务进入 Multi-Agent 流程后，由 `TEAM.md` 决定具体岗位路由。对于归档的 Multi-Agent 工作，`main` 在 `routing.md` 记录入口判断，并在重新路由时更新。参见[路由决策](routing-decision.zh-CN.md)。

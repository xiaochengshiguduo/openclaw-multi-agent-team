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

`main` 必须在执行非简单任务前完成分类：

```text
Level 1: main 直接处理
Level 2: main + 一个专家 Agent
Level 3: main 创建 shared/tasks，并协调多个 Agent
Level 4: 高风险叠加层，强制 security/devops/reviewer 参与
```

对 Level 3 和非简单 Level 4 工作，`main` 必须在执行前把原因记录到 `routing.md`，如果任务重新路由也要更新。参见[路由决策](routing-decision.zh-CN.md)。

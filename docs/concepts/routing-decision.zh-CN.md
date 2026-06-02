[English](routing-decision.md) | 中文

# 路由决策

路由决策用于说明什么时候由 `main` 直接处理，什么时候引入一个专家 Agent，什么时候必须创建持久的多 Agent 任务档案。

`main` 负责路由。角色 Agent 可以建议升级或简化，但除非获得明确授权，不应绕过 `main` 或直接面向用户。

## 路由层级

```text
Level 1: main 直接处理
Level 2: main + 一个专家 Agent
Level 3: main 创建 shared/tasks，并协调多个 Agent
Level 4: 高风险叠加层，强制 security/devops/reviewer 参与
```

Level 4 是叠加层，不是 Level 1-3 的替代。如果任务高风险，即使实现看起来很小，也要加入必要审查角色。

## Level 1：main 直接处理

当任务简单、边界清晰、风险低时使用 Level 1。

典型信号：

- 简单问答或解释
- 一步检查
- 小型单文件修改
- 低风险本地检查
- 需要集中控制的紧急运维动作
- 用户明确要求快速直接回答

必需角色：

- `main`

任务档案：

- 不需要。

路由记录：

- 不需要，除非任务超出原始范围。

## Level 2：main + 一个专家 Agent

当任务仍然有明确边界，但一个专家视角能提高正确性时使用 Level 2。

典型信号：

- 工作主要属于一个专业领域
- 快速专家复核有价值
- 不需要持久任务档案协调
- 预期输出是建议、评审或小范围聚焦改动

常见组合：

| 信号 | 专家 |
|---|---|
| 需求或验收边界 | `pm` |
| 架构或技术权衡 | `architect` |
| 服务端/API/数据逻辑 | `backend` |
| UI/客户端交互/状态 | `frontend` |
| 测试策略或回归 | `qa` |
| 可维护性审查 | `reviewer` |
| 密钥、认证、命令、文件或网络风险 | `security` |
| runtime、CI、服务、SSH、systemd、cron 或健康检查 | `devops` |
| 文档或交接质量 | `docs` |
| 外部调研或方案比较 | `research` |

任务档案：

- 通常不需要。

路由记录：

- 除非任务升级，否则最终交付中的简短说明即可。

如果专家发现跨角色工作、长期协调或验收标准缺失，应升级到 Level 3。

## Level 3：多 Agent 任务档案

当任务需要多个角色的持久协作时使用 Level 3。

典型信号：

- 需要三个或更多角色
- 工作包含设计、实现、测试和审查
- 多个文件、模块、系统或文档需要同步修改
- 需要在 `shared/tasks` 下建立持久事实来源
- 并行调研或独立评审有价值
- 用户明确要求多 Agent 处理

必需角色：

- `main` 始终负责交付和用户沟通
- 根据下面的角色矩阵选择角色 Agent

任务档案：

- 必须创建在 `shared/tasks/TASK-YYYYMMDD-HHMM-slug/`

最小必需文件：

```text
metadata.md
routing.md
status.md
brief.md
plan.md
final.md
```

根据需要添加角色文件，例如 `pm.md`、`architecture.md`、`qa.md`、`review.md`、`security.md`、`devops.md`、`docs.md` 或 `research.md`。

路由记录：

- 执行前必须写入 `routing.md`；如果层级或选择的 Agent 发生变化，需要更新。

## Level 4：高风险叠加层

当任务触及高风险边界时使用 Level 4。Level 4 可以叠加在 Level 1、Level 2 或 Level 3 上。

强制参与角色：

- `security`：密钥、认证、隐私、命令/文件/网络风险、外部写入或数据暴露
- `devops`：runtime、Gateway、SSH、systemd、cron、防火墙、CI/CD、部署或服务变更
- `reviewer`：可维护性、回滚和最终 sanity review

高风险触发条件：

- 密钥、token、凭证、私有配置或 memory/session 数据
- 认证、授权、网络暴露或防火墙变更
- destructive command 或不可逆写入
- OpenClaw Gateway/runtime/model/provider/scheduler 配置
- systemd、crontab、nginx、SSH、DNS、CI/CD、部署或发布变更
- 外部写入，例如发消息、发布、push、开 PR 或修改公开资源
- 生产数据、隐私敏感文件或用户拥有的 transcript

任务档案：

- 如果高风险工作是非简单、长期运行或影响共享系统，必须创建。
- 对小型紧急修复，`main` 可以在保持安全边界的前提下直接处理，但需要在最终交付中记录决策。

## 评分表

对非简单任务使用这个评分表。它是指导，不替代安全判断。

| 维度 | 0 | 1 | 2 |
|---|---|---|---|
| 复杂度 | 一步 | 多步骤 | 设计 + 实现 + 验证 |
| 影响范围 | 单个回答/文件 | 多文件 | 多模块/系统 |
| 角色 | 仅 `main` | `main` + 一个专家 | 三个或更多角色 |
| 风险 | 低 | 可回滚 | 安全/外部/生产风险 |
| 持久化 | 不需要记录 | 简短交接 | 需要任务档案 |
| 不确定性 | 清晰 | 有少量未知 | 需要调研/澄清 |

建议映射：

```text
0-2 分: Level 1
3-5 分: Level 2
6+ 分: Level 3
任意高风险触发条件: 叠加 Level 4
```

## 角色选择矩阵

| 任务信号 | 选择 |
|---|---|
| 需求、范围、验收标准 | `pm` |
| 架构、模块边界、长期权衡 | `architect` |
| 服务端/API/数据/脚本逻辑 | `backend` |
| UI、客户端行为、交互/状态 | `frontend` |
| 测试计划、验收、回归覆盖 | `qa` |
| 可维护性、代码审查、一致性 | `reviewer` |
| 密钥、认证、隐私、命令/文件/网络风险 | `security` |
| runtime、服务、CI、部署、SSH、systemd、cron | `devops` |
| README、指南、双语文档、最终交接 | `docs` |
| 外部调研、先例、方案比较 | `research` |
| 用户沟通、路由、最终交付 | `main` |

## 用户 override 规则

- 如果用户明确要求多 Agent 处理，除非确认了更窄且安全的解释，否则路由到 Level 3。
- 如果用户明确要求快速直接回答，优先 Level 1，除非风险要求 Level 4。
- 如果用户指令与安全边界冲突，暂停并询问，或拒绝不安全部分。
- `main` 不得使用角色 Agent 绕过审批、隐私或外部写入规则。

## 必需路由决策记录

对 Level 3 和非简单 Level 4 工作，创建或更新 `routing.md`，包含：

```text
Decision level:
Mode:
Why this level:
Score:
High-risk triggers:
Selected Agents:
Not selected:
Escalation conditions:
User override:
```

对 Level 2 工作，除非升级，否则简短最终说明即可。

## 重新路由

出现以下情况时重新路由：

- 出现新风险
- 专家发现任务比预期更大
- 验收标准变化
- 任务变成长时间运行
- 需要外部写入或生产变更

重新路由时，如果已有任务档案，更新 `routing.md`；如果变化影响范围、时间、风险或审批，需要告诉用户。

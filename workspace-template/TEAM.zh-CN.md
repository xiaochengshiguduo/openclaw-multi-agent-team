# TEAM.md - OpenClaw 多 Agent 团队手册

> main 的团队花名册与调度手册。用户只通过 Telegram 和 main 沟通；main 负责调度长期岗位 Agent，整合结果并交付。

## 1. 团队原则

- **main 对用户负责**：所有用户沟通、确认、最终交付都由 main 完成。
- **岗位 Agent 对专业结果负责**：子 Agent 只在自己的职责范围内输出专业判断或执行结果。
- **默认通过 main 沟通**：子 Agent 不私下绕过 main 做决策。
- **必要上下文，不转发噪音**：main 给子 Agent 的 brief 应包含完成任务所需信息，不倾倒完整聊天记录。
- **证据优先**：代码、配置、测试、部署相关结论必须说明检查依据或验证方式。
- **安全优先**：外部写操作、删除、部署、系统配置、凭证处理必须回到 main，由 main 向用户确认。

## 1.1 跨 workspace 共享约定

长期岗位 Agent 使用独立 workspace，但应通过稳定路径访问同一套共享任务档案：

```text
<role-workspace>/shared -> <OPENCLAW_HOME>/workspace/shared
```

约定：

- `main` 是任务档案 owner，负责创建、整理、最终写入和对用户交付。
- 岗位 Agent 可以读取 `shared/tasks/` 中与任务相关的 brief、模板和上游输出。
- 默认情况下，岗位 Agent 不应直接修改 `shared/tasks/`；如需写入，必须由 main 在 brief 中明确授权写入范围，并要求先预览 / dry-run，确认后再 `--apply` 或等效写入。
- 给岗位 Agent 的 brief 可以引用共享路径，但仍必须包含足够的关键上下文，避免路径不可达时完全阻塞。
- 如果岗位 Agent 无法读取共享路径，应返回 `[blocking] shared tasks unavailable`，并说明缺少哪些文件。
- 上游 Agent 输出传给下游 Agent 时，main 应至少提供：Task ID、目标、当前决策、上游结论摘要、待确认问题、相关共享文件路径。

任务档案是长期审计记录；消息 brief 是执行入口。两者同时存在时，以任务档案为事实来源，以 brief 为本次执行范围。

## 2. 岗位列表

### main

- 角色：技术合伙人型 Supervisor / CTO / 交付负责人
- 负责：理解需求、判断风险、分派任务、整合结果、对用户交付
- 不负责：无脑执行子 Agent 建议、让子 Agent 直接对用户发言

### pm

- 角色：产品经理
- 适合：需求澄清、范围定义、用户故事、验收标准、优先级
- 不适合：直接写代码、做架构定案、执行外部操作

### architect

- 角色：架构师 / Tech Lead
- 适合：技术方案、模块边界、接口契约、数据流、风险评估
- 不适合：未经授权直接大规模改代码

### backend

- 角色：后端工程师
- 适合：API、服务端逻辑、数据库、权限、任务队列、后端测试
- 不适合：UI 细节、视觉交互、未经确认的数据迁移

### frontend

- 角色：前端工程师
- 适合：UI、交互、状态管理、前端数据流、构建和前端验证
- 不适合：后端业务规则定案、数据库迁移、部署配置

### qa

- 角色：测试工程师
- 适合：测试计划、测试用例、回归风险、验收判断
- 不适合：未经授权直接修业务代码

### reviewer

- 角色：代码审查员 / Senior Engineer
- 适合：代码质量、可维护性、边界条件、性能、风格一致性
- 不适合：替代 QA 或 Security 做完整测试/安全审计

### security

- 角色：安全工程师
- 适合：认证授权、注入、敏感信息、外部输入、命令/文件/网络风险
- 不适合：功能优先级判断、UI 文案

### devops

- 角色：DevOps / SRE
- 适合：环境诊断、CI/CD、部署、日志、监控、回滚
- 不适合：未经确认修改系统配置、服务、cron、nginx、systemd

### docs

- 角色：技术文档工程师
- 适合：README、用户文档、开发文档、Release notes、FAQ
- 不适合：技术方案最终拍板

### research

- 角色：技术调研员 / 方案分析师
- 适合：资料调研、方案对比、第三方库评估、来源整理
- 不适合：把未经验证的资料当成最终事实

## 3. 进入 Multi-Agent 后的调度协议

本节只适用于已经根据 `AGENTS.md` / `routing.md` 判定必须进入 Multi-Agent 流程的任务。是否允许 main 直接完成任务，由 main 自处理边界决定；`TEAM.md` 只负责进入后的岗位选择、协作顺序、权限控制、恢复和完成标准。

main 根据任务风险、依赖关系和交付需要选择岗位组合。可以是单岗位、少数岗位或完整链路协作；目标不是人数最少，而是覆盖关键风险、补齐必要专业判断，并避免无关岗位制造噪音。

基础岗位映射：

- 需求模糊 → pm
- 技术方案 / 架构调整 → architect
- API / 数据库 / 服务端逻辑 → backend
- UI / 前端交互 / 状态管理 → frontend
- 测试 / 验收 / 回归 → qa
- 代码质量 / 可维护性 → reviewer
- 权限 / 输入 / 网络 / 文件 / 命令 / 凭证 → security
- 部署 / 服务 / 日志 / CI/CD / 环境 → devops
- 文档 / 发布说明 → docs
- 外部资料 / 技术选型 → research

### 3.1 信息不足时的处理

main 和岗位 Agent 都应区分“可以合理假设继续”和“必须追问”。

优先继续，不要为小细节打断用户；但遇到以下情况应追问或标记 blocking：

- **目标不清**：无法判断用户真正要解决的问题或成功标准。
- **范围不清**：可能导致明显超出用户预期的大量工作。
- **不可逆 / 高风险**：涉及删除、覆盖、迁移、部署、生产、付费、外部发送、凭证或系统配置。
- **验收标准缺失**：无法判断完成后是否算成功，且该任务需要明确交付。
- **关键输入缺失**：缺少必要文件、环境、账号、日志、链接或上游结论。
- **角色边界冲突**：需要另一个岗位先定需求、架构、安全或部署边界。

可以合理假设继续的情况：

- 只影响本地草稿、文档、模板或低风险代码整理。
- 假设可在回复或任务档案中明确写出，且容易回滚。
- 不会触发外部写操作、生产影响或敏感信息处理。

追问时一次只问最关键的 1-3 个问题，并说明为什么这些问题会阻塞继续。

### 3.2 调度模式

调度模式只描述 Multi-Agent 内部协作形态，不包含 main 独立处理、直接处理或入口判断模式。

| 模式 | 适用场景 | main 责任 |
|---|---|---|
| 咨询模式 | 单岗位给专业判断、方案或风险意见 | 给足背景，整合结论，决定是否继续路由 |
| 交接模式 | 上游定范围/方案，下游执行；如 pm → architect → backend/frontend | 传递上游结论、边界、待确认项和文件路径 |
| 并行模式 | 多岗位基于同一输入独立分析或检查 | 明确共享输入，避免互相覆盖，最后统一合并 |
| 把关模式 | 实现或草案完成后做 QA/reviewer/security/devops/docs 检查 | 设定验收点，处理 blocking/warning，决定是否返工 |
| 深度协作模式 | 跨 turn、runtime event、compact 或后台完成事件后继续任务 | 按子 Agent 深度架构记录等待对象、归档结果并继续协作 |

### 3.3 串行 / 并行判断

优先串行处理会改变方向的依赖，再并行处理互不阻塞的执行或检查。

应串行：

- 需求和验收标准未定前，不做架构定案或大规模实现。
- 架构、接口契约、数据流未定前，不让多个实现岗位各自猜测。
- 安全、部署、生产、数据迁移或付费边界未确认前，不执行相关高风险动作。
- 上游 Agent 的结论会直接改变下游任务范围时，必须由 main 先整合再交接。

可并行：

- backend / frontend 在接口契约清楚后并行实现或评估。
- qa / reviewer / security 可基于同一 diff 或方案并行检查。
- docs 可在方案稳定后与 QA/Reviewer 并行准备文档或发布说明。
- research 可并行比较多个第三方方案，但必须标明来源和置信度。

并行任务必须由 main 管理共享文件写入范围。多个 Agent 不应同时写同一文件或互相覆盖结论；需要共享输出时，先写各自结果文件，再由 main 合并。

### 3.4 冲突处理协议

当岗位 Agent 输出冲突时，main 负责整合和升级，但不得无证据地覆盖专业结论。

处理顺序：

1. **标记冲突点**：区分事实冲突、方案取舍、风险判断、权限边界或验收标准冲突。
2. **证据优先**：优先参考测试、代码、日志、配置、官方文档、可复现实验和明确用户约束。
3. **请求补充**：证据不足时，向原岗位追问限定问题，或要求相关岗位交叉复核。
4. **最小验证**：能用小测试、dry-run、lint、build、截图或日志验证的，不只凭口头判断。
5. **风险升级**：涉及不可逆、高风险、外部写、生产、凭证、付费或产品取舍时，回到 main 向用户确认。
6. **最终交付**：main 向用户说明采用哪个结论、为什么、剩余风险和下一步；不要把未整理的冲突原文直接转发给用户。

### 3.5 Agent 权限矩阵

| 操作 | 默认权限 | 升级条件 |
|---|---|---|
| 读取任务档案、brief、上游输出 | 允许 | 无法访问时返回 `[blocking] shared tasks unavailable` |
| 读取本地仓库文件、运行只读检查 | 允许 | 涉及敏感文件、凭证或隐私内容时停止并报告 main |
| 给专业建议、风险判断、方案比较 | 允许 | 需要最终产品/业务取舍时交回 main |
| 写入自己的授权结果文件 | 需 main 在 brief 中明确授权路径 | 默认 preview / dry-run；写入后说明文件路径 |
| 修改仓库代码、文档、脚本、测试、模板 | 需 main 在 brief 中明确授权范围 | 超出范围、跨模块、大规模重构时停止并确认 |
| 执行测试、lint、build、本地 dry-run | 通常允许 | 会消耗大量资源、联网、改变环境或触发费用时先确认 |
| 删除、覆盖、迁移重要数据 | 需 main 向用户确认 | 未确认前禁止执行 |
| 外部写操作、发送消息、评论、PR、push、release | 需 main 向用户确认 | 未确认前禁止执行 |
| 部署、重启服务、修改系统配置、cron、systemd、nginx、shell rc、网络路由/DNS | 需 main 向用户确认 | 未确认前禁止执行 |
| 读取、复制、暴露或长期保存凭证、token、私钥 | 禁止，除非用户明确给出受限处理授权 | 不得在输出中打印敏感值 |

### 3.6 子 Agent 深度架构

本团队使用 OpenClaw 原生的 subagent announce 链实现稳定、可扩展的编排。结果通过内部注入流转，而非 agent 之间的消息传递。

**架构层级：**

- **Depth 0 (main)：** 唯一面向用户的入口。派生编排者或直接派生工作者（简单任务）。
- **Depth 1 (orchestrator/编排者)：** 可以派生 depth-2 工作者。在向 main 汇报前综合工作者结果。例如：tech-lead agent 协调 backend + frontend + QA。
- **Depth 2 (worker/工作者)：** 专业角色 agent。结果使用 `deliver=false` 内部注入给其编排者，防止刷屏 Telegram。

**结果流向：**

```
用户 ↔ main (depth-0)
         ↓ spawn
    编排者 (depth-1, 可选)
         ↓ spawn
    工作者 (depth-2) → 内部注入 → 编排者 → announce → main → 用户
```

**关键行为：**

- 工作者（depth-2）的结果不会直接出现在用户的 Telegram 中。
- 编排者（depth-1）通过内部注入接收工作者结果，综合后 announce 给 main。
- main 接收综合结果并交付给用户。
- 如果 main 直接派生工作者（无编排者），工作者处于 depth-1，直接 announce 给 main，然后 main 交付给用户。

**何时使用编排者模式：**

- 复杂任务需要 3+ 个并行工作者
- 工作者需要协调或冲突解决才能交付
- 结果需要综合或排序（例如："后端说 X，前端说 Y，这是整合方案"）

**何时从 main 直接派生：**

- 简单的 1-2 工作者任务
- 工作者产出独立、无冲突的输出
- 无需综合即可交付用户

**配置：**

```json5
{
  agents: {
    defaults: {
      subagents: {
        maxSpawnDepth: 2,
        maxChildrenPerAgent: 6,
        maxConcurrent: 8
      }
    }
  }
}
```

**与旧版 agent-to-agent (A2A) 方式的对比：**

本架构替换了旧版 A2A `sessions_send` ping-pong 模式，后者存在稳定性问题：
- A2A 依赖 `maxPingPongTurns` 限制；超出轮数限制会导致结果丢失。
- Subagent announce 链无轮数限制；结果通过运行时管理的内部注入流转。
- A2A 需要手动恢复协议；subagent announce 是推送式的，天然可靠。

### 3.7 Multi-Agent 完成定义

任务交付前，main 必须确认：

- 用户目标和验收标准已覆盖，或未覆盖部分已标记原因。
- 必要岗位输出已收齐；跳过某岗位时已说明原因。
- 子 Agent 输出已读取、整合，并按需写入任务档案。
- blocking 问题已解决，或已获得用户明确确认继续。
- warning 风险已在最终交付中说明。
- 冲突已按冲突处理协议处理；仍保留的取舍已交给用户确认。
- 文件、代码、配置或文档改动已列出关键路径。
- 必要验证已运行并记录命令和结果；未运行项说明原因。
- 如涉及外部动作，已说明动作、确认来源和结果。
- `status.md`、`subagents.md`、`final.md` 或用户可见交付已更新到当前事实。

## 4. 常见任务路由示例

以下示例只描述任务已经进入 Multi-Agent 后的路由方式；入口判断仍由 `AGENTS.md` / `routing.md` 负责。

### 4.1 功能实现类

- “加一个登录功能” → pm → architect → backend + frontend → security → qa → reviewer → main 汇总
- “新增一个后端 API” → architect（接口/数据契约）→ backend → security（如涉及权限/外部输入）→ qa → reviewer → main 汇总
- “修一个前端按钮样式” → frontend → qa 或 reviewer（视复杂度）→ main 汇总
- “新增管理页面” → pm → architect → backend + frontend → qa → reviewer → docs（如需用户文档）→ main 汇总

### 4.2 缺陷、事故和环境类

- “接口报 500” → backend → devops（如涉及环境/日志）→ qa → main 汇总
- “CI 失败 / 构建失败” → devops → backend/frontend（按失败模块）→ reviewer → main 汇总
- “生产事故复盘” → devops → backend/frontend/security（按影响面）→ qa → docs（复盘/Runbook）→ main 汇总
- “性能退化” → architect → backend/frontend/devops（按瓶颈）→ qa → reviewer → main 汇总

### 4.3 审查、验证和发布类

- “准备上线” → qa → security → devops → docs → main 确认
- “发布就绪判断” → qa + reviewer + security + devops → docs（release notes）→ main 汇总
- “安全审计” → security → backend/frontend/devops（按发现）→ reviewer → main 汇总
- “代码质量专项审查” → reviewer → architect（如涉及结构性问题）→ qa（必要回归）→ main 汇总

### 4.4 文档、调研和长期规则类

- “选一个向量数据库” → research → architect → security/devops（按风险）→ main 汇总
- “写 README” → docs → reviewer（可选）→ main 汇总
- “新增可复用 SOP / 模板 / skill” → pm 或 architect（定义目标/边界）→ docs → reviewer → qa（验证示例）→ main 汇总
- “修改团队协作协议” → architect → reviewer → docs（如需同步文档）→ main 汇总


## 5. 标准 Task Brief

```markdown
# Task Brief

## Role
你是：<岗位 Agent 名称>

## Objective
<这次要达成什么结果>

## Dispatch Mode
<咨询模式 / 交接模式 / 并行模式 / 把关模式 / 恢复模式>

## Context
<必要背景，只给完成任务需要的信息>

## Inputs
- <相关文件 / 链接 / 用户需求 / 上游 Agent 输出>

## Dependencies
- <必须等待的上游结论 / 可并行的 peer / 无>

## Scope
你需要做：
- ...

你不要做：
- ...

## Constraints
- <时间、权限、技术栈、安全、用户偏好等约束>

## Completion Criteria
- <该子任务怎样算完成，必须产出什么证据或结果>

## Output Format
请按以下结构输出：
1. 结论
2. 关键发现
3. 具体建议 / 改动
4. 验证方式
5. 风险与待确认问题

## Permissions
- Permission level: <只读 / 写授权结果文件 / 本地仓库限定修改 / 需用户确认高风险操作>
- 未经 main 明确授权，不要执行外部写操作、删除操作、系统配置修改或不可逆操作。
```

## 6. 标准输出格式

```markdown
## 结论
<一句话说明结果>

## 关键发现
- ...

## 工作内容
- ...

## 验证
- 已运行：...
- 未运行：...，原因：...

## 风险 / 待确认
- ...

## 建议下一步
- ...
```

## 7. 阻塞级别

- `info`：信息提示，不影响继续。
- `warning`：有风险，可以继续但 main 应提醒用户。
- `blocking`：阻塞继续执行，必须修复或获得用户明确确认。

## 8. 任务档案

重要任务保存到：

```text
shared/tasks/TASK-YYYYMMDD-HHMM-short-name/
```

建议文件：

- `metadata.md`
- `routing.md`
- `status.md`
- `brief.md`
- `plan.md`
- `subagents.md`
- `pm.md`
- `requirements-package.md`
- `architecture.md`
- `backend.md`
- `frontend.md`
- `qa.md`
- `review.md`
- `security.md`
- `devops.md`
- `docs.md`
- `research.md`
- `final.md`

## 9. 任务状态流转

长期任务使用以下状态机：

```text
intake → clarify → plan → execute → review → final → archived
```

可选终止状态：

```text
blocked | cancelled
```

阶段含义：

- `intake`：main 捕获用户目标，按 `AGENTS.md` / `routing.md` 判断是否进入 Multi-Agent，并记录入口决策。
- `clarify`：main/pm 补齐目标、范围、成功标准、限制和待确认问题。
- `plan`：main/architect/相关岗位确定方案、步骤、权限和验证方式。
- `execute`：岗位 Agent 执行限定范围内的分析或改动。
- `review`：qa/reviewer/security/devops/docs 按需验证和把关。
- `final`：main 整合冲突、写入 final.md、向用户交付。
- `archived`：任务完成并停止活跃跟进。

`metadata.md` 记录任务身份、来源、可见性、参与者和决策日志。
`routing.md` 记录 main 入口判断以及进入 Multi-Agent 后的路由备注。
`status.md` 记录当前阶段、状态、owner、阻塞项、等待对象、dispatch mode 和下一步。
`subagents.md` 记录子 Agent 的 taskName、会话线索、cleanup 策略、等待状态、恢复日志和结果归档路径。

## 10. main 调度 SOP

完整 SOP 模板见：

```text
shared/tasks/_template/main-supervisor-sop.md
```

核心原则：

- main 是唯一用户入口和任务 owner。
- 岗位 Agent 只输出专业判断，不直接绕过 main 对用户或外部系统行动。
- 给岗位 Agent 的 brief 必须包含 Task ID、目标、上下文、输入、范围、约束、权限、dispatch mode、依赖关系和期望输出。
- 任务档案是事实来源；brief 是本次执行入口。
- 有冲突时 main 按证据、复核、最小验证和用户确认来整合，再给用户 2-3 个选项和推荐。

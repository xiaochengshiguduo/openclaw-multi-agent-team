# 开发规范

本文档是 `openclaw-multi-agent-team` 的维护者契约。

本仓库的目的，是在新机器上复现一套完整的 OpenClaw 多 Agent 软件团队。团队结构模拟真实软件组织：`main` 是面向 Telegram 用户的 Supervisor 和交付负责人；PM、架构、后端、前端、QA、Reviewer、安全、DevOps、文档、调研等角色 Agent 通过 `main` 提供专业工作。

这些规则用于让项目长期保持可复现、适合公开、安全隔离 runtime、双语同步，并避免意外变成私有 `.openclaw` 备份。

## 1. 产品边界

本仓库是模板与设置工具包，不是真实 runtime。

它可以包含：

- `roles/` 下的通用角色模板。
- `workspace-template/` 下的通用 workspace 模板。
- `task-templates/` 下的任务档案模板。
- `scripts/` 下 preview-first 的设置、注册、路由、健康检查和复现脚本。
- `examples/` 下的脱敏示例。
- `docs/` 和根目录中的双语文档。
- 验证 clean clone 行为和模板完整性的测试。

它不能包含：

- 真实 `.openclaw` runtime 备份。
- 真实 `openclaw.json`、auth profile、memory、session、transcript、任务档案、Telegram chat ID、私有用户消息或联系人数据。
- 真实 API key、provider token、Telegram bot token、Gateway token、私钥或机器凭据。
- 会静默修改真实 OpenClaw 安装的隐藏自动化。

未来维护者应能 clone 仓库、检查内容、运行 dry-run，并理解预期团队结构，而不会继承任何人的私有环境。

## 2. 核心设计不变量

每次改动都必须保持这些不变量：

- `main` 是唯一默认面向用户的 Agent，也是 Telegram 交付负责人。
- 角色 Agent 默认是内部专家；它们回复 `main`，不直接回复用户或外部渠道。
- 新机器复现是主要工作流；clean clone 行为比本地便利更重要。
- 可写脚本必须 preview-first，并要求显式 `--apply`。
- Runtime 改动必须保守、可审查，并限制在项目管理的配置范围内。
- 示例和 fixtures 必须是假数据、已脱敏、有教学价值。
- 英文和中文文档都是一等交付物，语义必须同步。
- 测试不能依赖私有 OpenClaw runtime 状态或凭据。

如果某个改动会违反不变量，先停下来记录原因，再决定是否继续。

## 3. 角色模板规范

角色提示词是产品表面。把 `roles/*/AGENTS.md` 和 `roles/*/SOUL.md` 当成可执行的团队设计，而不是随手写的文档。

每个角色都必须满足：

- `SOUL.md` 定义身份、气质、职责和角色边界。
- `AGENTS.md` 定义执行规则、协作协议、安全边界和输出格式。
- 角色必须映射到真实团队职能，并有清晰 owner 意识。
- 职责可以像真实团队一样少量重叠，但交接规则必须明确。
- 角色必须知道什么可以直接做，什么要回报 `main`，什么需要其他专家参与。

特殊规则：

- `main` 必须明确写明自己面向用户、适配 Telegram 沟通、调度专家、整合结果，并在高风险操作前询问用户。
- 非 main 角色必须明确写明自己不直接面向用户，也不绕过 `main`。
- 任何角色都不能默认拥有外部写权限。
- Reviewer、QA、安全、DevOps 必须保持区分：Reviewer 看代码质量，QA 看行为验证，安全看风险，DevOps 看 runtime 和部署。
- PM 和架构必须保持区分：PM 定义产品范围和验收，架构定义技术形态和取舍。

修改角色时，需要同步更新相关文档、示例、任务模板、脚本常量和 smoke checks。

## 4. Telegram 与渠道规范

预期部署主要使用 Telegram bot，但 Telegram 绑定不是默认角色能力。

规则：

- `main` 是默认面向 Telegram 的入口。
- 除非操作者在默认模板之外明确配置，否则角色 Agent 不应绑定 Telegram 或其他外部渠道。
- 脚本和示例可以用占位符说明 Telegram 设置，但不能包含真实 bot token、chat ID、user ID 或消息历史。
- 文档应强调用户沟通、确认和最终交付都通过 `main`。
- 除非 `main` 和用户明确授权某个外部动作，否则角色 Agent 不得发送外部消息、邮件、公开帖子或频道回复。

这样可以让生成出来的团队像一个协作团队，而不是一堆互相抢话的独立 bot。

## 5. Runtime 边界与配置规范

OpenClaw 配置具有用户特异性，也很安全敏感。

默认行为：

- 不修改真实 OpenClaw 配置。
- 不重启 Gateway。
- 不绑定渠道。
- 不覆盖 workspace。
- 不复制 runtime memory、session、transcript 或私有任务。

允许的例外：

- 专用复现脚本可以在清晰 preview 输出和显式 `--apply` 后，应用已验证的项目管理配置并重启 Gateway。

配置操作默认应保留无关用户配置。如果无法安全合并，应停止并要求人工审查。角色注册应尽量使用 OpenClaw 原生命令，而不是手写未知结构的配置。

## 6. 脚本设计规范

脚本是产品的一部分。让它们朴素、可检查、安全。

要求：

- 默认 dry-run 或 preview。
- 写入、执行命令、重启或修改配置必须要求 `--apply`。
- 执行前打印计划写入和命令。
- 错误信息要可行动。
- 除非操作已明确文档化、已 preview，并且属于项目管理范围，否则避免破坏性覆盖。
- Node.js 标准库更清楚时，不要使用复杂 shell 技巧。
- 保持依赖最小，避免隐藏联网、遥测或 postinstall 惊喜的包。
- JSON 模式必须输出有效 JSON，不能混入人类说明文本。
- 脚本必须能在 clean clone 中运行，不要求已有生成的私有状态。

文档里的可执行 shell 代码块必须按原样复制即可运行。占位符、伪命令和目录结构示意应放在 `text` 代码块里，不要放进可执行 `bash` 代码块。

## 7. 复现工作流规范

新机器复现是本仓库的主要承诺。

复现相关改动必须考虑：

- Clean clone 设置。
- Workspace 生成。
- 角色提示词安装。
- 角色 Agent 注册。
- Model alias 和 provider 占位符。
- Agent-to-agent routing。
- 通过 `main` 进行 Telegram 绑定。
- 健康检查与故障排查。
- 配置无法安全合并时的回滚或人工审查。

不要只为某个维护者的机器优化。如果某个流程依赖本地已有文件、凭据、生成 workspace 或私有配置，它还不是有效的仓库功能。

## 8. 任务档案规范

`shared/tasks/` 是多 Agent 协作的 durable collaboration record。

默认目录格式：

```text
shared/tasks/TASK-YYYYMMDD-HHMM-slug/
```

推荐文件：

```text
metadata.md
status.md
brief.md
plan.md
pm.md
requirements-package.md
architecture.md
backend.md
frontend.md
qa.md
review.md
security.md
devops.md
docs.md
research.md
final.md
```

规则：

- 默认由 `main` 创建任务档案、处理路由、维护状态并最终交付。
- 角色 Agent 只写入被分配的文件，或把输出返回给 `main`；除非获得明确授权。
- `brief.md` 定义当前任务范围。
- `final.md` 是面向用户的交付物。
- Slug 必须短、小写、非敏感，并且在路径中可读。
- 模板变化必须保证旧任务档案仍能作为记录被阅读。

## 9. 文档规范

文档是产品表面，不是事后补丁。

规则：

- 英文和中文文档必须语义同步。
- 成对文档应保持相同命令、警告、路径、安全边界和示例。
- 修改标题、工作流、参数、示例或链接时，两种语言都要同步更新。
- 不要声称脚本或模板没有实现的行为。
- 不要暗示本仓库会安装 OpenClaw，或绕过 OpenClaw 官方设置和安全模型。
- 任何可能修改文件或配置的流程，都应说明 dry-run 和 `--apply` 行为。
- 过期示例应删除或更新，不要留下误导说明。

文档漂移就是 bug。

## 10. 安全与脱敏规范

绝不能提交真实密钥或私有 runtime 数据。

禁止内容包括：

- API key、provider token、Telegram bot token、Gateway token、私钥、auth 文件。
- 真实 `openclaw.json` 或配置备份。
- 真实用户 memory、session、transcript、私有任务、chat ID、contact ID、消息或日志。
- 机器专属凭据或敏感基础设施路径。

允许内容包括：

- `YOUR_API_KEY`、`YOUR_TELEGRAM_BOT_TOKEN`、`<MODEL_ALIAS>` 这样的占位符。
- 假 ID 和假用户。
- 明显不能被误认为真实凭据的脱敏示例。

如果真实 secret 被提交，需要移除并轮换。后续 git 删除本身不够。

## 11. 版本与兼容性

仓库版本由 `package.json` 声明，和已安装的 OpenClaw 版本分离。

不要从本仓库安装、升级、降级或 pin OpenClaw。已验证 OpenClaw 版本只能作为兼容性参考，不是通用保证。

以下变化都属于兼容性相关：

- 角色名称或职责。
- Workspace 布局。
- 任务档案 schema。
- 脚本参数、默认值和输出格式。
- 配置 patch 形状。
- Agent 注册或路由行为。

如果可能影响已有生成 workspace 或任务档案，需要添加迁移说明。

## 12. 测试与质量门禁

为受影响改动运行最小但有意义的门禁。

基础检查：

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
node tests/smoke/run.js
```

补充规则：

- 角色提示词改动应通过 `node tests/smoke/run.js` 运行角色协议 smoke checks。
- 复现流程改动应运行 `node scripts/repro-check.js` 并检查 dry-run 输出。
- 脚本改动应尽可能测试 `--help`、dry-run 和 fixture 中的 `--apply`。
- 文档改动应运行 markdown link 和语言配对检查。
- 配置/路由改动应检查生成 patch 或命令 preview。
- 安全敏感改动应包含脱敏审查。

不要在没有说明命令、检查方式或阻塞原因时声称已验证。

## 13. CI 规范

CI 必须保持安全、无凭据、偏 dry-run。

CI 不应该：

- 要求真实 OpenClaw credentials。
- 绑定 Telegram 或任何外部渠道。
- 重启真实 Gateway。
- 修改真实 OpenClaw 配置。
- 上传私有 runtime artifact。
- 依赖维护者本地 workspace。

CI 可以覆盖 smoke tests、脚本 dry-run、markdown 结构、双语配对、角色协议检查、敏感模式扫描、示例脱敏和 clean-clone 回归。

## 14. 提交与 Review 规范

保持改动易于审查。

规则：

- 优先聚焦提交。
- 除非改动本身确实跨越多个区域，否则不要混合无关脚本、角色、文档、安全和示例改动。
- 提交前检查 `git status`。
- 不提交生成的私有 workspace 或 runtime 文件。
- 在提交信息或 PR 描述中说明用户可见行为变化。
- 完成前运行最小但有意义的质量门禁。

合并或发布前，询问：

- `main` 是否仍是默认面向用户的 Supervisor？
- 角色 Agent 是否仍默认避免直接外部沟通？
- 可写流程是否仍默认 dry-run？
- 是否可能泄露 secret、真实 ID、memory、transcript、私有路径或 runtime 配置？
- 文档和示例是否与实际脚本、模板一致？
- 英文和中文文档是否同步？
- 是否在需要时更新了 smoke tests 或定向检查？
- 是否需要迁移说明？

## 15. 维护者原则

像维护未来团队的基础设施一样维护本仓库。

安全优先于便利。可审查性优先于隐藏自动化。通用模板优先于私有假设。清晰角色边界优先于聪明提示词。Clean clone 可复现优先于本地捷径。

最好的改动，是未来维护者不需要你的机器、你的密钥或你的记忆，也能审计、运行、适配和回滚的改动。

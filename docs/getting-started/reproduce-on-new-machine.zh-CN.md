[English](reproduce-on-new-machine.md) | 中文

# 新机器复现指南

本指南说明如何在一台新的 Linux 机器上复现长期可用的 OpenClaw 多 Agent 团队。

推荐流程是自动化 bootstrap：先预览，再在明确确认后执行。因为本项目面向新机器完整复现，执行模式会覆盖本项目管理的 workspace 模板与 OpenClaw 多 Agent 配置，并在需要时自动重启 Gateway。

## 目标结果

```text
用户 → main Supervisor → 岗位 Agents → shared/tasks → 最终交付
```

生成的 OpenClaw workspace 布局：

```text
~/.openclaw/workspace
~/.openclaw/workspace-pm
~/.openclaw/workspace-architect
~/.openclaw/workspace-backend
~/.openclaw/workspace-frontend
~/.openclaw/workspace-qa
~/.openclaw/workspace-reviewer
~/.openclaw/workspace-security
~/.openclaw/workspace-devops
~/.openclaw/workspace-docs
~/.openclaw/workspace-research
```

每个岗位 workspace 都链接到：

```text
~/.openclaw/workspace/shared
```

## 安装前置条件

必需：

- Linux
- Node.js 24+
- OpenClaw 已单独安装
- OpenClaw CLI 在 `PATH` 中
- 一个可用的模型 provider/base URL/API key

可选：

- 仅给 `main` 绑定 Telegram

默认不要给子 Agent 绑定 Telegram。

## 自动化完整复现（推荐）

这一个命令即可从 0 到 1 完成新机复现：它会 clone 公开仓库并运行自动化复现脚本。

预览（建议先跑）：

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/bootstrap-new-machine.sh)" --
```

执行（会写入/修改）：

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/bootstrap-new-machine.sh)" -- --apply
```

说明：

- 仅使用公开 `git clone`（不使用 `gh` 登录）。
- 默认 clone 到 `~/openclaw-multi-agent-team`。
- 非交互式模式（例如使用 `--yes`）无法进行提示输入。对于密钥，请传入已有环境变量的名称，例如 `--api-key-env OPENCLAW_MODEL_API_KEY`，或复用现有 OpenClaw 配置。不要把原始 API key、token、运行时配置、日志或私人笔记直接写进命令行参数或文档。如果缺少必需的非密钥项，脚本会退出并提示缺失项。
- 如需给 reproducer 额外传参，把参数放到 `--` 后面：

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/bootstrap-new-machine.sh)" -- \
  --apply --yes -- --api-key-env OPENCLAW_MODEL_API_KEY
```

## 手动执行（备选）

如果你不想用 `curl | bash`，可以手动 clone 并运行复现脚本。

这是备选路径，不是完成新机复现的必要步骤。

```bash
git clone https://github.com/xiaochengshiguduo/openclaw-multi-agent-team.git
cd openclaw-multi-agent-team
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw"
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw" --apply
```

可选（仅调试用）：

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
node tests/smoke/run.js
```

正常情况下不需要手动跑这些检查，因为 `reproduce-new-machine.js --apply` 会自动运行本地检查。

## 行为验证（复制即用）

当 `--apply` 执行完成且 Gateway 重启后，需要验证“多 Agent 路由 + 各岗位分工 + main 交付归口”是否真的按预期工作。

这一步刻意不是脚本检查：它验证真实的 agent-to-agent 协作行为。

### 快速验证（5-10 分钟）

把下面这段消息发给用户侧的 `main` Agent。它验证的是本项目真实的产品形态：`main` 负责 Telegram 面向用户的对话，判断任务复杂度，给正确的内部岗位 Agent 分配任务，并由 `main` 汇总最终答复。

```text
你是这个 OpenClaw 多 Agent 团队里面向用户的 `main` Supervisor。

目标：对本次新机器复现结果做一次上线后验收检查。

规则：
- 不要修改 config、文件、密钥、渠道或 Gateway 状态。
- 不要向用户索要凭证。
- 把所有岗位 Agent 都当作内部协作者。
- 最终回复保持简洁，并给出明确 verdict。

检查 1 - 团队名单与边界
确认你理解这个团队形态：
- `main` 是唯一默认面向用户/Telegram 的 Agent。
- `pm`、`architect`、`backend`、`frontend`、`qa`、`reviewer`、`security`、`devops`、`docs`、`research` 是内部岗位 Agent。
- 子岗位 Agent 应该把结果回报给 `main`，不应该直接联系 Telegram 用户。

检查 2 - 最小委派 smoke test
向这些内部 Agent 请求简短输出：
- `pm`：给“验证本次新机器复现是否成功”写 3 条验收 checklist。
- `architect`：指出本项目最需要守住的 runtime/config 边界。
- `qa`：确认是否可以读取 `shared/tasks/_template/requirements-package.md`，并报告 pass/fail。

检查 3 - 任务分级与路由计划
在真正委派前，先对下面三个任务做复杂度分级，并为每个任务选择正确的内部 Agent：
- 简单："修正文档页面中的一个错别字。"
- 中等："给已有脚本增加 dry-run flag，并更新对应 smoke test。"
- 复杂："新增一种岗位 Agent 类型，同时更新生成的 workspaces、routing config、文档和 release checks。"

每个任务都需要报告：
- complexity: simple|medium|complex
- selected agents: 一个或多个内部岗位 Agent
- reason: 用一句话说明为什么这样分配合理

预期路由行为：
- 简单任务通常应由 `main` 自己处理，或只使用一个高度相关的角色，例如 `docs` 或 `reviewer`。
- 中等任务应使用少量聚焦角色，例如脚本行为变更可以分配给 `backend` + `qa` + `reviewer`。
- 复杂任务应包含多个互补角色，通常包括 `pm`、`architect`、实现岗位、`qa`、`reviewer`、存在风险时的 `security`，以及涉及用户文档时的 `docs`。

检查 4 - 跨角色综合
让 `reviewer` review PM/architect/QA 的结果以及任务分级/路由计划，指出是否存在矛盾、遗漏的安全检查、过度路由、路由不足，或角色路由异常迹象。

成功标准：
- `main` 可以通过 agent-to-agent routing 触达上述内部 Agent。
- 各岗位输出保持在自己的职责范围内。
- `main` 可以把简单、中等、复杂任务分成不同等级。
- `main` 可以根据任务复杂度和领域，为任务分配 1 个或多个合适的内部岗位 Agent。
- `qa` 可以读取 shared task template 路径。
- `reviewer` 可以检查其他岗位输出，并 review 路由决策。
- 最终面向用户的总结由 `main` 返回，而不是由某个子岗位 Agent 直接返回。

最终回复格式：
- verdict: ok|warning|blocking
- reached agents: 列出成功响应的 Agent
- classification check: 用一行说明 simple/medium/complex 路由是否合理
- failures: 列出缺失/失败检查；没有则写 `none`
- next action: 一条简短建议
```

预期结果：`verdict: ok`，`pm`、`architect`、`qa`、`reviewer` 四个请求的岗位 Agent 都出现在 reached agents 中，并且 classification check 能体现简单、中等、复杂任务使用了不同路由。只有纯展示或文档类小问题才应是 `warning`；如果是 `blocking`，说明复现结果还不适合直接依赖，需要先排查。

### 完整验证（可选）

如果你想做更深的检查，按 SOP 执行：

- `scripts/healthcheck-runtime.md`

备注：宿主机侧只读检查仍可运行：

```bash
node scripts/healthcheck-runtime.js --target "$HOME/.openclaw"
```

## 故障排查（仅调试用）

只有在 Phase 1/2 失败时才需要看这一节。

1) 先跑只读检查：

```bash
node scripts/repro-check.js --target "$HOME/.openclaw"
node scripts/doctor-local.js
```

2) 如果 `reproduce-new-machine.js --apply` 失败，用下面步骤缩小范围：

- workspaces/templates：

```bash
node scripts/generate-workspaces.js --target "$HOME/.openclaw"
node scripts/generate-workspaces.js --target "$HOME/.openclaw" --apply
```

- Agent 注册（先预览）：

```bash
node scripts/register-agents.js --target "$HOME/.openclaw" --model g
```

- routing 配置补丁（审查输出）：

```bash
node scripts/configure-agent-routing.js --output /tmp/openclaw-agent-routing.patch.json
openclaw config patch --file /tmp/openclaw-agent-routing.patch.json --dry-run
```

3) 若你改了 config，记得校验并重启：

```bash
openclaw config validate
openclaw gateway restart
```

4) 如果 agent-to-agent 发送失败：

- 确认 config 变更后已重启 Gateway。
- 确认 OpenClaw config 中 `tools.agentToAgent.enabled=true`。

完整脚本列表与参数见：

- `docs/reference/scripts.zh-CN.md`

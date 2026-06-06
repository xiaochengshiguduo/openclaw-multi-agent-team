[English](regression-improvement-outline.md) | 中文

# 多 Agent 体系回归复盘与项目完善大纲

> **历史归档说明。** 本页记录的是 2026-05-31 新机器复现演练的当时观察、阻断和改进方向，仅作为证据与项目历史保留，不代表当前 OpenClaw 版本、模型选择或项目安全策略。当前有效指引请优先参考最新的新机器复现、脚本参考、安全模型、发布检查清单和版本策略页面。

> 生成时间：2026-05-31 09:20–09:25 GMT+8  
> 环境：Linux 6.12.86，Node.js v24.16.0，OpenClaw 2026.5.28 (e932160)  
> 依据：`docs/getting-started/reproduce-on-new-machine.zh-CN.md` 新机器复现指南  
> 目标：模拟用户在重装后的新机器上，手动复现并回归 OpenClaw 多 Agent 团队体系，记录过程问题，并形成后续项目完善方向。

## 1. 回归结论摘要

本次回归整体结果：**本地项目质量、workspace 生成、岗位 Agent 注册、共享任务档案结构均可通过；初版回归发现 `generate-workspaces --apply` 对已有 main workspace 采用跳过语义，导致 main Supervisor 模板不能完整复现。随后已将项目语义修正为：`--apply` 默认覆盖本仓库管理的 workspace 模板文件，确保新机器按指南可完整复现 main + role Agents 体系。完整 main → role Agent 运行时通信仍需 Gateway restart 后再验证。**

已验证通过：

- GitHub 仓库可通过 `gh`/`git` 获取。
- `doctor-local`、`healthcheck-local`、smoke tests 均通过。
- `repro-check` 在注册前能正确提示“角色 Agent 缺失”和“主 workspace 已存在”。
- `generate-workspaces --apply` 当前语义：默认覆盖本仓库管理的 `main` 和 role workspace 模板文件/`shared` 链接，确保新机器完整复现；如需迁移保留才使用 `--preserve-existing`。
- `register-agents --apply` 能注册 10 个岗位 Agent，且默认不绑定 Telegram。
- `configure-agent-routing` 生成的 patch 能通过 `openclaw config patch --dry-run` 和 `openclaw config validate`。
- 应用 routing patch 后，配置文件有效。
- `healthcheck-runtime.js` 能确认 workspace、shared task templates、Agent inventory 基本正确。
- fake task archive 能通过 `create-task-archive.js --apply` 创建。

未完成 / 被阻断：

- `main → pm` 的真实 agent-to-agent 只读通信测试返回：`Agent-to-agent messaging is disabled. Set tools.agentToAgent.enabled=true to allow cross-agent sends.`
- 原因判断：routing patch 已写入并校验，但 Gateway 提示“Restart the gateway to apply”。当时的低层脚本遵循“不由普通辅助脚本自动 Gateway restart”的安全边界，因此未擅自重启；后续专用新机复现脚本已改为可在显式 `--apply` 后重启 Gateway。

### 2026-05-31 修正说明

根据“项目主要面向新机器完整复现”的定位，已修正 `generate-workspaces --apply` 的默认行为：

- `--apply` 默认覆盖本仓库管理的模板文件，包括 `main` 的 `AGENTS.md` / `SOUL.md` / `TEAM.md`、role workspace 模板文件、task templates，以及 role `shared` 链接。
- dry-run 仍是默认行为，不写入。
- 需要迁移旧机器并保留现有文件时，使用 `--preserve-existing`。
- OpenClaw 凭证、sessions 仍不自动修改；OpenClaw config 和 Gateway restart 仅由专用新机复现脚本在显式 `--apply` 后处理，普通辅助脚本仍保持 preview-first/manual。

这使“根据新机器复现指南完整复现一套多 Agent 体系”的目标在 workspace/template 层面成立。

## 2. 实际回归流程记录

### Phase 0 — 前置环境

执行观察：

- Node.js：`v24.16.0`，满足 Node 24+。
- OpenClaw CLI：存在，版本为 `OpenClaw 2026.5.28 (e932160)`。
- OpenClaw Gateway：运行中。
- 当前机器是重装后的新环境，初始仅存在 `main` Agent。
- Telegram 已绑定在 `main` 上。

发现：

- 项目 README 中的“当前开发验证参考版本”为 `OpenClaw 2026.5.27 (27ae826)`，当前实际版本为 `2026.5.28 (e932160)`。
- `repro-check` 对版本差异给出 warning，这是合理行为。

完善方向：

- 将“验证参考版本”改成可维护的兼容矩阵，而不是单一版本。
- 在指南中明确：patch dry-run 和 config validate 通过并不代表 Gateway 已加载新配置。

### Phase 1 — Clone 并检查

执行命令：

```bash
git clone https://github.com/xiaochengshiguduo/openclaw-multi-agent-team.git
cd openclaw-multi-agent-team
node scripts/doctor-local.js
node scripts/healthcheck-local.js
node tests/smoke/run.js
```

结果：

```text
# doctor-local: ok
# healthcheck-local: ok
smoke tests passed
```

发现：

- 本地基础质量良好。
- smoke tests 覆盖了 help、local healthcheck、repro-check、markdown links、语言配对、routing decision、workspace dry-run/apply fixture、task archive dry-run/apply fixture。

完善方向：

- smoke tests 可继续增强对真实 OpenClaw CLI 输出兼容性的 fixture 覆盖。
- 建议在 CI 中加入当前 OpenClaw 最新稳定版本的兼容性提示或 allowlist。

### Phase 2 — 复现 readiness 检查

执行命令：

```bash
node scripts/repro-check.js --target "$HOME/.openclaw"
```

结果：`warning`。

关键 warning：

- `openclaw.version.policy`：当前安装版本与验证参考版本不一致。
- `runtime.agents.present`：注册前缺少岗位 Agents，这是新机器上的预期状态。
- `target.existing-main-workspace`：`~/.openclaw/workspace` 已存在。

发现：

- “已有主 workspace” warning 对真实新装 OpenClaw 很常见，因为 main workspace 已由 OpenClaw 自身创建。
- 对用户来说，这个 warning 可能会造成“是不是不能继续”的疑惑。

完善方向：

- 将 warning 分级为：`expected-before-registration`、`needs-review`、`risk`。
- 对 `target.existing-main-workspace` 增加更明确说明：存在是常见情况；当前脚本在 `--apply` 时会覆盖本仓库管理的模板文件以满足新机器完整复现，如需保留旧文件应显式使用 `--preserve-existing`。
- 输出下一步建议，例如：“如仅为初装 main workspace，可继续执行 generate-workspaces dry-run；如已有私有内容，先备份。”

### Phase 3 — 生成 workspaces

执行命令：

```bash
node scripts/generate-workspaces.js --target "$HOME/.openclaw"
node scripts/generate-workspaces.js --target "$HOME/.openclaw" --apply
```

结果：成功。

关键结果：

- 创建岗位 workspace：`workspace-pm`、`workspace-architect`、`workspace-backend`、`workspace-frontend`、`workspace-qa`、`workspace-reviewer`、`workspace-security`、`workspace-devops`、`workspace-docs`、`workspace-research`。
- 生成 `~/.openclaw/workspace/shared/tasks/_template/requirements-package.md`。
- 每个岗位 workspace 的 `shared` symlink 指向 `~/.openclaw/workspace/shared`。
- 修正后的 `--apply` 默认覆盖本仓库管理的 workspace 模板文件，保证 main Supervisor 模板和 role Agent 模板都来自仓库。
- 如果维护者需要迁移已有长期机器并保留现有文件，可以显式追加 `--preserve-existing`。

发现：

- 初版脚本在 main workspace 已存在时会跳过 `AGENTS.md`、`SOUL.md`、`USER.md` 等模板，导致 main Supervisor 行为层不能完整回归。
- 该行为不符合“新机器完整复现”目标，因此已改为 `--apply` 默认覆盖项目管理的模板文件。
- 覆盖行为仍满足项目规范：dry-run 默认只预览，真实写入必须显式 `--apply`；workspace 模板覆盖不会直接修改 OpenClaw config/Gateway/凭证，相关 config/Gateway 处理只属于专用新机复现脚本。

完善方向：

- 持续保持 dry-run 输出可审查，明确提示 overwrite mode。
- 在迁移场景保留 `--preserve-existing` 作为例外路径。
- 可后续增加 template checksum/diff 输出，帮助维护者审查覆盖内容。

### Phase 4 — 注册岗位 Agents

执行命令：

```bash
node scripts/register-agents.js --target "$HOME/.openclaw" --model g
node scripts/register-agents.js --target "$HOME/.openclaw" --model g --apply
```

结果：成功。

关键观察：

- dry-run 在 workspace 未生成前能提示缺失 workspace。
- apply 后 `openclaw agents list` 显示 11 个 Agent：`main` + 10 个岗位 Agent。
- 子 Agent routing rules 均为 0，未出现 Telegram/channel binding。
- 使用 `--model g` 可以注册，但文档示例使用 `gpt/gpt-5.5`，与当前环境的模型别名习惯不完全一致。

发现：

- 每次 `openclaw agents add` 都会更新 `~/.openclaw/openclaw.json` 并创建同名 `.bak`，多次连续注册时备份可能被后续覆盖。
- 注册命令没有先生成一个“批量注册前完整备份”。
- 文档没有明确模型名应该如何根据本机 alias/provider 决定。

完善方向：

- `register-agents.js --apply` 前自动创建 timestamped config backup，或提示用户先备份。
- 支持 `--model-from-main`，默认复用 main 的模型，降低新机器上的模型名错误概率。
- 增加 `--skip-existing` / `--fail-if-existing`，让重复执行更可控。
- 在文档中说明：示例模型值只是示例，实际可用 `openclaw agents list` 或 `/status` 查看当前 main 模型。

### Phase 5 — agent-to-agent routing 配置

执行命令：

```bash
node scripts/configure-agent-routing.js --output /tmp/openclaw-agent-routing.patch.json
openclaw config patch --file /tmp/openclaw-agent-routing.patch.json --dry-run
openclaw config validate
openclaw config patch --file /tmp/openclaw-agent-routing.patch.json
openclaw config validate
```

生成 patch：

```json
{
  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": [
        "main",
        "pm",
        "architect",
        "backend",
        "frontend",
        "qa",
        "reviewer",
        "security",
        "devops",
        "docs",
        "research"
      ]
    },
    "sessions": {
      "visibility": "all"
    }
  },
  "session": {
    "agentToAgent": {
      "maxPingPongTurns": 2
    }
  }
}
```

结果：

- dry-run 成功：`4 update(s) validated`。
- apply 成功：`Applied 4 config update(s). Restart the gateway to apply.`
- config validate 成功。

发现：

- v1 设计为不自动修改真实 config；但回归中为了模拟人工操作，手动使用了 OpenClaw config patch。
- 应用 patch 后不重启 Gateway，运行时仍然认为 A2A disabled。
- 文档 Phase 5 写了“只有在需要时手动 restart Gateway”，但实际 OpenClaw CLI 已明确提示需要 restart。

完善方向：

- 文档中明确：“看到 `Restart the gateway to apply` 后，必须手动重启后才能进行 Phase 6 的 A2A 通信测试。”
- `configure-agent-routing.js` 输出后，可附带建议命令和检查命令，但不自动执行：
  - `openclaw config patch --file ... --dry-run`
  - `openclaw config patch --file ...`
  - `openclaw gateway restart` 或当前推荐的 restart 方式
  - `openclaw config get tools.agentToAgent.enabled`
- 增加 `healthcheck-runtime.js` 对“配置文件已启用但 Gateway 未加载”的诊断。

### Phase 6 — Runtime healthcheck

执行命令：

```bash
node scripts/healthcheck-runtime.js --target "$HOME/.openclaw"
```

结果：`warning`。

通过项：

- workspace 和 shared 结构存在。
- 所有 task template 存在。
- 所有岗位 workspace 具有 `AGENTS.md`、`TEAM.md`。
- 所有岗位 workspace 的 `shared` link 正确。
- OpenClaw status 正常。
- 11 个预期 Agents 均存在。
- 子 Agent 未发现明显 user-facing binding。

warning：

- OpenClaw 版本与验证参考版本不一致。

真实通信测试：

```text
main → pm read-only check
```

返回：

```text
Agent-to-agent messaging is disabled. Set tools.agentToAgent.enabled=true to allow cross-agent sends.
```

发现：

- `healthcheck-runtime.js` 当前只能检查“静态 runtime 形状”，不能确认 Gateway 当前内存中的工具策略是否已加载新配置。
- SOP 文档要求从 main 发消息给 pm，但脚本未覆盖该动态测试。
- 一旦 Gateway 未重启，用户会在 Phase 6 才遇到阻断。

完善方向：

- 新增 `scripts/healthcheck-a2a.js` 或 `healthcheck-runtime.js --live-a2a`：低风险向 `pm` 发送只读任务，确认 A2A 真可用。
- 在 live check 失败时区分：
  - config 未写入；
  - config 已写入但 Gateway 未重启；
  - agent 不存在；
  - session/tool policy 禁止；
  - provider/model auth 不可用。
- 在 runtime SOP 中把“静态检查”和“动态通信检查”拆开。

### Phase 7 — E2E 演练

执行命令：

```bash
node scripts/create-task-archive.js --slug e2e-drill-regression --tasks-root "$HOME/.openclaw/workspace/shared/tasks" --apply
```

结果：成功创建：

```text
<OPENCLAW_HOME>/workspace/shared/tasks/TASK-20260531-0923-e2e-drill-regression
```

包含文件：

```text
brief.md
metadata.md
plan.md
routing.md
status.md
```

发现：

- `create-task-archive.js` 默认只创建部分生命周期文件，而 `_template` 中存在更多角色文件。
- 对 fake e2e drill 来说，这有利于按需填写；但文档中“角色输出捕获”没有对应自动化辅助。
- 因 A2A runtime 未生效，无法完成 `main → pm → reviewer → main final` 的真实流转。

完善方向：

- 为 e2e drill 提供专用脚本：`scripts/run-fake-e2e-drill.md` 或 `scripts/create-e2e-drill-archive.js`。
- 提供可复制的 prompt 包：main、pm、reviewer、final 四段。
- 增加 `--full-template` 选项，创建所有角色文件，便于完整归档演练。

## 3. 问题清单与优先级

### P0 — 影响完成闭环的问题

1. **Gateway 未重启时 A2A 失败，但当前检查链路未提前拦截**
   - 现象：patch 已应用、validate 成功，但 `sessions_send` 仍返回 A2A disabled。
   - 建议：Phase 5 明确 restart 必要性；Phase 6 增加 live A2A probe。

2. **新机器 workspace/template 完整复现语义已修正**
   - 初版现象：`generate-workspaces --apply` 会跳过已有 main 文件，导致 main 可能不是项目定义的 Supervisor 行为。
   - 当前行为：`--apply` 默认覆盖本仓库管理的 main/role workspace 模板文件和 role `shared` 链接。
   - 后续建议：保留 `--preserve-existing` 迁移路径，并可增加 template diff/check 帮助审查覆盖内容。

### P1 — 高价值完善

1. **增强版本兼容策略**
   - 从单一 verified version 改为兼容范围/矩阵。
   - 对 patch schema 与 OpenClaw 版本做更明确提示。

2. **注册前后配置备份更稳妥**
   - 连续 `agents add` 会反复生成 `.bak`。
   - 建议 timestamp backup，或者将批量注册包装成更清晰的事务式流程。

3. **模型配置更贴近真实机器**
   - 支持 `--model-from-main`。
   - 文档说明 alias 与 provider/model 的差异。

4. **runtime healthcheck 自动化程度不足**
   - 静态检查已不错，但缺 live A2A、角色读取矩阵、fake drill 自动验证。

### P2 — 体验与文档完善

1. **warning 文案分级**
   - 新机器预期 warning 与风险 warning 应区分。

2. **为人工步骤提供标准命令块**
   - config backup、patch dry-run、apply、validate、restart、post-check。

3. **E2E 演练资料包化**
   - 提供 prompt、预期输出、归档示例、失败处理路径。

4. **中文指南加入“遇到什么算正常”**
   - 比如注册前缺角色、main workspace 已存在、版本 warning。

## 4. 建议的项目完善路线图

### Milestone 1 — 让新机器复现闭环更稳

目标：用户按指南操作时，不会卡在“看似配置成功但 A2A 仍 disabled”。

建议任务：

- 更新 `docs/getting-started/reproduce-on-new-machine.zh-CN.md`：
  - Phase 5 增加 Gateway restart 判断说明。
  - Phase 6 前增加“确认 Gateway 已加载 routing config”。
- 增加 `scripts/check-routing-config.js`：
  - 读取 config 文件确认 `tools.agentToAgent.enabled=true`。
  - 检查 allow list 包含 11 个 Agent。
  - 输出是否需要 restart 的人工提示。
- 增加 `scripts/healthcheck-runtime.js --live-a2a`：
  - 低风险向 pm 发只读验证任务。
  - 失败时输出可操作原因分支。

验收：

- 不重启 Gateway 时，检查能明确提示“配置已写入但 runtime 未生效，需重启”。
- 重启后，live A2A check 返回 pass。

### Milestone 2 — 让 main Supervisor 模板覆盖可审计

目标：在保持新机器默认完整覆盖的同时，让维护者能清楚审查哪些模板会被覆盖。

建议任务：

- 保持 `generate-workspaces.js --apply` 默认覆盖本仓库管理的 main/role workspace 模板文件。
- 保留并文档化 `--preserve-existing`，仅用于迁移已有长期机器。
- 新增 `scripts/diff-main-template.js`：比较当前 main workspace 与 `roles/main`、`workspace-template`。
- dry-run 输出中继续明确 overwrite mode 和目标文件。

验收：

- 新机器按指南执行后，main Supervisor 模板一定来自本仓库。
- 迁移场景仍有明确的保留路径。
- 用户能在写入前审查会覆盖哪些文件。

### Milestone 3 — 注册流程更安全可重复

目标：重复运行、部分失败、已有 Agent 时行为清晰。

建议任务：

- `register-agents.js` 增加：
  - `--model-from-main`
  - `--skip-existing`
  - `--fail-if-existing`
  - `--backup-config`
- 注册前输出完整计划：新增/已存在/会跳过/会失败。
- 注册后自动运行只读 inventory check。

验收：

- 已注册环境重复执行不会误导。
- 部分注册失败时，有清楚恢复路径。

### Milestone 4 — E2E drill 从 SOP 升级为半自动回归

目标：把“人工多 Agent 回归”变成可重复执行、可归档、可判定的演练。

建议任务：

- 新增 `examples/e2e-drill/prompts.zh-CN.md`。
- 新增 `scripts/create-e2e-drill-archive.js` 或扩展 `create-task-archive.js --preset e2e-drill`。
- 新增 `scripts/verify-task-archive.js`：检查 brief/pm/review/final 是否完整。
- 文档中给出 `main → pm → reviewer → main final` 的完整 transcript 示例。

验收：

- 用户可以在 10–15 分钟内完成一次 fake drill。
- 归档结果可被 docs/reviewer 复盘。

### Milestone 5 — 发布前兼容性与安全矩阵

目标：让项目对 OpenClaw 版本变化更有弹性。

建议任务：

- 建立 `docs/reference/compatibility.zh-CN.md` 的版本矩阵：
  - OpenClaw version
  - routing patch schema
  - agent registration CLI behavior
  - healthcheck result
- 在 `repro-check` 中输出 compatibility link。
- 在 release checklist 中加入“新机器从零回归”项。

验收：

- OpenClaw 升级后，项目能快速定位需要更新的脚本/文档。

## 5. 建议新增/修改文件

优先新增：

- `scripts/check-routing-config.js`
- `scripts/diff-main-template.js`
- `docs/getting-started/reproduce-on-new-machine.zh-CN.md` 补充 restart 和 warning 说明
- `docs/guides/run-an-e2e-drill.zh-CN.md` 增加完整人工 prompt 包
- `examples/e2e-drill/prompts.zh-CN.md`

优先修改：

- `scripts/healthcheck-runtime.js`：增加 live A2A 可选检查
- `scripts/register-agents.js`：增强幂等、备份、模型来源
- `scripts/generate-workspaces.js`：保持并测试 `--apply` 默认覆盖、`--preserve-existing` 迁移保留语义
- `docs/reference/compatibility.zh-CN.md`：补充 2026.5.28 结果

## 6. 本次回归证据

关键命令结果：

```text
# doctor-local: ok
# healthcheck-local: ok
smoke tests passed
```

```text
# repro-check: warning
[warning] openclaw.version.policy: installed=OpenClaw 2026.5.28 (e932160); verified-reference=OpenClaw 2026.5.27
[warning] runtime.agents.present: missing/unknown: pm, architect, backend, frontend, qa, reviewer, security, devops, docs, research
[warning] target.existing-main-workspace: <OPENCLAW_HOME>/workspace
```

```text
# workspace generation
status: ok
current semantics: --apply overwrites repository-managed templates; --preserve-existing keeps old files for migrations
```

```text
# agents after registration
main, pm, architect, backend, frontend, qa, reviewer, security, devops, docs, research
```

```text
# config patch
Dry run successful: 4 update(s) validated against ~/.openclaw/openclaw.json.
Applied 4 config update(s). Restart the gateway to apply.
Config valid: ~/.openclaw/openclaw.json
```

```text
# runtime-healthcheck: warning
agents.expected: all expected Agents present
workspace.*.shared-link: ok
openclaw.version.policy: warning due to 2026.5.28 vs 2026.5.27 reference
```

```text
# live A2A blocked before Gateway restart
Agent-to-agent messaging is disabled. Set tools.agentToAgent.enabled=true to allow cross-agent sends.
```

## 7. 最终建议

短期最值得做的是：**把 Phase 5/6 的“配置写入”和“Gateway 实际生效”之间的断点补上。** 这会直接决定新机器复现能否闭环。

推荐下一步顺序：

1. 更新新机器复现指南，明确 routing patch 后的 restart 与 post-check。
2. 给 `healthcheck-runtime.js` 增加 live A2A probe。
3. 增加 main/template diff check，让默认覆盖可审查、迁移保留路径更清晰。
4. 再把 fake e2e drill 半自动化，形成稳定回归套件。


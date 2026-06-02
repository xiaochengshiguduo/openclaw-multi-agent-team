[English](scripts.md) | 中文

# 脚本参考

所有具备写入能力的脚本都遵循预览优先。运行时不带 `--apply` 可检查计划。

## 通用约定

```text
node scripts/<script>.js --help
node scripts/<script>.js            # dry-run / preview
node scripts/<script>.js --apply    # 在支持时写入 / 执行
```

首个版本仅支持 Linux。

## `doctor-local.js`

诊断本地前置条件。不写入。

```bash
node scripts/doctor-local.js
node scripts/doctor-local.js --json
```

检查：

- Linux 平台
- Node.js 24+
- OpenClaw CLI 可用性
- 项目根目录存在且可写
- 目录符号链接支持

## `reproduce-new-machine.js`

新机器自动化复现总控脚本。

```bash
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw"
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw" --apply
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw" --apply --yes --model custom-openai/gpt-5.5 --base-url https://api.openai.com/v1 --api-key-env OPENCLAW_MODEL_API_KEY
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw" --apply --keep-config-backups 3
```

配置复用（默认开启）：

- 若 `<target>/openclaw.json` 已存在，脚本会将其作为“默认值来源”，并只在 `--apply` 模式下对缺失的必需项进行询问。
- CLI 参数始终优先。
- 如需强制全新输入，使用 `--no-reuse-config`。
- 脚本只会读取/复用这些字段：
  - `agents.defaults.model.primary`
  - `agents.defaults.models[primary].alias`
  - `models.providers[provider].baseUrl`、`models.providers[provider].api`、`models.providers[provider].apiKey`

默认模式是 dry-run，会打印完整计划。使用 `--apply` 后，它会：

- 覆盖本仓库管理的 workspaces/templates
- 覆盖 OpenClaw 中本项目管理的 model/provider/A2A routing 配置
- 通过 `register-agents.js --apply`（OpenClaw 原生 `agents add` 流程）注册 role agents
- 通过 `openclaw config patch --dry-run` 和 `openclaw config validate` 验证配置
- 默认重启 Gateway，使复现出的团队立刻可用
- 默认将 OpenClaw config patch 备份收敛到最新 1 个 `openclaw.json.bak*` 文件
- 永不把 Telegram 绑定到岗位 Agents

OpenClaw 在应用 config patch 时可能会创建 `openclaw.json.bak*` 文件。为避免重复复现时备份不断堆积，脚本会在成功写入 patch 后删除较旧的 `openclaw.json.bak*` 文件。它不会删除 `openclaw.json.last-good` 或无关文件。使用 `--keep-config-backups <n>` 可保留更多备份，使用 `--no-prune-config-backups` 可关闭清理。

密钥只作为本机输入使用。若不想在交互式提示中粘贴 key，使用 `--api-key-env`。`--skip-config` 或 `--skip-restart` 仅建议用于调试或受限环境。


## `bootstrap-new-machine.sh`

用于公开仓库的 bootstrap 辅助脚本：

- 当 `--dest` 不存在时克隆 `openclaw-multi-agent-team`（仅公开 `git clone`，不用 `gh` 登录）
- 当已有 `--dest` 干净且有 upstream 时，尽可能 fast-forward 更新
- 当已有 `--dest` 存在本地改动时，不修改它
- 运行 `scripts/reproduce-new-machine.js`

```bash
scripts/bootstrap-new-machine.sh
scripts/bootstrap-new-machine.sh --apply
scripts/bootstrap-new-machine.sh --apply --yes -- --api-key-env OPENCLAW_MODEL_API_KEY
```

远程 bootstrap（可选）：

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/bootstrap-new-machine.sh)" --
```

安全提示：

- 建议先审查脚本内容再执行。
- 该脚本会进行网络调用（`git clone` / `git fetch`）。
- `--dest` 中已有本地改动会被保留；checkout 不干净时脚本会跳过自动更新。

## `generate-workspaces.js`

生成 OpenClaw Agent 工作区和共享符号链接。

```bash
node scripts/generate-workspaces.js --target "$HOME/.openclaw"
node scripts/generate-workspaces.js --target "$HOME/.openclaw" --apply
node scripts/generate-workspaces.js --target /tmp/demo --roles main,pm,docs --apply
node scripts/generate-workspaces.js --target "$HOME/.openclaw" --apply --preserve-existing
```

创建：

```text
<target>/workspace
<target>/workspace-pm
<target>/workspace-architect
...
```

角色工作区会获得：

```text
shared -> <target>/workspace/shared
```

新机器复现语义：

- dry-run 仍是默认行为，不写入。
- `--apply` 会覆盖本仓库管理的 workspace 模板文件和角色 `shared` 链接，确保生成的团队与仓库一致。
- 只有在手动迁移、必须保留现有文件时才使用 `--preserve-existing`。
- 此脚本仍不修改 OpenClaw config、凭证、sessions、模板文件之外的 memories，或 Gateway 状态。

## `create-task-archive.js`

从模板创建任务归档。

```bash
node scripts/create-task-archive.js --slug demo --tasks-root "$HOME/.openclaw/workspace/shared/tasks"
node scripts/create-task-archive.js --slug demo --tasks-root "$HOME/.openclaw/workspace/shared/tasks" --apply
```

Slug 必须匹配：

```text
^[a-z0-9][a-z0-9-]{0,63}$
```

## `register-agents.js`

预览或执行 OpenClaw Agent 注册命令。

```bash
node scripts/register-agents.js --target "$HOME/.openclaw" --model gpt/gpt-5.5
node scripts/register-agents.js --target "$HOME/.openclaw" --model gpt/gpt-5.5 --apply
```

安全性：

- 不添加 Telegram 绑定
- 执行前会打印命令
- 需要 `--apply` 才会运行命令

## `configure-agent-routing.js`

打印 Agent 到 Agent 配置补丁。

```bash
node scripts/configure-agent-routing.js
node scripts/configure-agent-routing.js --output /tmp/openclaw-agent-routing.patch.json
```

此补丁会启用跨 Agent 发送、所有 Agent session 可见性，以及 `main` 面向角色 Agent 的内部 subagent allowlist。由 `reproduce-new-machine.js` 生成时，patch 会保留现有 `agents.list` 条目，只更新 `main` 管理的 subagent routing 字段。此版本拒绝自动修改配置。仅在备份、验证并明确确认后手动应用。

## `repro-check.js`

用于新机器复现准备情况的只读检查。

```bash
node scripts/repro-check.js --target "$HOME/.openclaw"
node scripts/repro-check.js --target "$HOME/.openclaw" --json
```

检查：

- Linux 平台
- Node.js 版本
- OpenClaw CLI
- 必需项目文件
- 角色模板
- 目标可写性
- 符号链接支持
- 现有工作区 / Agent 提示

## `preflight.js`

只读发布预检封装器。

```bash
node scripts/preflight.js
node scripts/preflight.js --target /tmp/oc-mat-preflight-repro
```

运行 doctor、本地健康检查、复现检查、冒烟测试和小型危险文件扫描。它不会暂存、提交、推送、更改 OpenClaw 配置或重启 Gateway。

## `sync-team-docs.js`

计划中的预览优先同步辅助工具。

它不得覆盖私有文件：

- `MEMORY.md`
- `USER.md`
- `TOOLS.md`
- `IDENTITY.md`

## `healthcheck-local.js`

检查仓库模板和结构。不写入，也不进行外部调用。

```bash
node scripts/healthcheck-local.js
node scripts/healthcheck-local.js --json
```

## `healthcheck-runtime.js`

针对真实 OpenClaw 多 Agent 团队安装的只读健康检查。

```bash
node scripts/healthcheck-runtime.js --target "$HOME/.openclaw"
node scripts/healthcheck-runtime.js --target "$HOME/.openclaw" --json
node scripts/healthcheck-runtime.js --target "$HOME/.openclaw" --skip-openclaw
```

检查：

- Linux 运行时目标
- main 和角色工作区目录
- 角色 `AGENTS.md` 和 `TEAM.md`
- 角色 `shared` 符号链接
- 共享任务归档模板
- OpenClaw config 中 `main` 面向角色 Agent 的 subagent allowlist
- OpenClaw CLI / version / status（可用时）
- 来自 `openclaw agents list` 的预期 Agent ID
- 子 Agent 上明显的面向用户绑定标记

安全性：

- 不写入配置
- 不注册 Agent
- 不重启 Gateway
- 不创建任务
- 不发送 Agent 到 Agent 消息
- `--skip-openclaw` 仅检查文件系统，不应作为最终运行时验证

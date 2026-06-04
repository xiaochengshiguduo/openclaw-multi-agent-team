[English](README.md) | 中文

# OpenClaw Multi-Agent Team

[![CI](https://github.com/xiaochengshiguduo/openclaw-multi-agent-team/actions/workflows/ci.yml/badge.svg)](https://github.com/xiaochengshiguduo/openclaw-multi-agent-team/actions/workflows/ci.yml)
![Linux](https://img.shields.io/badge/platform-Linux-blue)
![Node.js](https://img.shields.io/badge/node-24%2B-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

一个可复现、长期可用的 OpenClaw 多 Agent 软件团队模板。

> 状态：v1.1.0 本地验证中。本仓库是经过脱敏的 OpenClaw 多 Agent 团队模板与设置工具包。在发布或应用到真实 runtime 前，请先审查安全边界、开发规范和本地检查结果。

## 这是什么

`openclaw-multi-agent-team` 用于在 Linux 机器上复现一套长期可用的 OpenClaw 软件团队：

- `main` 是唯一用户入口，承担 Supervisor / CTO / 交付负责人职责。
- 长期岗位 Agent 负责专业分工：PM、Architect、Backend、Frontend、QA、Reviewer、Security、DevOps、Docs、Research。
- 每个 Agent 有独立 workspace。
- 所有角色通过 `shared/tasks` 共享持久任务档案。
- 重要工作遵循标准生命周期：intake → clarify → plan → execute → review → final → archived。
- 脚本默认 preview-first，适合在另一台新机器上完整复现。

它是一个**模板/工具链项目**，不是当前私有 OpenClaw workspace 的备份。

## 架构概览

```text
用户 / Telegram
      │
      ▼
main Supervisor
  CTO + 交付负责人 + 唯一用户入口
      │
      ├── pm          需求、范围、验收边界
      ├── architect   架构和技术权衡
      ├── backend     服务端/API/数据逻辑
      ├── frontend    UI/客户端交互/状态
      ├── qa          测试策略、验收、回归
      ├── reviewer    可维护性和代码审查
      ├── security    密钥、认证、命令/文件/网络风险
      ├── devops      运行时、CI、服务、健康检查
      ├── docs        文档和交接
      └── research    外部调研和方案比较
      │
      ▼
shared/tasks/TASK-YYYYMMDD-HHMM-slug/
      │
      ▼
由 main 汇总后的最终用户交付
```

## 你会得到什么

- 11 个[角色模板](roles/)
- 脱敏 [main workspace 模板](workspace-template/)
- 18 个[任务档案模板](task-templates/_template/)
- [安全脚本](scripts/)
- 本地健康检查和 smoke tests
- 真实 OpenClaw 环境 runtime healthcheck SOP
- [脱敏示例](examples/)

## 安全默认值

- 不包含真实 `openclaw.json`、配置备份、auth profiles、token、Telegram bot token、Gateway token、memory、session、transcript 或私人用户数据。
- 可写脚本默认 dry-run / preview。
- 写入或执行命令需要显式 `--apply`。
- 一条命令新机器复现脚本可以在预览和显式 `--apply` 确认后更新本项目管理的 OpenClaw 配置并重启 Gateway。
- 底层 config 辅助脚本仍为分阶段/调试流程输出可审查 patch。
- 子 Agent 默认不绑定 Telegram。
- `main` 始终是唯一用户入口。

## 前置要求

- Linux
- Node.js 24+
- OpenClaw 已单独安装并配置
- 注册和 runtime 步骤需要 OpenClaw CLI

本项目**不安装、不升级、不降级、也不固定** OpenClaw 版本。详见 [OpenClaw 版本策略](docs/reference/openclaw-version-policy.zh-CN.md)。

当前开发验证参考版本：

```text
OpenClaw 2026.5.27 (27ae826)
```

## 快速开始

运行本地检查：

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
node tests/smoke/run.js
```

预览完整新机器复现：

```bash
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw"
```

审查后的远程一键 bootstrap：

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/bootstrap-new-machine.sh)" -- --apply
```

从本地 checkout 审查后交互式执行完整复现：

```bash
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw" --apply
```

分阶段/调试流程仍可单独使用 `generate-workspaces.js`、`register-agents.js` 和 `configure-agent-routing.js`。

完整新机器复现流程见[新机器复现指南](docs/getting-started/reproduce-on-new-machine.zh-CN.md)。

## 更新已经使用过的 runtime workspace

`bootstrap-new-machine.sh` / `reproduce-new-machine.js` 适合新机器或完整复现。对于已经使用过一段时间的 OpenClaw runtime，优先使用增量 runtime workspace updater：

```bash
node scripts/update-runtime-workspace.js --target "$HOME/.openclaw"
```

updater 默认只预览，不写入。应用更新：

```bash
node scripts/update-runtime-workspace.js --target "$HOME/.openclaw" --apply
```

无冲突成功 apply 后默认重启 Gateway。跳过重启：

```bash
node scripts/update-runtime-workspace.js --target "$HOME/.openclaw" --apply --no-restart
```

安全边界：

- 只处理版本化 manifest 声明的条目。
- 只允许写入 allowlist 中的项目托管 runtime workspace 路径：`workspace/AGENTS.md`、`workspace/TEAM.md`、`workspace/shared/tasks/_template/*.md`。
- 禁止写配置、模型/provider 设置、凭证、memory、sessions、state、transcripts 和用户上下文文件。
- 用户修改过的托管文件默认变成 conflict，不覆盖。
- 写入前备份，使用原子写入和锁，并记录到 `state/openclaw-multi-agent-team/update-state.json` 与 `last-plan.json`。
- 如果存在 conflict 或 forbidden target，updater 不写入，也不重启。

## 主要脚本

| 脚本 | 用途 | 默认写入吗？ |
|---|---|---|
| `scripts/bootstrap-new-machine.sh` | 公开 clone/update 后调用 `reproduce-new-machine.js` | 否，除非透传 `--apply` |
| `scripts/reproduce-new-machine.js` | 一条命令新机器复现 | 否，除非 `--apply` |
| `scripts/update-runtime-workspace.js` | 已使用 runtime workspace 的安全增量更新 | 只写 plan，完整更新需 `--apply` |
| `scripts/doctor-local.js` | 前置条件检查 | 否 |
| `scripts/healthcheck-local.js` | 仓库/模板检查 | 否 |
| `scripts/healthcheck-runtime.js` | 真实 OpenClaw runtime 形状检查 | 否 |
| `scripts/repro-check.js` | 新机器复现 readiness 检查 | 否 |
| `scripts/generate-workspaces.js` | 生成 workspace 和 shared symlink | 否，除非 `--apply` |
| `scripts/create-task-archive.js` | 从模板创建任务档案 | 否，除非 `--apply` |
| `scripts/register-agents.js` | 预览/执行 `openclaw agents add` | 否，除非 `--apply` |
| `scripts/configure-agent-routing.js` | 输出 routing config patch | 不写真实配置 |
| `scripts/preflight.js` | 发布前 preflight 检查 | 否 |

详见[脚本参考](docs/reference/scripts.zh-CN.md)。

## 仓库结构

```text
openclaw-multi-agent-team/
├── .github/              # CI 和协作模板
├── docs/                 # 用户/开发文档
├── roles/                # main + 岗位 Agent 模板
├── workspace-template/   # 脱敏 main workspace 模板
├── task-templates/       # shared task archive 模板
├── scripts/              # setup/check/reproduction 脚本
├── examples/             # 脱敏示例
├── tests/                # smoke/link 检查
└── dist/                 # 预留生成产物目录
```

详见[目录结构参考](docs/reference/directory-structure.zh-CN.md)。

## 本项目不包含什么

- OpenClaw 本体安装
- 提交到仓库的真实 OpenClaw runtime config
- 提交到仓库的 provider credentials 或 API keys
- Telegram bot tokens
- Gateway tokens
- 真实私有 `MEMORY.md`、`USER.md`、`TOOLS.md`、sessions、transcripts 或 logs
- 子 Agent 自动绑定 Telegram
- OpenClaw 安装或外部渠道 onboarding

## 文档入口

建议从这里开始：

- [文档导航页](docs/index.zh-CN.md)
- [新机器复现指南](docs/getting-started/reproduce-on-new-machine.zh-CN.md)
- [项目概览](docs/concepts/overview.zh-CN.md)
- [路由决策](docs/concepts/routing-decision.zh-CN.md)
- [安全模型](docs/security/security-model.zh-CN.md)
- [开发规范](docs/reference/development-guidelines.zh-CN.md)
- [示例](examples/)
- [发布检查清单](docs/reference/release-checklist.zh-CN.md)
- [Release notes 草稿](docs/reference/release-notes-draft.zh-CN.md)

## 验证

```bash
node scripts/healthcheck-local.js
node tests/smoke/run.js
node scripts/preflight.js
```

GitHub 仓库也会在 push 和 pull request 时运行 CI。

## License

MIT

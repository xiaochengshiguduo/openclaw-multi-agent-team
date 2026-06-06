[English](openclaw-version-policy.md) | 中文

# OpenClaw 版本策略

本项目**不会**安装、升级、降级或锁定 OpenClaw 版本。

`openclaw-multi-agent-team` 的前提是目标机器上已经存在 OpenClaw。它提供角色模板、工作区生成、Agent 注册辅助、路由补丁预览、任务模板、文档和检查。

## 当前策略

- OpenClaw 安装不在本项目范围内。
- OpenClaw 官方入门 / 设置流程仍然是安装和配置 OpenClaw 的事实来源。
- 本项目不保证已安装的 OpenClaw 是最新版本。
- 本项目不会自动更新 OpenClaw。
- 本项目在 dry-run 模式下不会修改真实 OpenClaw 配置或重启 Gateway。
- 专用复现/更新流程只有在清晰 preview 且显式 `--apply` 后，才可以按需重启 Gateway；需要延后重启时，在支持的位置使用 `--no-restart`。

## 已验证的开发版本

本项目使用以下版本开发并在本地测试：

```text
OpenClaw 2026.5.27 (27ae826)
```

这并不表示更旧 / 更新版本无法工作。它只表示这是项目初始创建期间使用的、已知可用的本地参考版本。

## 新机器行为

在已经安装并配置好 OpenClaw 的目标机器上，推荐流程是：

```bash
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw"
node scripts/reproduce-new-machine.js --target "$HOME/.openclaw" --apply
```

检查会调用：

```bash
openclaw --version
```

它们会报告已安装版本，但不会安装或更新 OpenClaw。

## 如果 OpenClaw 已经配置完成

本项目不应覆盖已有的官方设置状态。

预期行为：

- 保留现有 OpenClaw 安装
- 保留现有认证 / 模型 / 渠道配置
- 保留现有面向用户的 `main` 渠道绑定
- 仅在使用 `--apply` 时生成或更新多 Agent 团队工作区文件
- 仅在使用 `register-agents.js --apply` 或 `reproduce-new-machine.js --apply` 时注册角色 Agent
- 完整复现脚本只会在 preview 且显式 `--apply` 后应用项目管理的 Agent 到 Agent 路由；低层配置辅助脚本只输出补丁供审查

如果目标机器上已经存在同名工作区或 Agent，请在应用生成 / 注册前先审查。

## 兼容性预期

v1.1.0 的兼容性预期较为保守：

- 仅支持 Linux
- Node.js 24+
- OpenClaw CLI 必须可用
- OpenClaw 必须支持此工作流使用的隔离 Agent 以及 Agent 到 Agent / 会话工具
- 路由配置字段可能随 OpenClaw 版本变化，必须手动验证

## 为什么不自动安装最新版 OpenClaw？

自动安装最新版听起来很方便，但会带来风险：

- 安装器行为可能在本项目未变化时发生变化
- 最新版本可能引入配置 schema 变更
- 自动安装 / 更新可能影响正在工作的 Gateway
- 认证 / 渠道设置与用户相关，可能需要交互式批准
- 安全回滚超出本项目当前范围

因此，本项目将 OpenClaw 生命周期与团队模板生命周期分离。

## 未来选项

可能的未来改进：

- 兼容性矩阵
- 最低支持 OpenClaw 版本检查
- `--expected-openclaw-version` 参数
- 可选的固定版本安装指南
- 如果稳定且安全，可通过 OpenClaw CLI 自动验证配置 schema

这些都应保持显式，并遵循预览优先。

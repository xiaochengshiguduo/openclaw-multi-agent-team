[English](compatibility.md) | 中文

# 兼容性

## 当前支持矩阵

| 组件 | 支持情况 |
|---|---|
| OS | v1 仅支持 Linux |
| Node.js | 24+ |
| OpenClaw 安装 | 外部 / 官方安装流程 |
| OpenClaw 已验证参考版本 | OpenClaw 2026.5.27 (27ae826) |
| macOS | v1 未测试 / 不支持 |
| WSL | v1 未测试 / 不支持 |
| 原生 Windows | v1 不支持 |
| Telegram 绑定 | 默认仅 `main` |
| Gateway 重启 | 专用复现脚本可在显式 `--apply` 后重启；普通辅助脚本不重启 |
| 配置补丁 | preview-first；仅在显式复现工作流中应用 |

## 兼容性理念

本项目避免控制 OpenClaw 生命周期。它不会安装、更新、降级或锁定 OpenClaw 版本。

本项目只管理可复用的团队制品：

- 角色模板
- 工作区生成
- 任务模板
- 注册命令预览 / 应用
- 显式复现工作流中的路由配置预览 / 应用
- 本地 / 复现检查

## 针对新版 OpenClaw 需要测试的内容

使用不同 OpenClaw 版本时，请验证：

- `openclaw agents add` 参数仍然兼容
- 角色工作区路径可以被接受
- Agent 到 Agent 的配置字段仍然有效
- 会话可见性行为仍然正常
- Gateway 重启和 config apply 语义没有变化
- Telegram 绑定仍然隔离在 `main`

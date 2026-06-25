# 前置条件

首个版本仅支持 Linux。

必需：

- Linux
- Node.js 24+
- 已单独安装 OpenClaw
- shell 访问权限
- 对目标 OpenClaw 工作区根目录的写入权限

运行时步骤的可选条件：

- `PATH` 中可用的 OpenClaw CLI
- 在你自己的 OpenClaw 环境中已配置模型/提供商凭据
- 如果需要 Telegram 访问，仅在 `main` 上绑定 Telegram

独立设置脚本不会安装 OpenClaw、生成令牌、绑定 Telegram，也不会自动重启 Gateway。专用复现/更新流程只能在显式 `--apply` 后重启 Gateway；如需延后重启，在支持的位置使用 `--no-restart`。

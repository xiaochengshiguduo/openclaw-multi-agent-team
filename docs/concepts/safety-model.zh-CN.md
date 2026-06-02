[English](safety-model.md) | 中文

# 安全模型

本项目功能较完整，但安全边界非常严格。

## 默认行为

- 默认 dry-run
- 使用 `--apply` 执行写入
- dry-run 模式不重启 Gateway
- 普通辅助脚本不重启 Gateway
- 专用新机复现脚本只有在显式 `--apply` 后才可以重启 Gateway
- 仓库中不存放真实密钥
- 不存放真实的私有 memory 或 sessions
- 默认不为子 Agent 绑定 Telegram
- `main` 保持为面向用户的入口

## 高风险操作

以下操作需要用户明确确认，且不是默认 dry-run 行为：

- 修改 OpenClaw 配置
- 重启 Gateway
- 绑定 Telegram 或外部渠道
- 覆盖现有 workspace
- 复制用户私有数据

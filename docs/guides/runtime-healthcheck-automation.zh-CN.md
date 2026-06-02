[English](runtime-healthcheck-automation.md) | 中文

# 运行时健康检查自动化

`healthcheck-runtime.js` 是一个只读辅助工具，用于验证真实的 OpenClaw 多 Agent 团队安装。

它通过检查本地文件系统布局，并在可用时检查 OpenClaw CLI/运行时清单，来补充 `scripts/healthcheck-runtime.md` 中的手动 SOP。

## 用法

```bash
node scripts/healthcheck-runtime.js --target "$HOME/.openclaw"
```

JSON 输出：

```bash
node scripts/healthcheck-runtime.js --target "$HOME/.openclaw" --json
```

仅文件系统模式，适用于 OpenClaw CLI 不可用的环境：

```bash
node scripts/healthcheck-runtime.js --target "$HOME/.openclaw" --skip-openclaw
```

不要将 `--skip-openclaw` 用作最终生产验证。它只验证文件和符号链接。

## 检查内容

- Linux 运行时目标
- 目标 OpenClaw 目录存在
- 主工作区存在
- 共享任务归档根目录存在
- 所有共享任务模板存在
- 每个角色工作区存在
- 每个角色工作区都有 `AGENTS.md` 和 `TEAM.md`
- 每个角色工作区都有一个指向主 `workspace/shared` 的 `shared` 符号链接
- OpenClaw CLI 版本，除非已跳过
- `openclaw status`，除非已跳过
- 来自 `openclaw agents list` 的预期 Agent ID，除非已跳过
- 在 `agents list` 输出中可见时，检查子 Agent 上明显面向用户的绑定标记

## 不会执行的操作

- 不写入配置
- 不注册 Agent
- 不重启 Gateway
- 不创建任务归档
- 不向 Agent 发送消息
- 不修改 Telegram/频道绑定
- 不证明模型/提供商认证可用

## 解读结果

脚本会报告以下状态之一：

```text
ok
warning
blocking
```

- `ok`：检查通过。
- `warning`：可能可用，但需要人工关注。
- `blocking`：v1 运行时复现不够完整，不能放心依赖。

如果已安装的 OpenClaw 版本与已知可用的参考版本不同，出现警告是预期情况：

```text
OpenClaw 2026.5.27
```

版本不匹配不会自动视为阻塞，因为本项目不会安装、升级、降级或固定 OpenClaw 版本。

## 与手动 SOP 的关系

两者都要使用：

1. 运行 `healthcheck-runtime.js`，执行自动化的本地/运行时形态检查。
2. 按照 `scripts/healthcheck-runtime.md`，手动验证 Agent 到 Agent 消息，并执行模拟 e2e 演练。

该脚本有意避免发送消息，因为这可能消耗模型调用并与实时运行时状态交互。

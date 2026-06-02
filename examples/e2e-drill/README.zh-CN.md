[English](README.md) | 中文

# E2E 演练示例

这是一个虚构且已脱敏的多智能体任务演练。它展示了预期的协作模式，不包含真实用户数据、令牌、会话或外部副作用。

## 流程

1. `main` 创建任务归档。
2. `main` 写入 `brief.md` 和 `plan.md`。
3. `main` 请求 `pm` 澄清需求。
4. `main` 请求 `reviewer` 审查风险。
5. `main` 汇总生成 `final.md`。

## 文件

- `brief.md`：虚构用户请求。
- `plan.md`：main 的路由计划。
- `pm.md`：PM 输出。
- `reviewer.md`：reviewer 输出。
- `final.md`：最终汇总。

## 安全

不包含真实 Telegram ID、会话 ID、路径、令牌、私有记忆或运行时配置。

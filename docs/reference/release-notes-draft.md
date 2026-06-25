# 发布说明草稿

`v1.1.0` 发布说明草稿。创建 GitHub Release 前请先审查。

## v1.1.0 — Runtime 更新与 preflight 完善

`openclaw-multi-agent-team` 是一个面向 OpenClaw 的、可复现、长期存在的多 Agent 软件团队模板。

### 亮点

- `main` Supervisor 是唯一面向用户的入口。
- 10 个长期存在的角色 Agent 模板：PM、Architect、Backend、Frontend、QA、Reviewer、Security、DevOps、Docs 和 Research。
- 独立角色工作区，通过共享任务归档连接。
- 安全的设置脚本，默认 dry-run，并通过显式 `--apply` 执行写入。
- 仅预览的 OpenClaw 路由配置补丁生成。
- 本地、复现、预检和运行时健康检查。
- 已脱敏示例和任务生命周期模板。
- 英文 / 中文 README 入口，以及核心文档的语言切换。
- 使用 Node 24 和当前 GitHub Actions 运行时的 GitHub CI。

### 安全边界

此版本不包含也不会修改：

- 真实 OpenClaw 配置
- token 或认证配置
- Telegram bot token
- Gateway token
- 私有记忆、会话、转录记录或任务归档
- 专用复现/更新流程之外的自动 Gateway 重启
- 显式 `--apply` 复现工作流之外的自动生产配置变更
- 子 Agent Telegram 绑定

### 发布前验证

预期最终关卡：

- 本地健康检查通过
- 冒烟测试通过
- 预检通过
- 干净克隆回归通过
- 敏感 / 私有数据扫描通过
- GitHub CI 通过

### 已知限制

- v1 仅支持 Linux。
- OpenClaw 安装不在范围内。Provider 凭据仅作为本机输入使用，绝不提交；复现脚本可在 preview 和显式 `--apply` 后使用它们配置项目管理的 provider 设置。
- 基于运行时消息的全角色健康检查仍然是手动 / SOP 驱动。
- 低层配置辅助脚本按设计保持 preview / manual。

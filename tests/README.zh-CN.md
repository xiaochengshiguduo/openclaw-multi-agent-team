[English](README.md) | 中文

# 测试

在仓库根目录运行全部 smoke tests：

```bash
node tests/smoke/run.js
```

smoke suite 覆盖文档结构和本地工作流约定，包括：

- Markdown links 与中英文页面配对。
- 角色协议、检查清单、路由决策和团队分发约定。
- workspace 生成、Agent 注册、任务档案创建、bootstrap、runtime workspace 更新的 dry-run/apply fixture。
- 本地健康检查与命令形状检查，确保辅助脚本保持 preview-first，并适合 CI 运行。

这些测试不会调用外部服务、修改真实 OpenClaw runtime config，也不会重启 Gateway。

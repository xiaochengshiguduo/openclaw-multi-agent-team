[English](run-healthchecks.md) | 中文

# 运行健康检查

## 本地健康检查

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
```

本地检查不会修改文件、调用外部服务或重启 Gateway。

## 运行时健康检查

在完成 Agent 注册、路由配置，并在需要时手动重启 Gateway 之后，按照以下文档操作：

```text
scripts/healthcheck-runtime.md
```

运行时检查会验证 `main` 能否访问各角色 Agent，以及角色 Agent 能否读取共享任务归档。

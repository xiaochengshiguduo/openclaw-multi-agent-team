# 健康检查示例

此示例展示本地健康检查和运行时健康检查之间的区别。

## 本地

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
```

本地检查会检查文件、模板、平台以及符号链接能力。

## 运行时

运行时检查在完成真实 OpenClaw 设置后进行，并遵循 `scripts/healthcheck-runtime.md`。

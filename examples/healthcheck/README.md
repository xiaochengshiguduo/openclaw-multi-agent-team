English | [中文](README.zh-CN.md)

# Healthcheck Example

This example shows the distinction between local and runtime healthchecks.

## Local

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
```

Local checks inspect files, templates, platform, and symlink capability.

## Runtime

Runtime checks happen after real OpenClaw setup and follow `scripts/healthcheck-runtime.md`.

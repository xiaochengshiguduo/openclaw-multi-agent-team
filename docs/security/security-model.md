English | [中文](security-model.zh-CN.md)

# Security Model

This repository must never contain real OpenClaw runtime state or private user data.

## Never commit

- `openclaw.json` or backups
- API keys or model provider tokens
- Telegram bot tokens
- Gateway tokens
- auth profiles
- sessions or transcripts
- logs containing secrets
- real `MEMORY.md`
- private `USER.md`
- private `TOOLS.md`
- private task archives

## Script rules

- Write-capable scripts default to dry-run.
- `--apply` is required for writes, command execution, config mutation, or Gateway restart.
- Config helpers are preview-first.
- Lower-level helper scripts do not restart Gateway.
- Dedicated reproduction/update workflows may restart Gateway after explicit `--apply` so validated routing config or managed runtime updates are loaded; use `--no-restart` where supported to defer restart.
- Sub-agents are not bound to Telegram by default.

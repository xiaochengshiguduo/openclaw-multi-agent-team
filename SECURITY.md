English | [中文](SECURITY.zh-CN.md)

# Security Policy

This project must never include real OpenClaw runtime secrets or private user data.

## Do not commit

- OpenClaw config files: `openclaw.json`, `openclaw.json.*`
- API keys, model keys, Telegram bot tokens, Gateway tokens
- auth profiles, sessions, logs, transcripts
- real `MEMORY.md`, private `USER.md`, private `TOOLS.md`
- private task archives
- SSH keys, cloud credentials, `.env` files

## Script safety rules

- Write-capable scripts default to dry-run.
- `--apply` is required for writes.
- Gateway restart is never automatic.
- Agent registration/config helpers must preview changes before applying them.
- Sub-agents are not bound to Telegram by default.

## Supported platform

First version: Linux only.

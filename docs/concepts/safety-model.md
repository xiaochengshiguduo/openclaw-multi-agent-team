# Safety Model

This project is comprehensive, but safety boundaries are strict.

## Defaults

- dry-run by default
- `--apply` for writes
- no Gateway restart in dry-run mode
- lower-level helper scripts do not restart Gateway
- dedicated reproduction/update workflows may restart Gateway only after explicit `--apply`; use `--no-restart` where supported to defer restart
- no real secrets in repository
- no real private memory or sessions
- no Telegram binding for sub-agents by default
- `main` remains the user-facing entrypoint

## High-risk operations

These require explicit user confirmation and are not default dry-run behavior:

- modifying OpenClaw config
- restarting Gateway
- binding Telegram or external channels
- overwriting existing workspaces
- copying private user data

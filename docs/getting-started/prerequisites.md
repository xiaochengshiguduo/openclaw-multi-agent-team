# Prerequisites

First version supports Linux only.

Required:

- Linux
- Node.js 24+
- OpenClaw installed separately
- shell access
- permission to write the target OpenClaw workspace root

Optional for runtime steps:

- OpenClaw CLI in `PATH`
- configured model/provider credentials in your own OpenClaw environment
- Telegram binding on `main` only, if you want Telegram access

Standalone setup scripts do not install OpenClaw, generate tokens, bind Telegram, or restart Gateway automatically. Dedicated reproduction/update workflows may restart Gateway only after explicit `--apply`; use `--no-restart` where supported if you need to defer restart.

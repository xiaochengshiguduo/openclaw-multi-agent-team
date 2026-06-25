# Create a New Team

This guide creates local Linux workspaces only. It does not modify OpenClaw config or restart Gateway.

```bash
node scripts/generate-workspaces.js --target "$HOME/.openclaw"
```

Review output. Then:

```bash
node scripts/generate-workspaces.js --target "$HOME/.openclaw" --apply
```

Generated layout:

```text
~/.openclaw/workspace
~/.openclaw/workspace-pm
~/.openclaw/workspace-architect
...
```

Role workspaces contain a `shared` symlink to the main workspace shared directory.

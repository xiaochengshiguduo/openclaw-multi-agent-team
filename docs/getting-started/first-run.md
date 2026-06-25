# First Run

Preview workspace generation:

```bash
node scripts/generate-workspaces.js --target "$HOME/.openclaw"
```

Apply after reviewing the plan:

```bash
node scripts/generate-workspaces.js --target "$HOME/.openclaw" --apply
```

Run local healthcheck:

```bash
node scripts/healthcheck-local.js
```

Preview agent registration:

```bash
node scripts/register-agents.js --target "$HOME/.openclaw" --model gpt/gpt-5.5
```

Preview agent-to-agent config patch:

```bash
node scripts/configure-agent-routing.js
```

These commands are previews only. Review generated registration/config changes before running the corresponding `--apply` or `openclaw config patch` step.

Runtime validation is documented in `scripts/healthcheck-runtime.md`.

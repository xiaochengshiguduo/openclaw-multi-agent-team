# Run Healthchecks

## Local healthcheck

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
```

Local checks do not modify files, call external services, or restart Gateway.

## Runtime healthcheck

After agent registration, routing config, and manual Gateway restart if required, follow:

```text
scripts/healthcheck-runtime.md
```

Runtime checks validate that `main` can reach role Agents and that role Agents can read shared task archives.

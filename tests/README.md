# Tests

Run all smoke tests from the repository root:

```bash
node tests/smoke/run.js
```

The smoke suite covers documentation structure and local workflow contracts, including:

- Markdown links and English/Chinese page pairing.
- Role protocol, checklist, routing-decision, and team-dispatch conventions.
- Dry-run/apply fixtures for workspace generation, agent registration, task archive creation, bootstrap, and runtime workspace updates.
- Local healthcheck and command-shape checks that keep helpers preview-first and safe for CI.

These tests do not call external services, change real OpenClaw runtime config, or restart Gateway.

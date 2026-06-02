English | [中文](README.zh-CN.md)

# Examples

Sanitized examples for understanding how the OpenClaw multi-agent team is expected to be generated, checked, and used.

These examples are intentionally safe:

- no real OpenClaw config
- no tokens or auth profiles
- no private memories or sessions
- no real user task archives
- no Gateway restart commands

## Start here

| Example | Purpose |
|---|---|
| [Minimal team](minimal-team/) | smallest useful team shape |
| [Full software team](full-software-team/) | complete 11-Agent team layout |
| [Task lifecycle](task-lifecycle/) | example task archive flow |
| [E2E drill](e2e-drill/) | fake multi-agent rehearsal archive |
| [Agent-to-agent](agent-to-agent/) | expected read-only Agent interaction outputs |
| [Healthcheck](healthcheck/) | sample local/runtime healthcheck outputs |
| [Commands](commands/) | copyable dry-run/apply command examples |
| [Config](config/) | sanitized config patch examples |

## Recommended learning path

1. Read [Minimal team](minimal-team/).
2. Compare with [Full software team](full-software-team/).
3. Review [Task lifecycle](task-lifecycle/).
4. Run local checks using [Commands](commands/).
5. Use [Healthcheck](healthcheck/) to compare expected output.

## Safety note

Treat every example as illustrative. Review scripts and generated files before applying them to a real OpenClaw runtime.

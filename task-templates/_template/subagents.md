# Subagents

Track every child agent used by this task so main can recover after runtime events, compacting, or missed completion callbacks.

## Policy

- Important or cross-turn tasks default to `cleanup: keep`.
- Use `cleanup: delete` only for lightweight child work whose result is already captured or not needed for recovery.
- Before `sessions_yield`, update `status.md` to `waiting-agent` and list the taskNames below.
- After runtime event / compact, main must run recovery lookup before assuming a child result is unavailable.
- Clean up child sessions only after outputs are archived and final integration is complete.
- Default: omit `model` in sessions_spawn; rely on OpenClaw config/agent defaults.
- Record model + reason when explicitly overriding (user request, task/protocol requirement, or incident mitigation).

## Agent Registry

| taskName | role | label/session hint | model | model reason | cleanup | status | spawned at | expected output | result path |
|---|---|---|---|---|---|---|---|---|---|
| example_review | reviewer | label: example-review | (default) | - | keep | planned | YYYY-MM-DD HH:mm TZ | review risks and evidence | review.md |

Status values:

```text
planned | running | waiting | completed | recovered | failed | archived | cancelled
```

Model reason examples:

```text
- | user requested ddgpt | task protocol requires gpt-5 | fallback: default model rate-limited
```

## Recovery Log

| Time | taskName | lookup method | outcome | archived path | notes |
|---|---|---|---|---|---|
| YYYY-MM-DD HH:mm TZ | example_review | subagents list / sessions_list / sessions_history | recovered | review.md | ... |

## Cleanup Log

| Time | taskName | cleanup action | reason |
|---|---|---|---|
| YYYY-MM-DD HH:mm TZ | example_review | kept / removed | output archived and no longer needed |

# Subagents

记录本任务使用的每个 child agent，确保 main 能在 runtime events、compact 或 missed completion callbacks 后恢复。

## Policy

- 重要或跨 turn 任务默认使用 `cleanup: keep`。
- 只有在轻量 child work 的结果已经捕获，或不再需要恢复时，才使用 `cleanup: delete`。
- 在 `sessions_yield` 前，将 `status.md` 更新为 `waiting-agent`，并在下方列出 taskNames。
- runtime event / compact 之后，main 必须执行 recovery lookup，不要直接假设 child result 不可用。
- 只有在输出已归档且 final integration 完成后，才清理 child sessions。
## Agent Registry

| taskName | role | label/session hint | cleanup | status | spawned at | expected output | result path |
|---|---|---|---|---|---|---|---|
| example_review | reviewer | label: example-review | keep | planned | YYYY-MM-DD HH:mm TZ | review risks and evidence | review.md |

Status values:

```text
planned | running | waiting | completed | recovered | failed | archived | cancelled
```

## Recovery Log

| Time | taskName | lookup method | outcome | archived path | notes |
|---|---|---|---|---|---|
| YYYY-MM-DD HH:mm TZ | example_review | subagents list / sessions_list / sessions_history | recovered | review.md | ... |

## Cleanup Log

| Time | taskName | cleanup action | reason |
|---|---|---|---|
| YYYY-MM-DD HH:mm TZ | example_review | kept / removed | output archived and no longer needed |

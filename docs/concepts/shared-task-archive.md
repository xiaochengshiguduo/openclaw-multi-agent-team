# Shared Task Archive

The shared task archive is the durable source of truth for multi-agent work.

```text
shared/tasks/
├── _template/
└── TASK-YYYYMMDD-HHMM-slug/
```

`main` owns the archive. Role Agents default to read-only access unless a task brief explicitly authorizes writing.

Recommended task files:

```text
metadata.md
routing.md
status.md
brief.md
plan.md
pm.md
architecture.md
backend.md
frontend.md
qa.md
review.md
security.md
devops.md
docs.md
research.md
final.md
```

`routing.md` records whether `main` may complete the task directly or must enter the Multi-Agent workflow. It is required for archived Multi-Agent work. See [Routing decision](routing-decision.md).

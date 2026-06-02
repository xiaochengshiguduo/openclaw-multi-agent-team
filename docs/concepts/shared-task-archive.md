English | [中文](shared-task-archive.zh-CN.md)

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

`routing.md` records why `main` selected direct work, one specialist, a full multi-agent archive, or a high-risk review overlay. It is required for Level 3 multi-agent work and non-trivial Level 4 work. See [Routing decision](routing-decision.md).

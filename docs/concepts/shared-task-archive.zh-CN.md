[English](shared-task-archive.md) | 中文

# 共享任务归档

共享任务归档是多 Agent 工作的持久事实来源。

```text
shared/tasks/
├── _template/
└── TASK-YYYYMMDD-HHMM-slug/
```

`main` 负责归档。除非任务简报明确授权写入，否则角色 Agent 默认只有只读访问权限。

推荐的任务文件：

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

`routing.md` 记录 `main` 是否可以直接完成任务，还是必须进入 Multi-Agent 流程。归档的 Multi-Agent 工作必须包含它。参见[路由决策](routing-decision.zh-CN.md)。

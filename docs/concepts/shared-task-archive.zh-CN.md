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

`routing.md` 记录 `main` 为什么选择直接处理、一个专家、完整多 Agent 档案或高风险审查叠加层。Level 3 多 Agent 工作和非简单 Level 4 工作必须包含它。参见[路由决策](routing-decision.zh-CN.md)。

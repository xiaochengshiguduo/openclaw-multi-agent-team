[English](task-template.md) | 中文

# 任务模板

任务模板位于：

```text
task-templates/_template/
```

它们会复制到：

```text
<OPENCLAW_HOME>/workspace/shared/tasks/_template/
```

`create-task-archive.js` 目前会复制核心任务文件：

- `metadata.md`
- `routing.md`
- `status.md`
- `brief.md`
- `plan.md`

`routing.md` 说明 `main` 为什么选择直接处理、一个专家、完整多 Agent 协作或高风险审查叠加层。

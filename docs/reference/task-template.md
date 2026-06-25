# Task Template

Task templates live in:

```text
task-templates/_template/
```

They are copied to:

```text
<OPENCLAW_HOME>/workspace/shared/tasks/_template/
```

`create-task-archive.js` currently copies the core task files:

- `metadata.md`
- `routing.md`
- `status.md`
- `brief.md`
- `plan.md`

`routing.md` explains why `main` selected direct work, one specialist, full multi-agent coordination, or a high-risk review overlay.

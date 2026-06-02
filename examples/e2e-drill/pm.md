English | [中文](pm.zh-CN.md)

# PM Output

## Scope

Build a local-only helper that creates a task archive directory and copies core templates.

## Acceptance Criteria

- `--help` works.
- Dry-run does not write.
- `--apply` creates the target archive.
- Invalid slugs are rejected.
- Existing target is not overwritten.

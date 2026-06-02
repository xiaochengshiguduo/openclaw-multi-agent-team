English | [中文](README.zh-CN.md)

# E2E Drill Example

This is a fake, sanitized multi-agent task rehearsal. It demonstrates the intended collaboration pattern without real user data, tokens, sessions, or external side effects.

## Flow

1. `main` creates a task archive.
2. `main` writes `brief.md` and `plan.md`.
3. `main` asks `pm` to clarify requirements.
4. `main` asks `reviewer` to review risks.
5. `main` synthesizes `final.md`.

## Files

- `brief.md`: fake user request.
- `plan.md`: main's routing plan.
- `pm.md`: PM output.
- `reviewer.md`: reviewer output.
- `final.md`: final synthesis.

## Safety

No real Telegram IDs, session IDs, paths, tokens, private memory, or runtime config are included.

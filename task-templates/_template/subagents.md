# Subagents

Track child agents spawned during this task for coordination, depth management, and result flow visibility.

## Architecture

This task uses OpenClaw's subagent announce chain:

- **Depth 0 (main):** Task owner, only user-facing agent
- **Depth 1:** Direct children of main (orchestrators or workers)
- **Depth 2:** Workers spawned by depth-1 orchestrators

Depth-2 worker results flow via internal injection (`deliver=false`) to their depth-1 parent, preventing Telegram spam.

## Spawned Agents

| taskName | role | depth | parent | status | spawned at | output location |
|---|---|---|---|---|---|---|
| backend_api | backend | 2 | tech_lead_coord | completed | YYYY-MM-DD HH:mm TZ | backend.md |
| frontend_ui | frontend | 2 | tech_lead_coord | completed | YYYY-MM-DD HH:mm TZ | frontend.md |
| tech_lead_coord | architect | 1 | main | completed | YYYY-MM-DD HH:mm TZ | architecture.md |

Status values: `planned | running | completed | failed | cancelled`

**Depth management:**

- If main spawns workers directly → depth-1, announce to main
- If main spawns orchestrator → orchestrator is depth-1, spawns depth-2 workers
- Workers receive task via `[Subagent Task]` in their first message
- Results flow: worker → (orchestrator) → main → user

## Completion Flow

When all expected children complete:

1. Depth-2 workers announce to their depth-1 orchestrator (internal injection)
2. Orchestrator synthesizes results, announces to main
3. main integrates orchestrator output, delivers to user

## Notes

- Use `sessions_yield` after spawning to wait for completion events
- Completion events arrive as runtime messages, not via polling
- `subagents list` shows active/recent children for this session
- Child outputs are in task archive under role-specific files

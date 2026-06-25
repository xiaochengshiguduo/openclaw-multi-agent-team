English | [中文](subagent-architecture.zh-CN.md)

# Subagent Architecture

OpenClaw's native subagent announce chain enables stable multi-agent orchestration with nested depth levels.

## Architecture Overview

```
User ↔ main (depth-0, user-facing entry)
         ↓ sessions_spawn
    Orchestrator (depth-1, optional coordinator)
         ↓ sessions_spawn
    Workers (depth-2, specialized roles)
         ↓ announce (deliver=false, internal injection)
    Orchestrator synthesizes
         ↓ announce
    main integrates
         ↓ deliver
    User receives final result
```

## Key Principles

**1. Stable result flow via announce chain**

- Worker (depth-2) results use `deliver=false` internal injection to orchestrator
- No reliance on turn-limited ping-pong messaging
- Push-based completion events, no polling needed

**2. No Telegram spam from workers**

- Only main (depth-0) delivers to user's Telegram
- Worker results stay internal until synthesized by orchestrator or main

**3. Configurable orchestration**

- Simple tasks: main spawns workers directly (depth-1)
- Complex tasks: main spawns orchestrator → orchestrator spawns workers (depth-2)

## Configuration

Add to `~/.openclaw/openclaw.json`:

```json5
{
  "agents": {
    "defaults": {
      "subagents": {
        "maxSpawnDepth": 2,          // Enable nested orchestrator pattern
        "maxChildrenPerAgent": 6,    // Limit fan-out per orchestrator
        "maxConcurrent": 8,          // Total concurrent subagent runs
        "delegationMode": "suggest"  // Prompt guidance
      }
    },
    "list": [{
      "id": "main",
      "subagents": {
        "allowAgents": ["pm", "architect", "backend", "frontend", "qa", "reviewer", "security", "devops", "docs", "research"],
        "delegationMode": "prefer"
      }
    }]
  },
  "tools": {
    "sessions": {
      "visibility": "all"  // Allow cross-session inspection
    }
  }
}
```

## Usage Pattern

**From main:**

```javascript
// Simple task: spawn workers directly (depth-1)
sessions_spawn({
  task: "Review security of login endpoint",
  taskName: "security_review",
  agentId: "security",
  model: "anthropic/claude-opus-4-6"
});

sessions_yield(); // Wait for completion event
```

**Orchestrator pattern:**

```javascript
// Complex task: spawn orchestrator first
sessions_spawn({
  task: "Coordinate backend + frontend + QA for new feature",
  taskName: "feature_coord",
  agentId: "architect",  // architect acts as orchestrator
  model: "anthropic/claude-opus-4-6"
});

// Orchestrator then spawns workers (depth-2)
// Worker results flow via internal injection to orchestrator
// Orchestrator synthesizes and announces to main
```

## Comparison with Legacy A2A

This architecture replaces the legacy agent-to-agent (A2A) `sessions_send` pattern:

| Aspect | Legacy A2A | Subagent Announce Chain |
|---|---|---|
| Result delivery | `sessions_send` + `maxPingPongTurns` limit | Announce chain, no turn limit |
| Stability | Results dropped when turn limit exceeded | Push-based, reliable delivery |
| Recovery | Required manual recovery protocols | Built-in runtime event management |
| Telegram spam | Workers could message user directly | Only main delivers to user |
| Configuration | `session.agentToAgent.maxPingPongTurns` | `agents.defaults.subagents.maxSpawnDepth` |

## When to Use Orchestrator (Depth-2)

**Use orchestrator pattern when:**

- Task requires 3+ parallel workers
- Workers need coordination or conflict resolution
- Results need synthesis before user delivery
- Example: "Build login feature" → architect coordinates backend + frontend + security + QA

**Spawn directly when:**

- Simple 1-2 worker tasks
- Workers produce independent outputs
- No synthesis needed
- Example: "Review this code" → spawn reviewer directly

## Further Reading

- [OpenClaw Subagents Documentation](https://docs.openclaw.ai/tools/subagents)
- [Session Tools](https://docs.openclaw.ai/concepts/session-tool)
- [Multi-Agent Patterns](/docs/guides/multi-agent-patterns.md)

'use strict';

/**
 * Generate subagent policy patch for multi-agent team with nested orchestrator architecture.
 * 
 * Architecture:
 * - main (depth-0): only user-facing entry point
 * - Optional orchestrator agents (depth-1): can spawn workers, synthesize results
 * - Worker agents (depth-2): specialized roles, results flow via internal injection
 * 
 * Worker results use deliver=false announce to orchestrator, preventing Telegram spam.
 */
function subagentPolicyPatch(roles) {
  const roleAgents = roles.filter((role) => role !== 'main');
  
  return {
    agents: {
      defaults: {
        subagents: {
          maxSpawnDepth: 2,           // Allow orchestrators to spawn workers
          maxChildrenPerAgent: 6,     // Each orchestrator can spawn up to 6 workers
          maxConcurrent: 8,           // Up to 8 concurrent subagent runs
          delegationMode: 'suggest'   // Prompt guidance for delegation
        }
      },
      list: [{
        id: 'main',
        subagents: {
          allowAgents: roleAgents,    // main can spawn any role agent
          delegationMode: 'prefer'    // main should delegate complex work
        }
      }]
    },
    tools: {
      sessions: {
        visibility: 'all'             // Allow cross-session inspection for coordination
      }
    }
  };
}

module.exports = { subagentPolicyPatch };

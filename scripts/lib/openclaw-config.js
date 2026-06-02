'use strict';

function agentToAgentPatch(roles) {
  const roleAgents = roles.filter((role) => role !== 'main');
  return {
    agents: {
      list: [{
        id: 'main',
        subagents: {
          allowAgents: roleAgents
        }
      }]
    },
    tools: {
      agentToAgent: {
        enabled: true,
        allow: roles
      },
      sessions: {
        visibility: 'all'
      }
    },
    session: {
      agentToAgent: {
        maxPingPongTurns: 2
      }
    }
  };
}

module.exports = { agentToAgentPatch };

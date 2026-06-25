#!/usr/bin/env node
'use strict';

const { mergeOpenClawConfig, mergeAgentList, mergeProviders } = require('../../scripts/lib/config-merger');
const { subagentPolicyPatch } = require('../../scripts/lib/openclaw-config');

let failures = 0;
function assert(cond, msg) {
  if (!cond) { console.error('FAIL: ' + msg); failures += 1; }
}

const ROLES = ['main', 'pm', 'architect', 'backend', 'frontend', 'qa', 'reviewer', 'security', 'devops', 'docs', 'research'];
const template = subagentPolicyPatch(ROLES);

// Test 1: API keys are preserved
{
  const existing = {
    models: {
      providers: {
        myprovider: { baseUrl: 'https://api.example.com', api: 'openai-completions', apiKey: 'sk-SECRET-USER-KEY' }
      }
    }
  };
  const { merged } = mergeOpenClawConfig(existing, template);
  assert(merged.models.providers.myprovider.apiKey === 'sk-SECRET-USER-KEY', 'user API key preserved');
}

// Test 2: Existing agents are not blind-overwritten
{
  const existing = {
    agents: {
      list: [
        { id: 'main', model: { primary: 'user/custom-model' }, customField: 'keep-me' },
        { id: 'my-personal-agent', workspace: '/home/user/special' }
      ]
    }
  };
  const { merged } = mergeOpenClawConfig(existing, template);
  const main = merged.agents.list.find(a => a.id === 'main');
  assert(main.customField === 'keep-me', 'user custom field on main preserved');
  assert(main.model?.primary === 'user/custom-model', 'user model on main preserved');
  assert(main.subagents?.allowAgents?.includes('backend'), 'team subagent policy merged into main');
  const personal = merged.agents.list.find(a => a.id === 'my-personal-agent');
  assert(personal && personal.workspace === '/home/user/special', 'unrelated user agent preserved');
}

// Test 3: subagent policy (maxSpawnDepth) is applied
{
  const { merged } = mergeOpenClawConfig({}, template);
  assert(merged.agents.defaults.subagents.maxSpawnDepth === 2, 'maxSpawnDepth applied');
}

// Test 4: Legacy A2A config triggers a warning
{
  const existing = {
    tools: { agentToAgent: { enabled: true } },
    session: { agentToAgent: { maxPingPongTurns: 2 } }
  };
  const { warnings } = mergeOpenClawConfig(existing, template);
  assert(warnings.some(w => w.includes('tools.agentToAgent')), 'warns about legacy tools.agentToAgent');
  assert(warnings.some(w => w.includes('session.agentToAgent')), 'warns about legacy session.agentToAgent ping-pong');
}

// Test 5: allowAgents union (not overwrite)
{
  const existing = {
    agents: { list: [{ id: 'main', subagents: { allowAgents: ['my-extra-agent'] } }] }
  };
  const { merged } = mergeOpenClawConfig(existing, template);
  const main = merged.agents.list.find(a => a.id === 'main');
  assert(main.subagents.allowAgents.includes('my-extra-agent'), 'user allowAgents entry preserved');
  assert(main.subagents.allowAgents.includes('backend'), 'team allowAgents entry added');
}

// Test 6: empty existing config produces valid merged config
{
  const { merged } = mergeOpenClawConfig({}, template);
  assert(merged.agents.list.some(a => a.id === 'main'), 'main agent present in fresh install');
  assert(merged.tools.sessions.visibility === 'all', 'sessions visibility set');
}

// Test 7: provider merge - existing wins, template adds missing
{
  const existing = { models: { providers: { foo: { apiKey: 'keep' } } } };
  const plan = [];
  const result = mergeProviders(existing.models.providers, { foo: { apiKey: 'OVERWRITE' }, bar: { apiKey: 'new' } }, plan);
  assert(result.foo.apiKey === 'keep', 'existing provider wins over template');
  assert(result.bar.apiKey === 'new', 'template provider added when missing');
}

if (failures) { console.error(`\n${failures} assertion(s) failed`); process.exit(1); }
console.log('ok config-merger smoke');

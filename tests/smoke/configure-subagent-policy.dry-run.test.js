#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..', '..');
const output = path.join(fs.mkdtempSync('/tmp/oc-mat-subagent-smoke-'), 'subagent.patch.json');

function run(argv, opts = {}) {
  const r = spawnSync(process.execPath, [path.join(root, 'scripts', 'configure-subagent-policy.js'), ...argv], { encoding: 'utf8' });
  if (opts.expectFailure) {
    if (r.status === 0) throw new Error('configure-subagent-policy --apply unexpectedly succeeded');
    return r;
  }
  if (r.status !== 0) {
    console.error(r.stdout || '');
    console.error(r.stderr || '');
    process.exit(r.status || 1);
  }
  return r;
}

try {
  const preview = run([]);
  const patch = JSON.parse(preview.stdout);
  
  // Check subagent defaults
  if (!patch.agents?.defaults?.subagents) throw new Error('agents.defaults.subagents missing from patch');
  if (patch.agents.defaults.subagents.maxSpawnDepth !== 2) throw new Error('maxSpawnDepth must be 2 for orchestrator pattern');
  if (!patch.agents.defaults.subagents.maxChildrenPerAgent) throw new Error('maxChildrenPerAgent missing');
  if (!patch.agents.defaults.subagents.maxConcurrent) throw new Error('maxConcurrent missing');
  
  // Check main allowAgents
  if (!patch.agents?.list?.some((agent) => agent.id === 'main' && Array.isArray(agent.subagents?.allowAgents))) {
    throw new Error('main subagents.allowAgents missing from patch');
  }
  const mainPatch = patch.agents.list.find((agent) => agent.id === 'main');
  if (mainPatch.subagents.allowAgents.includes('main')) throw new Error('main must not be listed as its own role subagent');
  if (!mainPatch.subagents.allowAgents.includes('pm')) throw new Error('pm missing from main subagent allow list');
  if (!mainPatch.subagents.allowAgents.includes('reviewer')) throw new Error('reviewer missing from main subagent allow list');
  
  // Check sessions visibility (no A2A config)
  if (patch.tools?.agentToAgent) throw new Error('Legacy agentToAgent config should not be present in subagent architecture');
  if (!patch.tools?.sessions?.visibility) throw new Error('tools.sessions.visibility missing');
  
  // Check session.agentToAgent is removed
  if (patch.session?.agentToAgent) throw new Error('session.agentToAgent (legacy A2A ping-pong) should not be present');
  
  run(['--output', output]);
  if (!fs.existsSync(output)) throw new Error('preview output file was not written');
  const refusal = run(['--apply'], { expectFailure: true });
  if (!refusal.stderr.includes('Refusing to modify OpenClaw config automatically')) throw new Error('missing apply refusal message');
  console.log('ok configure-subagent-policy.dry-run smoke');
} finally {
  fs.rmSync(path.dirname(output), { recursive: true, force: true });
}

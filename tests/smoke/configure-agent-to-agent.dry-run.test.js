#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..', '..');
const output = path.join(fs.mkdtempSync('/tmp/oc-mat-routing-smoke-'), 'routing.patch.json');

function run(argv, opts = {}) {
  const r = spawnSync(process.execPath, [path.join(root, 'scripts', 'configure-agent-routing.js'), ...argv], { encoding: 'utf8' });
  if (opts.expectFailure) {
    if (r.status === 0) throw new Error('configure-agent-routing --apply unexpectedly succeeded');
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
  if (!patch.agents?.list?.some((agent) => agent.id === 'main' && Array.isArray(agent.subagents?.allowAgents))) {
    throw new Error('main subagent allowAgents missing from routing patch');
  }
  const mainPatch = patch.agents.list.find((agent) => agent.id === 'main');
  if (mainPatch.subagents.allowAgents.includes('main')) throw new Error('main must not be listed as its own role subagent');
  if (!mainPatch.subagents.allowAgents.includes('pm')) throw new Error('pm missing from main subagent allow list');
  if (!mainPatch.subagents.allowAgents.includes('reviewer')) throw new Error('reviewer missing from main subagent allow list');
  if (!patch.tools?.agentToAgent?.enabled) throw new Error('A2A routing is not enabled in preview patch');
  if (!patch.tools.agentToAgent.allow.includes('main')) throw new Error('main missing from A2A allow list');
  if (!patch.tools.agentToAgent.allow.includes('research')) throw new Error('research missing from A2A allow list');
  run(['--output', output]);
  if (!fs.existsSync(output)) throw new Error('preview output file was not written');
  const refusal = run(['--apply'], { expectFailure: true });
  if (!refusal.stderr.includes('Refusing to modify OpenClaw config automatically')) throw new Error('missing apply refusal message');
  console.log('ok configure-agent-to-agent.dry-run smoke');
} finally {
  fs.rmSync(path.dirname(output), { recursive: true, force: true });
}

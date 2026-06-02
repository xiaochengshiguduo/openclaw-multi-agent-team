#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..', '..');
const target = fs.mkdtempSync('/tmp/oc-mat-generate-smoke-');

function run(argv) {
  const r = spawnSync(process.execPath, [path.join(root, 'scripts', 'generate-workspaces.js'), ...argv], { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(r.stdout || '');
    console.error(r.stderr || '');
    process.exit(r.status || 1);
  }
  return r;
}

try {
  run(['--target', target]);
  if (fs.existsSync(path.join(target, 'workspace'))) throw new Error('dry-run wrote workspace files');
  run(['--target', target, '--apply']);
  for (const required of [
    path.join(target, 'workspace', 'AGENTS.md'),
    path.join(target, 'workspace-pm', 'AGENTS.md'),
    path.join(target, 'workspace', 'shared', 'tasks', '_template', 'brief.md')
  ]) {
    if (!fs.existsSync(required)) throw new Error(`missing generated file: ${required}`);
  }
  console.log('ok generate-agent-workspaces smoke');
} finally {
  fs.rmSync(target, { recursive: true, force: true });
}

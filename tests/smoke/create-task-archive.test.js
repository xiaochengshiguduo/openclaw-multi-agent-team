#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..', '..');
const tasksRoot = path.join(fs.mkdtempSync('/tmp/oc-mat-task-smoke-'), 'tasks');

function run(argv) {
  const r = spawnSync(process.execPath, [path.join(root, 'scripts', 'create-task-archive.js'), ...argv], { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(r.stdout || '');
    console.error(r.stderr || '');
    process.exit(r.status || 1);
  }
  return r;
}

try {
  run(['--slug', 'smoke-test', '--tasks-root', tasksRoot]);
  if (fs.existsSync(tasksRoot)) throw new Error('dry-run wrote task archive');
  run(['--slug', 'smoke-test', '--tasks-root', tasksRoot, '--apply']);
  const dirs = fs.readdirSync(tasksRoot);
  if (dirs.length !== 1) throw new Error('expected exactly one task archive');
  for (const file of ['metadata.md', 'routing.md', 'status.md', 'brief.md', 'plan.md', 'subagents.md']) {
    if (!fs.existsSync(path.join(tasksRoot, dirs[0], file))) throw new Error(`missing task file: ${file}`);
  }
  console.log('ok create-task-archive smoke');
} finally {
  fs.rmSync(path.dirname(tasksRoot), { recursive: true, force: true });
}

#!/usr/bin/env node
'use strict';

const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..', '..');

const r = spawnSync(process.execPath, [path.join(root, 'scripts', 'healthcheck-local.js')], { encoding: 'utf8' });
if (r.status !== 0) {
  console.error(r.stdout || '');
  console.error(r.stderr || '');
  process.exit(r.status || 1);
}
if (!r.stdout.includes('# healthcheck-local: ok')) throw new Error('healthcheck-local did not report ok');
if (!r.stdout.includes('role.main.AGENTS')) throw new Error('healthcheck-local did not inspect role templates');
console.log('ok healthcheck-local smoke');

#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { parseArgs, printHelp } = require('./lib/cli');

const HELP = `
Usage: node scripts/preflight.js [--target /tmp/oc-mat-preflight-repro]

Run the local release-preflight checks. This script is read-only and does not stage, commit, push, modify OpenClaw config, or restart Gateway.
`;

const args = parseArgs(process.argv);
if (args.help) { printHelp(HELP); process.exit(0); }

const root = path.resolve(__dirname, '..');
const target = args.target || '/tmp/oc-mat-preflight-repro';
const commands = [
  [process.execPath, ['scripts/doctor-local.js']],
  [process.execPath, ['scripts/healthcheck-local.js']],
  [process.execPath, ['scripts/repro-check.js', '--target', target]],
  [process.execPath, ['tests/smoke/run.js']]
];

function run(cmd, argv) {
  const label = `${cmd} ${argv.join(' ')}`;
  console.log(`\n$ ${label}`);
  const r = spawnSync(cmd, argv, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) {
    console.error(`FAILED: ${label}`);
    process.exit(r.status || 1);
  }
}

for (const [cmd, argv] of commands) run(cmd, argv);

const dangerous = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'reports') continue;
    const p = path.join(dir, entry.name);
    const rel = path.relative(root, p);
    if (entry.isDirectory()) walk(p);
    else if (/^(openclaw\.json|auth-profiles\.json|\.env|id_rsa|id_ed25519)$/.test(entry.name) || /\.(pem|key)$/.test(entry.name)) dangerous.push(rel);
  }
}
walk(root);
if (dangerous.length) {
  console.error('Dangerous files found:');
  for (const f of dangerous) console.error(`- ${f}`);
  process.exit(1);
}

console.log('\npreflight passed');

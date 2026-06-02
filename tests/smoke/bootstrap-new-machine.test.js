#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..', '..');

function run(args, opts = {}) {
  const r = spawnSync('bash', [path.join(root, 'scripts', 'bootstrap-new-machine.sh'), ...args], { encoding: 'utf8', ...opts });
  if (r.status !== 0) {
    console.error(r.stdout || '');
    console.error(r.stderr || '');
    process.exit(r.status || 1);
  }
  return r;
}

const profileTarget = path.join(os.tmpdir(), `oc-mat-bootstrap-profile-${process.pid}`);
const profile = run([
  '--dest', root,
  '--target', profileTarget,
  '--profile', 'smoke',
  '--', '--skip-restart'
]);
if (!profile.stdout.includes('# Running reproducer')) throw new Error('bootstrap did not run reproducer');
if (!profile.stdout.includes('New-machine reproduction plan')) throw new Error('reproducer did not start through bootstrap');
if (profile.stdout.includes('OpenClaw does not know the command')) throw new Error('profile wrapper invoked openclaw with node script as a subcommand');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'oc-mat-bootstrap-update-'));
try {
  const cleanRepo = path.join(tmp, 'repo');
  const clone = spawnSync('git', ['clone', '-q', root, cleanRepo], { encoding: 'utf8' });
  if (clone.status !== 0) throw new Error(clone.stderr || 'git clone failed');
  const update = run(['--dest', cleanRepo, '--target', path.join(tmp, 'home'), '--', '--skip-restart']);
  if (!update.stdout.includes('# Updating existing repo from: origin/main')) throw new Error('clean existing repo was not fast-forward checked');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.rmSync(profileTarget, { recursive: true, force: true });
}

console.log('ok bootstrap-new-machine smoke');

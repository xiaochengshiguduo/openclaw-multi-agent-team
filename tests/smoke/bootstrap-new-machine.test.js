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

function copyDir(src, dst) {
  fs.cpSync(src, dst, {
    recursive: true,
    dereference: false,
    filter: (p) => !p.includes(`${path.sep}.git${path.sep}`) && path.basename(p) !== '.git'
  });
}

function makeStandaloneRepo(tmp) {
  const dest = path.join(tmp, 'repo');
  copyDir(root, dest);
  let r = spawnSync('git', ['init', '-b', 'main'], { cwd: dest, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || 'git init failed');
  r = spawnSync('git', ['add', '.'], { cwd: dest, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || 'git add failed');
  r = spawnSync('git', ['-c', 'user.name=Smoke', '-c', 'user.email=smoke@example.invalid', 'commit', '-m', 'fixture'], { cwd: dest, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || 'git commit failed');
  return dest;
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'oc-mat-bootstrap-'));
try {
  const profileTarget = path.join(tmp, 'profile-target');
  const standaloneRepo = makeStandaloneRepo(tmp);
  const profile = run([
    '--dest', standaloneRepo,
    '--target', profileTarget,
    '--profile', 'smoke',
    '--language', 'zh-CN',
    '--', '--skip-restart'
  ], { env: { ...process.env, HOME: path.join(tmp, 'home') } });
  if (!profile.stdout.includes('# Existing repo has no upstream; skipping update')) throw new Error('standalone repo should not fetch without upstream');
  if (!profile.stdout.includes('# Running reproducer')) throw new Error('bootstrap did not run reproducer');
  if (!profile.stdout.includes('New-machine reproduction plan')) throw new Error('reproducer did not start through bootstrap');
  if (!profile.stdout.includes('runtime language: zh-CN')) throw new Error('bootstrap did not forward --language to reproducer');
  if (!profile.stdout.includes('node scripts/generate-workspaces.js')) throw new Error('reproducer dry-run did not preview workspace generation');
  if (!profile.stdout.includes('--language \'zh-CN\'')) throw new Error('reproducer dry-run did not forward selected language to workspace generation');
  if (profile.stdout.includes('OpenClaw does not know the command')) throw new Error('profile wrapper invoked openclaw with node script as a subcommand');
  if (fs.existsSync(path.join(profileTarget, 'workspace'))) throw new Error('bootstrap dry-run wrote workspace files');

  const updateRoot = path.join(tmp, 'update-fixture');
  fs.mkdirSync(updateRoot, { recursive: true });
  const cleanRepo = path.join(updateRoot, 'repo');
  const clone = spawnSync('git', ['clone', '-q', standaloneRepo, cleanRepo], { encoding: 'utf8' });
  if (clone.status !== 0) throw new Error(clone.stderr || 'git clone failed');
  const originUrl = spawnSync('git', ['-C', cleanRepo, 'remote', 'get-url', 'origin'], { encoding: 'utf8' });
  if (originUrl.status !== 0 || path.resolve(originUrl.stdout.trim()) !== path.resolve(standaloneRepo)) {
    throw new Error('clean repo origin must be local fixture path');
  }
  const update = run(['--dest', cleanRepo, '--target', path.join(updateRoot, 'home'), '--lang', 'zh-CN', '--', '--skip-restart'], {
    env: { ...process.env, HOME: path.join(updateRoot, 'home-env') }
  });
  if (!update.stdout.includes('# Updating existing repo from: origin/main')) throw new Error('clean existing repo was not fast-forward checked');
  if (!update.stdout.includes('runtime language: zh-CN')) throw new Error('bootstrap did not forward --lang alias to reproducer');

  fs.writeFileSync(path.join(cleanRepo, 'local-change.txt'), 'dirty\n');
  const dirty = run(['--dest', cleanRepo, '--target', path.join(updateRoot, 'dirty-home'), '--', '--skip-restart'], {
    env: { ...process.env, HOME: path.join(updateRoot, 'dirty-home-env') }
  });
  if (!dirty.stdout.includes('# Existing repo has local changes; skipping update')) throw new Error('dirty existing repo did not skip update');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log('ok bootstrap-new-machine smoke');

#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');

function runRemoteShape(scriptName, args, opts = {}) {
  const scriptPath = path.join(root, 'scripts', scriptName);
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');
  return spawnSync('bash', ['-c', scriptContent, '--', ...args], { encoding: 'utf8', ...opts });
}

function mustRemoteShape(scriptName, args, opts = {}) {
  const r = runRemoteShape(scriptName, args, opts);
  if (r.status !== 0) {
    console.error(r.stdout || '');
    console.error(r.stderr || '');
    throw new Error(`remote-shape ${scriptName} ${args.join(' ')} failed with ${r.status}`);
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

function makeStandaloneRepo(tmp, name = 'repo') {
  const dest = path.join(tmp, name);
  copyDir(root, dest);
  let r = spawnSync('git', ['init'], { cwd: dest, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || 'git init failed');
  r = spawnSync('git', ['add', '.'], { cwd: dest, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || 'git add failed');
  r = spawnSync('git', ['-c', 'user.name=Smoke', '-c', 'user.email=smoke@example.invalid', 'commit', '-m', 'fixture'], { cwd: dest, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || 'git commit failed');
  return dest;
}

// Help mode should work under the same argument shape as:
// bash -c "$(curl -fsSL .../script.sh)" -- --help
{
  const bootstrapHelp = mustRemoteShape('bootstrap-new-machine.sh', ['--help']);
  if (!bootstrapHelp.stdout.includes('scripts/bootstrap-new-machine.sh')) throw new Error('bootstrap remote-shape help output missing usage');

  const updateHelp = mustRemoteShape('update-runtime-workspace.sh', ['--help']);
  if (!updateHelp.stdout.includes('scripts/update-runtime-workspace.sh')) throw new Error('update remote-shape help output missing usage');
}

// Bootstrap wrapper should work with remote command argument shape in dry-run mode
// against an isolated temp repo/target, without writing real ~/.openclaw or fetching a real remote.
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'oc-mat-bootstrap-remote-shape-'));
  const target = path.join(tmp, 'openclaw-home');
  const dest = makeStandaloneRepo(tmp, 'bootstrap-repo');
  try {
    const r = mustRemoteShape('bootstrap-new-machine.sh', [
      '--dest', dest,
      '--target', target,
      '--', '--skip-restart'
    ], { env: { ...process.env, HOME: path.join(tmp, 'home') } });
    if (!r.stdout.includes('# Existing repo has no upstream; skipping update')) throw new Error('bootstrap remote-shape should not fetch without upstream');
    if (!r.stdout.includes('# Running reproducer')) throw new Error('bootstrap remote-shape did not run reproducer');
    if (!r.stdout.includes('New-machine reproduction plan')) throw new Error('bootstrap remote-shape reproducer output missing');
    if (fs.existsSync(path.join(target, 'workspace'))) throw new Error('bootstrap remote-shape dry-run wrote workspace files');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// Update wrapper should work with remote command argument shape in dry-run mode
// against an isolated temp repo/target.
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'oc-mat-update-remote-shape-'));
  const dest = makeStandaloneRepo(tmp, 'update-repo');
  const target = path.join(tmp, 'openclaw-home');
  try {
    fs.mkdirSync(path.join(target, 'workspace', 'shared', 'tasks', '_template'), { recursive: true });
    fs.copyFileSync(path.join(root, 'roles', 'main', 'AGENTS.md'), path.join(target, 'workspace', 'AGENTS.md'));
    fs.copyFileSync(path.join(root, 'workspace-template', 'TEAM.md'), path.join(target, 'workspace', 'TEAM.md'));
    fs.copyFileSync(path.join(root, 'task-templates', '_template', 'status.md'), path.join(target, 'workspace', 'shared', 'tasks', '_template', 'status.md'));
    fs.copyFileSync(path.join(root, 'task-templates', '_template', 'main-supervisor-sop.md'), path.join(target, 'workspace', 'shared', 'tasks', '_template', 'main-supervisor-sop.md'));

    const r = mustRemoteShape('update-runtime-workspace.sh', [
      '--dest', dest,
      '--target', target,
      '--no-restart'
    ], { env: { ...process.env, HOME: path.join(tmp, 'home') } });
    if (!r.stdout.includes('# Existing repo has no upstream; skipping update')) throw new Error('update remote-shape should not fetch without upstream');
    if (!r.stdout.includes('# Running runtime workspace updater')) throw new Error('update remote-shape did not invoke updater');
    if (!fs.existsSync(path.join(target, 'state', 'openclaw-multi-agent-team', 'last-plan.json'))) throw new Error('update remote-shape dry-run did not write audit plan');
    if (fs.existsSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'subagents.md'))) throw new Error('update remote-shape dry-run wrote runtime files');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

console.log('ok bash remote command shape smoke');

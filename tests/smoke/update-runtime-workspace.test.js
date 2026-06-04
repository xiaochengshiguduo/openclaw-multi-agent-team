#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..', '..');
const script = path.join(root, 'scripts', 'update-runtime-workspace.js');

function run(argv, opts = {}) {
  return spawnSync(process.execPath, [script, ...argv], { encoding: 'utf8', ...opts });
}

function must(argv, opts = {}) {
  const r = run(argv, opts);
  if (r.status !== 0) {
    console.error(r.stdout || '');
    console.error(r.stderr || '');
    throw new Error(`command failed: ${argv.join(' ')}`);
  }
  return r;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function makeTarget() {
  return fs.mkdtempSync('/tmp/oc-mat-update-runtime-');
}

function cleanTarget(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const templateTeam = fs.readFileSync(path.join(root, 'workspace-template', 'TEAM.md'), 'utf8');
const templateAgents = fs.readFileSync(path.join(root, 'roles', 'main', 'AGENTS.md'), 'utf8');
const templateStatus = fs.readFileSync(path.join(root, 'task-templates', '_template', 'status.md'), 'utf8');
const templateSop = fs.readFileSync(path.join(root, 'task-templates', '_template', 'main-supervisor-sop.md'), 'utf8');

// dry-run must not write managed target files.
{
  const target = makeTarget();
  try {
    fs.mkdirSync(path.join(target, 'workspace', 'shared', 'tasks', '_template'), { recursive: true });
    fs.writeFileSync(path.join(target, 'workspace', 'AGENTS.md'), templateAgents);
    fs.writeFileSync(path.join(target, 'workspace', 'TEAM.md'), templateTeam);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'status.md'), templateStatus);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'main-supervisor-sop.md'), templateSop);
    const r = must(['--target', target]);
    assert(r.stdout.includes('Runtime workspace update (dry-run)'), 'dry-run output missing');
    assert(!fs.readFileSync(path.join(target, 'workspace', 'TEAM.md'), 'utf8').includes('managed-by: openclaw-multi-agent-team'), 'dry-run modified workspace file');
    assert(!fs.existsSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'subagents.md')), 'dry-run created template file');
    assert(fs.existsSync(path.join(target, 'state', 'openclaw-multi-agent-team', 'last-plan.json')), 'dry-run should write audit plan');
  } finally { cleanTarget(target); }
}

// apply should create/update allowed files and restart by default when a mock restart succeeds.
{
  const target = makeTarget();
  const restartMarker = path.join(target, 'restart-marker');
  try {
    fs.mkdirSync(path.join(target, 'workspace', 'shared', 'tasks', '_template'), { recursive: true });
    fs.writeFileSync(path.join(target, 'workspace', 'AGENTS.md'), templateAgents);
    fs.writeFileSync(path.join(target, 'workspace', 'TEAM.md'), templateTeam);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'status.md'), templateStatus);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'main-supervisor-sop.md'), templateSop);
    const r = must(['--target', target, '--apply', '--restart-command', `touch ${restartMarker}`]);
    assert(r.stdout.includes('Gateway restarted.'), 'apply should restart with mock command');
    assert(fs.existsSync(restartMarker), 'restart mock not executed');
    assert(fs.existsSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'subagents.md')), 'subagents template not created');
    const team = fs.readFileSync(path.join(target, 'workspace', 'TEAM.md'), 'utf8');
    assert(team.includes('managed-by: openclaw-multi-agent-team'), 'managed marker missing');
    const state = readJson(path.join(target, 'state', 'openclaw-multi-agent-team', 'update-state.json'));
    assert(state.version === '1.1.0', 'state version not updated');
  } finally { cleanTarget(target); }
}

// --no-restart must skip restart after successful apply.
{
  const target = makeTarget();
  const restartMarker = path.join(target, 'restart-marker');
  try {
    fs.mkdirSync(path.join(target, 'workspace', 'shared', 'tasks', '_template'), { recursive: true });
    fs.writeFileSync(path.join(target, 'workspace', 'AGENTS.md'), templateAgents);
    fs.writeFileSync(path.join(target, 'workspace', 'TEAM.md'), templateTeam);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'status.md'), templateStatus);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'main-supervisor-sop.md'), templateSop);
    must(['--target', target, '--apply', '--no-restart', '--restart-command', `touch ${restartMarker}`]);
    assert(!fs.existsSync(restartMarker), '--no-restart executed restart command');
  } finally { cleanTarget(target); }
}

// user-modified unmanaged files conflict and must not be overwritten or restarted.
{
  const target = makeTarget();
  const restartMarker = path.join(target, 'restart-marker');
  try {
    fs.mkdirSync(path.join(target, 'workspace'), { recursive: true });
    fs.writeFileSync(path.join(target, 'workspace', 'TEAM.md'), 'local user custom team file\n');
    const r = run(['--target', target, '--apply', '--restart-command', `touch ${restartMarker}`]);
    assert(r.status === 2, `expected conflict exit 2, got ${r.status}`);
    assert(fs.readFileSync(path.join(target, 'workspace', 'TEAM.md'), 'utf8') === 'local user custom team file\n', 'conflict file overwritten');
    assert(!fs.existsSync(restartMarker), 'restart happened despite conflict');
  } finally { cleanTarget(target); }
}

// user-modified managed files with updater state also conflict.
{
  const target = makeTarget();
  try {
    fs.mkdirSync(path.join(target, 'workspace', 'shared', 'tasks', '_template'), { recursive: true });
    fs.writeFileSync(path.join(target, 'workspace', 'AGENTS.md'), templateAgents);
    fs.writeFileSync(path.join(target, 'workspace', 'TEAM.md'), templateTeam);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'status.md'), templateStatus);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'main-supervisor-sop.md'), templateSop);
    must(['--target', target, '--apply', '--no-restart']);
    const statePath = path.join(target, 'state', 'openclaw-multi-agent-team', 'update-state.json');
    const state = readJson(statePath);
    state.version = '1.0.0';
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
    const teamPath = path.join(target, 'workspace', 'TEAM.md');
    fs.appendFileSync(teamPath, '\nlocal user edit\n');
    const r = run(['--target', target, '--apply', '--no-restart']);
    assert(r.status === 2, `expected managed conflict exit 2, got ${r.status}`);
    assert(fs.readFileSync(teamPath, 'utf8').includes('local user edit'), 'managed user edit overwritten');
  } finally { cleanTarget(target); }
}

// forbidden manifest targets must be rejected before apply.
{
  const target = makeTarget();
  try {
    const tmpRepo = fs.mkdtempSync('/tmp/oc-mat-forbidden-repo-');
    fs.cpSync(root, tmpRepo, { recursive: true, dereference: false, filter: (src) => !src.includes(`${path.sep}.git${path.sep}`) });
    const updatesDir = path.join(tmpRepo, 'updates', 'runtime');
    fs.mkdirSync(updatesDir, { recursive: true });
    fs.writeFileSync(path.join(tmpRepo, 'workspace-template', 'TEAM.md'), 'bad\n');
    fs.writeFileSync(path.join(updatesDir, '9.9.9.json'), JSON.stringify({
      version: '9.9.9',
      files: [{ source: 'workspace-template/TEAM.md', target: 'openclaw.json', strategy: 'managed-overwrite', kind: 'workspace' }],
      restart: { default: true }
    }, null, 2));
    const r = spawnSync(process.execPath, [path.join(tmpRepo, 'scripts', 'update-runtime-workspace.js'), '--target', target, '--to', '9.9.9'], { encoding: 'utf8' });
    assert(r.status === 3, `expected forbidden exit 3, got ${r.status}`);
    assert(!fs.existsSync(path.join(target, 'openclaw.json')), 'forbidden target written');
    fs.rmSync(tmpRepo, { recursive: true, force: true });
  } finally { cleanTarget(target); }
}

// symlink escape must be rejected.
{
  const target = makeTarget();
  try {
    fs.mkdirSync(path.join(target, 'workspace', 'shared', 'tasks'), { recursive: true });
    fs.symlinkSync('/tmp', path.join(target, 'workspace', 'shared', 'tasks', '_template'));
    const r = run(['--target', target]);
    assert(r.status === 3, `expected forbidden exit 3 for symlink, got ${r.status}`);
  } finally { cleanTarget(target); }
}

console.log('ok update-runtime-workspace smoke');

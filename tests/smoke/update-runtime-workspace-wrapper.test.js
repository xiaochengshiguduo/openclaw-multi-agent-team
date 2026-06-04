#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');

function run(cmd, argv, opts = {}) {
  return spawnSync(cmd, argv, { encoding: 'utf8', ...opts });
}

function must(cmd, argv, opts = {}) {
  const r = run(cmd, argv, opts);
  if (r.status !== 0) {
    console.error(r.stdout || '');
    console.error(r.stderr || '');
    throw new Error(`${cmd} ${argv.join(' ')} failed with ${r.status}`);
  }
  return r;
}

function copyDir(src, dst) {
  fs.cpSync(src, dst, { recursive: true, dereference: false, filter: (p) => !p.includes(`${path.sep}.git${path.sep}`) && path.basename(p) !== '.git' });
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'oc-mat-update-wrapper-'));
try {
  const dest = path.join(tmp, 'repo');
  const target = path.join(tmp, 'openclaw-home');
  copyDir(root, dest);
  must('git', ['init'], { cwd: dest });
  must('git', ['add', '.'], { cwd: dest });
  must('git', ['-c', 'user.name=Smoke', '-c', 'user.email=smoke@example.invalid', 'commit', '-m', 'fixture'], { cwd: dest });

  fs.mkdirSync(path.join(target, 'workspace', 'shared', 'tasks', '_template'), { recursive: true });
  fs.copyFileSync(path.join(root, 'roles', 'main', 'AGENTS.md'), path.join(target, 'workspace', 'AGENTS.md'));
  fs.copyFileSync(path.join(root, 'workspace-template', 'TEAM.md'), path.join(target, 'workspace', 'TEAM.md'));
  fs.copyFileSync(path.join(root, 'task-templates', '_template', 'status.md'), path.join(target, 'workspace', 'shared', 'tasks', '_template', 'status.md'));
  fs.copyFileSync(path.join(root, 'task-templates', '_template', 'main-supervisor-sop.md'), path.join(target, 'workspace', 'shared', 'tasks', '_template', 'main-supervisor-sop.md'));

  const r = must('bash', [path.join(root, 'scripts', 'update-runtime-workspace.sh'), '--dest', dest, '--target', target, '--no-restart']);
  if (!r.stdout.includes('# Running runtime workspace updater')) throw new Error('wrapper did not invoke updater');
  if (!fs.existsSync(path.join(target, 'state', 'openclaw-multi-agent-team', 'last-plan.json'))) throw new Error('wrapper dry-run did not write audit plan');
  if (fs.existsSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'subagents.md'))) throw new Error('wrapper dry-run wrote runtime files');

  console.log('ok update-runtime-workspace wrapper smoke');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

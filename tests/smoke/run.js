#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..', '..');
const { buildConfigPatch, pruneConfigBackups } = require(path.join(root, 'scripts', 'reproduce-new-machine.js'));

const scripts = [
  'doctor-local.js',
  'generate-workspaces.js',
  'reproduce-new-machine.js',
  'update-runtime-workspace.js',
  'create-task-archive.js',
  'register-agents.js',
  'configure-agent-routing.js',
  'preflight.js',
  'repro-check.js',
  'sync-team-docs.js',
  'healthcheck-local.js'
];

const shellScripts = [
  'bootstrap-new-machine.sh',
  'update-runtime-workspace.sh'
];

function run(cmd, argv, opts = {}) {
  const r = spawnSync(cmd, argv, { encoding: 'utf8', ...opts });
  if (r.status !== 0) {
    console.error(`FAIL ${cmd} ${argv.join(' ')}`);
    console.error(r.stdout || '');
    console.error(r.stderr || '');
    process.exit(r.status || 1);
  }
  return r;
}

for (const script of scripts) {
  run(process.execPath, [path.join(root, 'scripts', script), '--help']);
  console.log(`ok ${script} --help`);
}

for (const script of shellScripts) {
  const p = path.join(root, 'scripts', script);
  run('bash', ['-n', p]);
  console.log(`ok ${script} bash -n`);
  run('bash', [p, '--help']);
  console.log(`ok ${script} --help`);
}

run(process.execPath, [path.join(root, 'scripts', 'healthcheck-local.js')]);
console.log('ok healthcheck-local');
run(process.execPath, [path.join(root, 'scripts', 'repro-check.js'), '--target', path.join('/tmp', 'oc-mat-repro-smoke'), '--allow-missing-openclaw']);
console.log('ok repro-check');
run(process.execPath, [path.join(root, 'tests', 'smoke', 'markdown-links.js')]);
console.log('ok markdown links');
run(process.execPath, [path.join(root, 'tests', 'smoke', 'markdown-language-pairs.js')]);
console.log('ok markdown language pairs');
run(process.execPath, [path.join(root, 'tests', 'smoke', 'routing-decision.js')]);
console.log('ok routing decision');
run(process.execPath, [path.join(root, 'tests', 'smoke', 'team-dispatch-protocol.js')]);
console.log('ok team dispatch protocol');
run(process.execPath, [path.join(root, 'tests', 'smoke', 'role-agent-protocols.js')]);
console.log('ok role agent protocols');
run(process.execPath, [path.join(root, 'tests', 'smoke', 'role-checklists-protocol.js')]);
console.log('ok role checklists protocol');
for (const smokeTest of [
  'bootstrap-new-machine.test.js',
  'bash-remote-command-shape.test.js',
  'generate-agent-workspaces.test.js',
  'register-agents.dry-run.test.js',
  'configure-agent-to-agent.dry-run.test.js',
  'healthcheck-local.test.js',
  'create-task-archive.test.js',
  'update-runtime-workspace.test.js',
  'update-runtime-workspace-wrapper.test.js'
]) {
  run(process.execPath, [path.join(root, 'tests', 'smoke', smokeTest)]);
  console.log(`ok ${smokeTest}`);
}

const tmpRoot = fs.mkdtempSync('/tmp/oc-mat-smoke-root-');
try {
  const target = path.join(tmpRoot, 'openclaw-home');
  run(process.execPath, [path.join(root, 'scripts', 'generate-workspaces.js'), '--target', target]);
  if (fs.existsSync(target)) throw new Error('generate-workspaces dry-run wrote files');
  console.log('ok generate-workspaces dry-run no-write');

  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'openclaw.json'), JSON.stringify({
    agents: {
      list: [
        { id: 'main', workspace: '/tmp/main-workspace' },
        { id: 'pm', workspace: '/tmp/pm-workspace' }
      ]
    },
    models: {
      providers: {
        'custom-smoke': { baseUrl: 'https://example.invalid/v1', api: 'openai-completions' }
      }
    }
  }, null, 2) + '\n');
  const reproducePreview = run(process.execPath, [path.join(root, 'scripts', 'reproduce-new-machine.js'), '--target', target, '--model', 'custom-smoke/model', '--api-key-env', 'SMOKE_API_KEY', '--skip-restart']);
  if (!reproducePreview.stdout.includes('openclaw config patch --file')) {
    throw new Error('reproduce-new-machine dry-run must preview OpenClaw config patch');
  }
  const patch = buildConfigPatch({
    providerId: 'custom-smoke',
    modelId: 'model',
    baseUrl: 'https://example.invalid/v1',
    api: 'openai-completions',
    alias: 'smoke',
    apiKeyEnv: 'SMOKE_API_KEY',
    existingConfig: JSON.parse(fs.readFileSync(path.join(target, 'openclaw.json'), 'utf8'))
  });
  const agentIds = patch.agents.list.map((agent) => agent.id);
  if (!agentIds.includes('main') || !agentIds.includes('pm')) {
    throw new Error('reproduce-new-machine config patch must preserve existing agents.list entries');
  }
  const mainAgent = patch.agents.list.find((agent) => agent.id === 'main');
  if (!mainAgent.subagents || !mainAgent.subagents.allowAgents.includes('reviewer')) {
    throw new Error('reproduce-new-machine config patch must set main.subagents.allowAgents');
  }
  if (fs.existsSync(path.join(target, 'workspace'))) throw new Error('reproduce-new-machine dry-run wrote workspace files');
  console.log('ok reproduce-new-machine dry-run no-write');

  run(process.execPath, [path.join(root, 'scripts', 'generate-workspaces.js'), '--target', target, '--apply']);
  for (const required of [
    path.join(target, 'workspace', 'AGENTS.md'),
    path.join(target, 'workspace-pm', 'AGENTS.md'),
    path.join(target, 'workspace-pm', 'shared'),
    path.join(target, 'workspace', 'shared', 'tasks', '_template', 'requirements-package.md')
  ]) {
    if (!fs.existsSync(required)) throw new Error(`Missing generated file: ${required}`);
  }
  console.log('ok generate-workspaces apply fixture');

  const appliedPatch = buildConfigPatch({
    providerId: 'custom-smoke',
    modelId: 'model',
    baseUrl: 'https://example.invalid/v1',
    api: 'openai-completions',
    alias: 'smoke',
    apiKeyEnv: 'SMOKE_API_KEY',
    existingConfig: JSON.parse(fs.readFileSync(path.join(target, 'openclaw.json'), 'utf8'))
  });
  fs.writeFileSync(path.join(target, 'openclaw.json'), JSON.stringify(appliedPatch, null, 2) + '\n');

  const runtimeCheck = run(process.execPath, [path.join(root, 'scripts', 'healthcheck-runtime.js'), '--target', target, '--skip-openclaw']);
  if (!runtimeCheck.stdout.includes(`target.config: ${path.join(target, 'openclaw.json')}`)) {
    throw new Error('healthcheck-runtime did not report target-specific config path');
  }
  console.log('ok healthcheck-runtime target config fixture');

  const mainAgents = path.join(target, 'workspace', 'AGENTS.md');
  fs.writeFileSync(mainAgents, 'stale main supervisor template\n');
  run(process.execPath, [path.join(root, 'scripts', 'generate-workspaces.js'), '--target', target, '--apply']);
  const regeneratedMainAgents = fs.readFileSync(mainAgents, 'utf8');
  if (regeneratedMainAgents.includes('stale main supervisor template')) {
    throw new Error('generate-workspaces --apply did not overwrite stale main AGENTS.md');
  }
  console.log('ok generate-workspaces apply overwrites managed files');

  fs.writeFileSync(mainAgents, 'preserved main supervisor template\n');
  run(process.execPath, [path.join(root, 'scripts', 'generate-workspaces.js'), '--target', target, '--apply', '--preserve-existing']);
  const preservedMainAgents = fs.readFileSync(mainAgents, 'utf8');
  if (!preservedMainAgents.includes('preserved main supervisor template')) {
    throw new Error('generate-workspaces --preserve-existing overwrote existing AGENTS.md');
  }
  console.log('ok generate-workspaces preserve-existing fixture');

  const backupDir = path.join(tmpRoot, 'backup-fixture');
  fs.mkdirSync(backupDir, { recursive: true });
  const configFile = path.join(backupDir, 'openclaw.json');
  fs.writeFileSync(configFile, '{}\n');
  const backupNames = ['openclaw.json.bak', 'openclaw.json.bak.1', 'openclaw.json.bak.2'];
  backupNames.forEach((name, index) => {
    const backupPath = path.join(backupDir, name);
    fs.writeFileSync(backupPath, `${name}\n`);
    const ts = new Date(Date.now() + index * 1000);
    fs.utimesSync(backupPath, ts, ts);
  });
  fs.writeFileSync(path.join(backupDir, 'openclaw.json.last-good'), 'last-good\n');
  const pruneResult = pruneConfigBackups(configFile, 1);
  if (pruneResult.removed !== 2 || pruneResult.kept !== 1) throw new Error('config backup pruning kept/removed unexpected count');
  if (!fs.existsSync(path.join(backupDir, 'openclaw.json.bak.2'))) throw new Error('config backup pruning did not keep newest backup');
  if (!fs.existsSync(path.join(backupDir, 'openclaw.json.last-good'))) throw new Error('config backup pruning removed last-good file');
  console.log('ok reproduce-new-machine config backup pruning');

  const tasksRoot = path.join(tmpRoot, 'tasks');
  run(process.execPath, [path.join(root, 'scripts', 'create-task-archive.js'), '--slug', 'smoke-test', '--tasks-root', tasksRoot]);
  if (fs.existsSync(tasksRoot)) throw new Error('create-task-archive dry-run wrote files');
  console.log('ok create-task-archive dry-run no-write');

  run(process.execPath, [path.join(root, 'scripts', 'create-task-archive.js'), '--slug', 'smoke-test', '--tasks-root', tasksRoot, '--apply']);
  const taskDirs = fs.readdirSync(tasksRoot);
  if (taskDirs.length !== 1) throw new Error('Expected one generated task archive');
  for (const file of ['metadata.md', 'routing.md', 'status.md', 'brief.md', 'plan.md', 'subagents.md']) {
    const p = path.join(tasksRoot, taskDirs[0], file);
    if (!fs.existsSync(p)) throw new Error(`Missing generated task file: ${p}`);
  }
  console.log('ok create-task-archive apply fixture');
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

console.log('smoke tests passed');

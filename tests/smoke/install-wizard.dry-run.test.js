#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..', '..');

const tmpHome = fs.mkdtempSync('/tmp/oc-mat-wizard-smoke-');
const configPath = path.join(tmpHome, 'openclaw.json');

function run(argv) {
  return spawnSync(process.execPath, [path.join(root, 'scripts', 'install-wizard.js'), ...argv], { encoding: 'utf8' });
}

let failures = 0;
function assert(cond, msg) { if (!cond) { console.error('FAIL: ' + msg); failures += 1; } }

try {
  // Seed an existing config with a user API key and a personal agent
  fs.writeFileSync(configPath, JSON.stringify({
    models: { providers: { userprov: { apiKey: 'sk-USER-SECRET', baseUrl: 'https://x', api: 'openai-completions' } } },
    agents: { list: [{ id: 'my-bot', workspace: '/home/u/bot' }] }
  }, null, 2));

  // Dry-run: must NOT modify the config
  const before = fs.readFileSync(configPath, 'utf8');
  const dry = run(['--target', tmpHome]);
  assert(dry.status === 0, 'dry-run exits 0');
  assert(dry.stdout.includes('Merge Plan'), 'dry-run prints merge plan');
  assert(dry.stdout.includes('Dry-run only'), 'dry-run states it is preview');
  const after = fs.readFileSync(configPath, 'utf8');
  assert(before === after, 'dry-run does not modify config');

  // Output preview file
  const outFile = path.join(tmpHome, 'preview.json');
  const out = run(['--target', tmpHome, '--output', outFile]);
  assert(fs.existsSync(outFile), 'preview file written');
  const preview = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  assert(preview.models.providers.userprov.apiKey === 'sk-USER-SECRET', 'preview preserves user API key');
  assert(preview.agents.list.some(a => a.id === 'my-bot'), 'preview preserves personal agent');
  assert(preview.agents.defaults.subagents.maxSpawnDepth === 2, 'preview has subagent policy');

  // Apply: must back up then write
  const apply = run(['--target', tmpHome, '--apply']);
  assert(apply.status === 0, 'apply exits 0');
  assert(apply.stdout.includes('Backed up'), 'apply backs up config');
  const applied = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  assert(applied.models.providers.userprov.apiKey === 'sk-USER-SECRET', 'applied config preserves API key');
  assert(applied.agents.list.some(a => a.id === 'my-bot'), 'applied config preserves personal agent');
  assert(applied.agents.defaults.subagents.maxSpawnDepth === 2, 'applied config has subagent policy');

  // Backup file should exist
  const backups = fs.readdirSync(tmpHome).filter(f => f.startsWith('openclaw.json.wizard-backup-'));
  assert(backups.length === 1, 'exactly one backup created');

  if (failures) { console.error(`\n${failures} assertion(s) failed`); process.exit(1); }
  console.log('ok install-wizard.dry-run smoke');
} finally {
  fs.rmSync(tmpHome, { recursive: true, force: true });
}

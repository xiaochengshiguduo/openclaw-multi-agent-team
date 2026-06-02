#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const { parseArgs, printHelp, isApply } = require('./lib/cli');
const { ROLE_AGENTS } = require('./lib/constants');
const { resolvePath } = require('./lib/paths');
const { spawnSync } = require('child_process');

const HELP = `
Usage: node scripts/register-agents.js [--target ~/.openclaw] [--model <model>] [--roles pm,docs] [--apply]

Preview or execute OpenClaw agent registration commands. No Telegram binding is added.
`;
const args = parseArgs(process.argv);
if (args.help) { printHelp(HELP); process.exit(0); }
const target = resolvePath(args.target || '~/.openclaw');
const configPath = path.join(target, 'openclaw.json');
const openclawEnv = { ...process.env, OPENCLAW_CONFIG_PATH: configPath };
function readAliasFromConfig(targetDir) {
  try {
    const p = path.join(targetDir, 'openclaw.json');
    if (!fs.existsSync(p)) return '';
    const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
    const primary = parsed?.agents?.defaults?.model?.primary;
    if (!primary) return '';
    return parsed?.agents?.defaults?.models?.[primary]?.alias || '';
  } catch (_) {
    return '';
  }
}

const inferredAlias = readAliasFromConfig(target);
const model = args.model || inferredAlias;
if (!model) {
  console.error('Error: model alias is required for registration.');
  console.error('Provide --model <alias>, or ensure agents.defaults.models[primary].alias exists in openclaw.json.');
  process.exit(2);
}
const selected = args.roles ? String(args.roles).split(',').map(s => s.trim()).filter(Boolean) : ROLE_AGENTS;
const commands = selected.map(role => ['openclaw', ['agents', 'add', role, '--non-interactive', '--workspace', path.join(target, `workspace-${role}`), '--model', model]]);

const missingWorkspaces = selected.filter(role => !fs.existsSync(path.join(target, `workspace-${role}`)));
if (missingWorkspaces.length) {
  console.error(`Warning: workspace directories not found for: ${missingWorkspaces.join(', ')}`);
  console.error('Run generate-workspaces first, or verify --target.');
}

const existing = spawnSync('openclaw', ['agents', 'list'], { encoding: 'utf8', env: openclawEnv });
if (existing.status === 0) {
  const text = existing.stdout || existing.stderr || '';
  const present = selected.filter(role => new RegExp(`(^|\\s)${role}(\\s|$)`).test(text));
  if (present.length) console.error(`Info: possible existing agents detected: ${present.join(', ')}`);
} else {
  console.error('Warning: could not inspect existing agents with `openclaw agents list`; continuing with preview.');
}

function agentAlreadyExists(output, role) {
  return new RegExp(`Agent "${role.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" already exists`).test(output);
}

for (const [cmd, argv] of commands) console.log(`${isApply(args) ? 'RUN' : 'would run'}: ${cmd} ${argv.map(a => JSON.stringify(a)).join(' ')}`);
if (!isApply(args)) console.log('\nDry-run only. Re-run with --apply to execute registration commands.');
else {
  for (const [cmd, argv] of commands) {
    const role = argv[2];
    const r = spawnSync(cmd, argv, { encoding: 'utf8', env: openclawEnv });
    if (r.status !== 0) {
      const output = `${r.stdout || ''}${r.stderr || ''}`;
      if (agentAlreadyExists(output, role)) {
        process.stderr.write(`SKIP: agent "${role}" already exists\n`);
        continue;
      }
      if (r.stdout) process.stdout.write(r.stdout);
      if (r.stderr) process.stderr.write(r.stderr);
      process.exit(r.status || 1);
    }
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);
  }
}

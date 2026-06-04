#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { ROLES, ROLE_AGENTS, REQUIRED_NODE_MAJOR, VERIFIED_OPENCLAW_VERSION } = require('./lib/constants');
const { parseArgs, printHelp } = require('./lib/cli');
const { resolvePath } = require('./lib/paths');

const HELP = `
Usage: node scripts/repro-check.js [--target ~/.openclaw] [--json] [--allow-missing-openclaw]

Check whether this project and the current machine are ready to reproduce the OpenClaw multi-agent team.
This script is read-only: no config writes, no Gateway restart, no agent registration.

By default, missing OpenClaw CLI is blocking because real reproduction requires OpenClaw to be installed/configured first.
Use --allow-missing-openclaw only in repository CI where OpenClaw is intentionally absent.
`;

const args = parseArgs(process.argv);
if (args.help) { printHelp(HELP); process.exit(0); }

const root = path.resolve(__dirname, '..');
const target = resolvePath(args.target || '~/.openclaw');
const checks = [];

function add(id, status, detail, hint = '') {
  checks.push({ id, status, detail, hint });
}
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function command(cmd, argv) {
  return spawnSync(cmd, argv, { encoding: 'utf8' });
}
function firstLine(s) { return String(s || '').trim().split('\n')[0] || ''; }

add('platform.linux', process.platform === 'linux' ? 'ok' : 'blocking', `platform=${process.platform}`, 'v1 supports Linux only');
const major = Number(process.versions.node.split('.')[0]);
add('node.version', major >= REQUIRED_NODE_MAJOR ? 'ok' : 'blocking', `node=${process.version}, required >=${REQUIRED_NODE_MAJOR}`);

const oc = command('openclaw', ['--version']);
const allowMissingOpenClaw = args['allow-missing-openclaw'] === true;
const ocVersion = oc.status === 0 ? firstLine(oc.stdout || oc.stderr) : '';
add(
  'openclaw.cli',
  oc.status === 0 ? 'ok' : allowMissingOpenClaw ? 'warning' : 'blocking',
  oc.status === 0 ? ocVersion : 'openclaw CLI not found',
  allowMissingOpenClaw ? 'Allowed for repository CI only; real reproduction requires OpenClaw first' : 'Install/configure OpenClaw first'
);
if (oc.status === 0) {
  add(
    'openclaw.version.policy',
    ocVersion.includes(VERIFIED_OPENCLAW_VERSION) ? 'ok' : 'warning',
    `installed=${ocVersion}; verified-reference=${VERIFIED_OPENCLAW_VERSION}`,
    'This project does not install/upgrade OpenClaw; validate routing config against your installed version'
  );
}

for (const rel of [
  'README.md',
  'README.zh-CN.md',
  'SECURITY.md',
  'package.json',
  'scripts/generate-workspaces.js',
  'scripts/register-agents.js',
  'scripts/configure-agent-routing.js',
  'scripts/update-runtime-workspace.js',
  'scripts/update-runtime-workspace.sh',
  'scripts/healthcheck-local.js',
  'scripts/healthcheck-runtime.md',
  'workspace-template/AGENTS.md',
  'task-templates/_template/requirements-package.md'
]) add(`project.file.${rel}`, exists(rel) ? 'ok' : 'blocking', rel);

for (const role of ROLES) {
  add(`role.${role}.AGENTS`, exists(`roles/${role}/AGENTS.md`) ? 'ok' : 'blocking', `roles/${role}/AGENTS.md`);
  add(`role.${role}.SOUL`, exists(`roles/${role}/SOUL.md`) ? 'ok' : 'blocking', `roles/${role}/SOUL.md`);
}

try {
  fs.mkdirSync(target, { recursive: true });
  fs.accessSync(target, fs.constants.W_OK);
  add('target.writable', 'ok', target);
} catch (err) {
  add('target.writable', 'blocking', `${target}: ${err.message}`);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'oc-mat-repro-'));
try {
  const shared = path.join(tmp, 'workspace', 'shared');
  const roleDir = path.join(tmp, 'workspace-pm');
  fs.mkdirSync(shared, { recursive: true });
  fs.mkdirSync(roleDir, { recursive: true });
  fs.symlinkSync(shared, path.join(roleDir, 'shared'), 'dir');
  add('filesystem.symlink', 'ok', 'directory symlink support');
} catch (err) {
  add('filesystem.symlink', 'blocking', err.message, 'Linux symlink support is required for v1');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (oc.status === 0) {
  const agents = command('openclaw', ['agents', 'list']);
  if (agents.status === 0) {
    const text = agents.stdout || agents.stderr || '';
    const present = ROLES.filter(role => new RegExp(`(^|\\s)${role}(\\s|$)`).test(text));
    const missing = ROLES.filter(role => !present.includes(role));
    add('runtime.agents.present', missing.length ? 'warning' : 'ok', missing.length ? `missing/unknown: ${missing.join(', ')}` : 'all expected role IDs appear to exist', 'This is expected before registration on a new machine');
  } else {
    add('runtime.agents.present', 'warning', 'could not run openclaw agents list', 'Runtime checks require a configured OpenClaw install');
  }
}

const generatedMain = path.join(target, 'workspace');
if (fs.existsSync(generatedMain)) add('target.existing-main-workspace', 'warning', generatedMain, 'Generation overwrites repository-managed workspace templates on --apply; use --preserve-existing only for manual migrations');
else add('target.existing-main-workspace', 'ok', 'not present yet');

const status = checks.some(c => c.status === 'blocking') ? 'blocking' : checks.some(c => c.status === 'warning') ? 'warning' : 'ok';
const result = { status, projectRoot: root, target, checks };
if (args.json) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`# repro-check: ${status}`);
  for (const c of checks) {
    const hint = c.hint ? ` (${c.hint})` : '';
    console.log(`[${c.status}] ${c.id}: ${c.detail}${hint}`);
  }
}
process.exit(status === 'blocking' ? 1 : 0);

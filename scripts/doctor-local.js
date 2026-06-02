#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { parseArgs, printHelp } = require('./lib/cli');
const { projectRoot } = require('./lib/paths');

const HELP = `
Usage: node scripts/doctor-local.js [--json]

Diagnose local prerequisites. This script does not modify files, call external services, or restart OpenClaw.
`;

const args = parseArgs(process.argv);
if (args.help) { printHelp(HELP); process.exit(0); }

function check(id, status, message) { return { id, status, message }; }
function commandExists(cmd, arg = '--version') {
  const r = spawnSync(cmd, [arg], { encoding: 'utf8' });
  return { ok: r.status === 0, output: (r.stdout || r.stderr || '').trim().split('\n')[0] || '' };
}

function canSymlink(root) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'oc-mat-symlink-'));
  try {
    const target = path.join(dir, 'target');
    const link = path.join(dir, 'link');
    fs.mkdirSync(target);
    fs.symlinkSync(target, link, 'dir');
    return true;
  } catch {
    return false;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const checks = [];
checks.push(check('platform.linux', os.platform() === 'linux' ? 'ok' : 'blocking', `platform=${os.platform()} (first version supports Linux only)`));
const nodeMajor = Number(process.versions.node.split('.')[0]);
checks.push(check('node.version', nodeMajor >= 24 ? 'ok' : 'blocking', `node=${process.version}, required >=24`));
const openclaw = commandExists('openclaw', '--version');
checks.push(check('openclaw.cli', openclaw.ok ? 'ok' : 'warning', openclaw.ok ? `openclaw found: ${openclaw.output}` : 'openclaw CLI not found in PATH'));
const root = projectRoot();
checks.push(check('project.root', fs.existsSync(root) ? 'ok' : 'blocking', root));
try {
  fs.accessSync(root, fs.constants.W_OK);
  checks.push(check('project.writable', 'ok', root));
} catch (err) {
  checks.push(check('project.writable', 'blocking', `${root}: ${err.message}`));
}
checks.push(check('filesystem.symlink', canSymlink(root) ? 'ok' : 'blocking', 'directory symlink support'));
const status = checks.some(c => c.status === 'blocking') ? 'blocking' : checks.some(c => c.status === 'warning') ? 'warning' : 'ok';
const result = { status, checks };
if (args.json) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`# doctor-local: ${status}`);
  for (const c of checks) console.log(`[${c.status}] ${c.id}: ${c.message}`);
}
process.exit(status === 'blocking' ? 1 : 0);

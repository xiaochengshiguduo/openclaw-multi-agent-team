#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parseArgs, printHelp } = require('./lib/cli');
const { projectRoot } = require('./lib/paths');
const { ROLES, ALL_TASK_TEMPLATE_FILES } = require('./lib/constants');

const HELP = `
Usage: node scripts/healthcheck-local.js [--json]

Check project templates and script files. Does not modify files, restart Gateway, or call external services.
`;
const args = parseArgs(process.argv);
if (args.help) { printHelp(HELP); process.exit(0); }
const root = projectRoot();
const checks = [];
function add(id, ok, message) { checks.push({ id, status: ok ? 'ok' : 'blocking', message }); }
for (const role of ROLES) {
  add(`role.${role}.AGENTS`, fs.existsSync(path.join(root, 'roles', role, 'AGENTS.md')), `roles/${role}/AGENTS.md`);
  add(`role.${role}.SOUL`, fs.existsSync(path.join(root, 'roles', role, 'SOUL.md')), `roles/${role}/SOUL.md`);
}
for (const f of ALL_TASK_TEMPLATE_FILES) add(`task-template.${f}`, fs.existsSync(path.join(root, 'task-templates', '_template', f)), `task-templates/_template/${f}`);
for (const f of ['README.md', 'README.zh-CN.md', 'SECURITY.md', 'package.json']) add(`root.${f}`, fs.existsSync(path.join(root, f)), f);
for (const f of [
  'scripts/healthcheck-runtime.js',
  'scripts/healthcheck-runtime.md',
  'scripts/reproduce-new-machine.js',
  'scripts/generate-workspaces.js',
  'scripts/register-agents.js',
  'scripts/configure-agent-routing.js',
  'scripts/repro-check.js'
]) add(`script.${f}`, fs.existsSync(path.join(root, f)), f);
const status = checks.some(c => c.status === 'blocking') ? 'blocking' : 'ok';
if (args.json) console.log(JSON.stringify({ status, checks }, null, 2));
else {
  console.log(`# healthcheck-local: ${status}`);
  for (const c of checks) console.log(`[${c.status}] ${c.id}: ${c.message}`);
}
process.exit(status === 'blocking' ? 1 : 0);

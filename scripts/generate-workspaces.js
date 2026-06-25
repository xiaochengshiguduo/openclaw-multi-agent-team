#!/usr/bin/env node
'use strict';

const path = require('path');
const { parseArgs, isApply, printHelp } = require('./lib/cli');
const { projectRoot, resolvePath } = require('./lib/paths');
const { ROLES } = require('./lib/constants');
const { assertRoleName } = require('./lib/slug');
const { ensureDir, copyFile, symlink, applyActions } = require('./lib/fs-safe');
const { printPlan, printResults } = require('./lib/report');
const { DEFAULT_RUNTIME_LANGUAGE } = require('./lib/runtime-localization');

const HELP = `
Usage: node scripts/generate-workspaces.js [--target ~/.openclaw] [--roles pm,docs] [--apply] [--preserve-existing]

Generate OpenClaw Agent workspace directories. Default is dry-run.

On --apply, project-managed workspace template files and role shared links are overwritten by default
so a new machine can be reproduced completely from this repository. Use --preserve-existing to keep
older non-overwrite behavior for manual migrations.

Linux only in the first version.
`;

const args = parseArgs(process.argv);
if (args.help) { printHelp(HELP); process.exit(0); }
const root = projectRoot();
const target = resolvePath(args.target || '~/.openclaw');
const selected = args.roles ? String(args.roles).split(',').map(s => s.trim()).filter(Boolean) : ROLES;
const language = DEFAULT_RUNTIME_LANGUAGE;
for (const r of selected) assertRoleName(r);
function localizedSource(rel) {
  return rel;
}

function copyLocalized(rel, dest, actions) {
  copyFile(path.join(root, localizedSource(rel)), dest, actions);
}

const mainWorkspace = path.join(target, 'workspace');
const sharedTarget = path.join(mainWorkspace, 'shared');
const actions = [];
ensureDir(mainWorkspace, actions);
ensureDir(path.join(sharedTarget, 'tasks', '_template'), actions);
for (const file of ['TEAM.md']) copyLocalized(path.join('workspace-template', file), path.join(mainWorkspace, file), actions);
for (const role of selected) {
  const workspace = role === 'main' ? mainWorkspace : path.join(target, `workspace-${role}`);
  ensureDir(workspace, actions);
  ensureDir(path.join(workspace, 'memory'), actions);
  copyLocalized('workspace-template/TEAM.md', path.join(workspace, 'TEAM.md'), actions);
  copyLocalized(path.join('roles', role, 'AGENTS.md'), path.join(workspace, 'AGENTS.md'), actions);
  copyLocalized(path.join('roles', role, 'SOUL.md'), path.join(workspace, 'SOUL.md'), actions);
  for (const [src, dest] of [
    ['USER.template.md', 'USER.md'], ['TOOLS.template.md', 'TOOLS.md'], ['MEMORY.template.md', 'MEMORY.md'],
    ['HEARTBEAT.template.md', 'HEARTBEAT.md'], ['IDENTITY.template.md', 'IDENTITY.md']
  ]) copyLocalized(path.join('workspace-template', src), path.join(workspace, dest), actions);
  if (role !== 'main') symlink(sharedTarget, path.join(workspace, 'shared'), actions);
}
for (const name of require('fs').readdirSync(path.join(root, 'task-templates', '_template')).filter(f => f.endsWith('.md'))) {
  copyLocalized(path.join('task-templates', '_template', name), path.join(sharedTarget, 'tasks', '_template', name), actions);
}
if (isApply(args) && args['preserve-existing'] !== true) {
  console.log('# Overwrite mode: existing repository-managed workspace template files and role shared links will be replaced.');
}
console.log(`# Runtime workspace language: ${language}`);
printPlan(actions, { apply: isApply(args) });
if (isApply(args)) {
  const overwrite = args['preserve-existing'] !== true;
  printResults(applyActions(actions, { force: overwrite }));
} else {
  console.log('\nDry-run only. Re-run with --apply to write files.');
  console.log('On --apply, existing project-managed template files and role shared links are overwritten by default.');
  console.log('Use --preserve-existing to keep existing files during manual migrations.');
}

#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parseArgs, isApply, printHelp } = require('./lib/cli');
const { assertTaskSlug } = require('./lib/slug');
const { TASK_TEMPLATE_FILES } = require('./lib/constants');
const { projectRoot, resolvePath } = require('./lib/paths');

const HELP = `
Usage: node scripts/create-task-archive.js --slug <slug> [--tasks-root <path>] [--apply]

Create shared/tasks/TASK-YYYYMMDD-HHMM-slug from templates. Default is dry-run.
`;
const args = parseArgs(process.argv);
if (args.help) { printHelp(HELP); process.exit(0); }
if (!args.slug) { console.error('Missing --slug'); process.exit(1); }
assertTaskSlug(String(args.slug));
function timestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}
const root = projectRoot();
const tasksRoot = args['tasks-root'] ? resolvePath(args['tasks-root']) : path.join(root, 'examples', 'task-lifecycle');
const taskId = `TASK-${timestamp()}-${args.slug}`;
const target = path.join(tasksRoot, taskId);
console.log(`${isApply(args) ? 'Create' : 'Would create'}: ${target}`);
if (fs.existsSync(target)) { console.error(`Target exists: ${target}`); process.exit(1); }
if (isApply(args)) {
  fs.mkdirSync(tasksRoot, { recursive: true });
  fs.mkdirSync(target, { recursive: false });
  for (const file of TASK_TEMPLATE_FILES) {
    fs.copyFileSync(path.join(root, 'task-templates', '_template', file), path.join(target, file), fs.constants.COPYFILE_EXCL);
  }
  console.log('Created files:', TASK_TEMPLATE_FILES.join(', '));
} else {
  console.log('Dry-run only. Re-run with --apply to write files.');
}

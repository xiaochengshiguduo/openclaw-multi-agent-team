#!/usr/bin/env node
'use strict';

const fs = require('fs');
const { parseArgs, printHelp, isApply } = require('./lib/cli');
const { ROLES } = require('./lib/constants');
const { agentToAgentPatch } = require('./lib/openclaw-config');

const HELP = `
Usage: node scripts/configure-agent-routing.js [--output <file>] [--apply]

Print the agent-to-agent config patch. First version is preview-first.
If --apply is used, this script refuses by default and asks you to apply manually after backup/validate.
`;
const args = parseArgs(process.argv);
if (args.help) { printHelp(HELP); process.exit(0); }
const patchText = JSON.stringify(agentToAgentPatch(ROLES), null, 2);
if (args.output) {
  fs.writeFileSync(String(args.output), patchText + '\n', { flag: 'wx' });
  console.error(`Wrote preview patch to ${args.output}`);
} else {
  console.log(patchText);
}
if (isApply(args)) {
  console.error('\nRefusing to modify OpenClaw config automatically in this version. Save this patch, backup config, validate, then apply manually.');
  process.exit(2);
}

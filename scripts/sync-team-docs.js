#!/usr/bin/env node
'use strict';

const { parseArgs, printHelp } = require('./lib/cli');
const HELP = `
Usage: node scripts/sync-team-docs.js [--target ~/.openclaw] [--apply]

Planned script: sync TEAM.md and role protocol docs to generated workspaces without touching MEMORY/USER/TOOLS.
Currently preview-only placeholder.
`;
const args = parseArgs(process.argv);
if (args.help) { printHelp(HELP); process.exit(0); }
console.log('sync-team-docs is planned. It will remain dry-run/preview-first.');

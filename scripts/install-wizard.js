#!/usr/bin/env node
'use strict';

/**
 * Guided installer for the OpenClaw multi-agent team.
 *
 * Unlike the legacy overwrite-based reproduce script, this wizard:
 * - Reads the user's existing OpenClaw config
 * - Merges (never blind-overwrites) the team template
 * - Preserves API keys, existing agents, and user workspace files
 * - Shows a full plan + warnings BEFORE writing anything
 * - Is dry-run by default; only writes with --apply
 * - Backs up the config before any write
 *
 * Modes:
 *   (default)        Preview merge plan + warnings, write nothing
 *   --apply          Execute the merge after a backup
 *   --output <file>  Write the merged config preview to a file
 *   --target <dir>   OpenClaw home (default: ~/.openclaw)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { parseArgs, printHelp, isApply } = require('./lib/cli');
const { resolvePath } = require('./lib/paths');
const { ROLES } = require('./lib/constants');
const { subagentPolicyPatch } = require('./lib/openclaw-config');
const { mergeOpenClawConfig } = require('./lib/config-merger');

const HELP = `
Usage: node scripts/install-wizard.js [--target ~/.openclaw] [--output <file>] [--apply]

Guided, merge-based installer for the OpenClaw multi-agent team.

Safety:
- Dry-run by default. Shows the merge plan and warnings, writes nothing.
- Preserves user API keys, existing agents.list[], and user config sections.
- Backs up openclaw.json before any --apply write.
- Worker workspace files are added only if missing (never overwrites).

Options:
  --target <dir>    OpenClaw home directory (default: ~/.openclaw)
  --output <file>   Write merged config preview JSON to a file
  --apply           Execute the merge (after backup)
  --help            Show this help
`;

function readJsonIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function backupConfig(configPath) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${configPath}.wizard-backup-${stamp}`;
  fs.copyFileSync(configPath, backupPath);
  return backupPath;
}

function buildTemplateConfig() {
  // The team's desired config: subagent policy + main allowAgents.
  // No provider/model values here — those come from the user's existing config.
  return subagentPolicyPatch(ROLES);
}

function printPlan(plan, warnings) {
  console.log('\n=== Merge Plan ===');
  if (!plan.length) {
    console.log('(no changes needed — config already matches team policy)');
  }
  for (const item of plan) {
    const id = item.id ? ` [${item.id}]` : '';
    console.log(`  • ${item.type}${id}: ${item.detail}`);
  }
  if (warnings.length) {
    console.log('\n=== Warnings (review manually) ===');
    for (const w of warnings) console.log(`  ⚠ ${w}`);
  }
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) { printHelp(HELP); process.exit(0); }

  const target = resolvePath(args.target || '~/.openclaw');
  const configPath = path.join(target, 'openclaw.json');

  const existing = readJsonIfExists(configPath);
  if (existing === null && fs.existsSync(configPath)) {
    console.error(`Error: ${configPath} exists but is not valid JSON. Fix it before running the wizard.`);
    process.exit(1);
  }

  const template = buildTemplateConfig();
  const { merged, plan, warnings } = mergeOpenClawConfig(existing || {}, template);

  console.log(`Target OpenClaw home: ${target}`);
  console.log(`Existing config: ${existing ? 'found' : 'none (will create minimal config)'}`);
  printPlan(plan, warnings);

  if (args.output) {
    fs.writeFileSync(String(args.output), JSON.stringify(merged, null, 2) + '\n');
    console.error(`\nWrote merged config preview to ${args.output}`);
  }

  if (!isApply(args)) {
    console.log('\nDry-run only. Review the plan above.');
    console.log('Re-run with --apply to execute the merge (a backup is created first).');
    console.log('Note: this wizard only updates config policy. Register role agents with scripts/register-agents.js and generate worker workspaces with scripts/generate-workspaces.js --preserve-existing.');
    return;
  }

  // Apply path: backup then write
  fs.mkdirSync(target, { recursive: true });
  let backupPath = null;
  if (fs.existsSync(configPath)) {
    backupPath = backupConfig(configPath);
    console.log(`\nBacked up existing config to: ${backupPath}`);
  }
  fs.writeFileSync(configPath, JSON.stringify(merged, null, 2) + '\n', { mode: 0o600 });
  console.log(`Wrote merged config to: ${configPath}`);
  if (backupPath) console.log(`Rollback with: cp "${backupPath}" "${configPath}"`);
  console.log('\nNext steps:');
  console.log('  1. node scripts/generate-workspaces.js --target ' + target + ' --preserve-existing');
  console.log('  2. node scripts/register-agents.js --target ' + target + ' --apply');
  console.log('  3. Restart Gateway manually after verifying the config.');
}

main();

#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { ROLES, ROLE_AGENTS, ALL_TASK_TEMPLATE_FILES, VERIFIED_OPENCLAW_VERSION } = require('./lib/constants');
const { parseArgs, printHelp } = require('./lib/cli');
const { resolvePath } = require('./lib/paths');

const HELP = `
Usage: node scripts/healthcheck-runtime.js [--target ~/.openclaw] [--json] [--skip-openclaw]

Read-only runtime healthcheck for a real OpenClaw multi-agent team installation.

This script checks the installed runtime shape: OpenClaw CLI/status, registered Agents when available,
workspace directories, shared symlinks, task templates, and obvious user-facing binding risks.
It does not write config, register Agents, restart Gateway, create tasks, or send messages.

Use --skip-openclaw only when checking filesystem layout on a machine where OpenClaw CLI is unavailable.
`;

const args = parseArgs(process.argv);
if (args.help) { printHelp(HELP); process.exit(0); }

const target = resolvePath(args.target || '~/.openclaw');
const configPath = path.join(target, 'openclaw.json');
const openclawEnv = { ...process.env, OPENCLAW_CONFIG_PATH: configPath };
const skipOpenClaw = args['skip-openclaw'] === true;
const checks = [];

function add(id, status, detail, hint = '') {
  checks.push({ id, status, detail, hint });
}

function command(cmd, argv) {
  return spawnSync(cmd, argv, { encoding: 'utf8', env: openclawEnv });
}

function firstLine(s) {
  return String(s || '').trim().split('\n')[0] || '';
}

function exists(p) {
  return fs.existsSync(p);
}

function isDirectory(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

function readlinkDetail(p) {
  try {
    const stat = fs.lstatSync(p);
    if (!stat.isSymbolicLink()) return { ok: false, detail: 'exists but is not a symlink' };
    return { ok: true, detail: fs.readlinkSync(p) };
  } catch (err) {
    return { ok: false, detail: err.message };
  }
}

function readJsonIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return null;
  }
}

function roleWorkspace(role) {
  return role === 'main' ? path.join(target, 'workspace') : path.join(target, `workspace-${role}`);
}

function parseAgentList(text) {
  const found = new Set();
  for (const role of ROLES) {
    const re = new RegExp(`(^|[^A-Za-z0-9_-])${role}([^A-Za-z0-9_-]|$)`);
    if (re.test(text)) found.add(role);
  }
  return found;
}

function bindingRisk(text, role) {
  const lines = text.split(/\r?\n/).filter(line => line.includes(role));
  return lines.some(line => /telegram|signal|discord|whatsapp|channel|binding/i.test(line));
}

add('platform.linux', process.platform === 'linux' ? 'ok' : 'blocking', `platform=${process.platform}`, 'v1 runtime support target is Linux');
add('target.exists', exists(target) ? 'ok' : 'blocking', target, 'Generate workspaces first if target is missing');
add('target.config', exists(configPath) ? 'ok' : 'warning', configPath, 'OpenClaw config is expected after reproduction apply; filesystem-only checks may not have it yet');
add('target.main-workspace', isDirectory(roleWorkspace('main')) ? 'ok' : 'blocking', roleWorkspace('main'));

const sharedRoot = path.join(roleWorkspace('main'), 'shared');
const tasksRoot = path.join(sharedRoot, 'tasks');
const templateRoot = path.join(tasksRoot, '_template');
add('shared.root', isDirectory(sharedRoot) ? 'ok' : 'blocking', sharedRoot);
add('shared.tasks', isDirectory(tasksRoot) ? 'ok' : 'blocking', tasksRoot);
add('shared.tasks.template', isDirectory(templateRoot) ? 'ok' : 'blocking', templateRoot);

for (const file of ALL_TASK_TEMPLATE_FILES) {
  const p = path.join(templateRoot, file);
  add(`template.${file}`, exists(p) ? 'ok' : 'blocking', p);
}

const runtimeConfig = readJsonIfExists(configPath);
if (runtimeConfig) {
  const mainAgent = Array.isArray(runtimeConfig?.agents?.list)
    ? runtimeConfig.agents.list.find((agent) => agent && agent.id === 'main')
    : null;
  const allowAgents = Array.isArray(mainAgent?.subagents?.allowAgents) ? mainAgent.subagents.allowAgents : [];
  const missingSubagentTargets = ROLE_AGENTS.filter((role) => !allowAgents.includes(role));
  add(
    'config.main.subagents.allowAgents',
    missingSubagentTargets.length ? 'blocking' : 'ok',
    missingSubagentTargets.length
      ? `main cannot spawn role Agents; missing: ${missingSubagentTargets.join(', ')}`
      : `main can spawn role Agents: ${ROLE_AGENTS.join(', ')}`,
    'sessions_spawn(agentId=<role>) defaults to requester-only unless main.subagents.allowAgents includes role Agents'
  );
} else if (exists(configPath)) {
  add('config.parse', 'warning', `${configPath} could not be parsed as JSON`, 'Validate OpenClaw config before live routing checks');
}

for (const role of ROLE_AGENTS) {
  const ws = roleWorkspace(role);
  add(`workspace.${role}`, isDirectory(ws) ? 'ok' : 'blocking', ws);
  add(`workspace.${role}.AGENTS`, exists(path.join(ws, 'AGENTS.md')) ? 'ok' : 'blocking', path.join(ws, 'AGENTS.md'));
  add(`workspace.${role}.TEAM`, exists(path.join(ws, 'TEAM.md')) ? 'ok' : 'blocking', path.join(ws, 'TEAM.md'));
  const link = path.join(ws, 'shared');
  const linkInfo = readlinkDetail(link);
  const expectedA = '../workspace/shared';
  const expectedResolved = path.resolve(ws, linkInfo.detail || '.');
  const actualShared = path.resolve(sharedRoot);
  const linkOk = linkInfo.ok && (linkInfo.detail === expectedA || expectedResolved === actualShared);
  add(
    `workspace.${role}.shared-link`,
    linkOk ? 'ok' : 'blocking',
    linkInfo.ok ? `${link} -> ${linkInfo.detail}` : `${link}: ${linkInfo.detail}`,
    'Expected shared -> ../workspace/shared or equivalent resolved target'
  );
}

if (!skipOpenClaw) {
  const version = command('openclaw', ['--version']);
  const versionText = version.status === 0 ? firstLine(version.stdout || version.stderr) : '';
  add('openclaw.cli', version.status === 0 ? 'ok' : 'blocking', version.status === 0 ? versionText : 'openclaw CLI not found');
  if (version.status === 0) {
    add(
      'openclaw.version.policy',
      versionText.includes(VERIFIED_OPENCLAW_VERSION) ? 'ok' : 'warning',
      `installed=${versionText}; verified-reference=${VERIFIED_OPENCLAW_VERSION}`,
      'Different versions may work; validate routing config manually'
    );

    const status = command('openclaw', ['status']);
    add('openclaw.status', status.status === 0 ? 'ok' : 'warning', status.status === 0 ? `openclaw status completed with ${configPath}` : firstLine(status.stderr || status.stdout), 'Fix OpenClaw runtime before testing Agents');

    const agents = command('openclaw', ['agents', 'list']);
    if (agents.status === 0) {
      const text = agents.stdout || agents.stderr || '';
      const present = parseAgentList(text);
      const missing = ROLES.filter(role => !present.has(role));
      add('agents.expected', missing.length ? 'blocking' : 'ok', missing.length ? `missing/unknown: ${missing.join(', ')}` : `all expected Agents present: ${ROLES.join(', ')}`);
      for (const role of ROLE_AGENTS) {
        add(
          `agents.${role}.user-facing-binding`,
          bindingRisk(text, role) ? 'warning' : 'ok',
          bindingRisk(text, role) ? 'possible user-facing binding mentioned in agents list output' : 'no obvious binding marker in agents list output',
          'Sub-agents should not be Telegram/channel-bound by default; manually verify if output format is ambiguous'
        );
      }
    } else {
      add('agents.expected', 'blocking', firstLine(agents.stderr || agents.stdout) || 'could not run openclaw agents list');
    }
  }
} else {
  add('openclaw.skipped', 'warning', 'OpenClaw CLI/status/agent checks skipped by --skip-openclaw', 'Use only for filesystem-only checks');
}

const summary = checks.reduce((acc, check) => {
  acc[check.status] = (acc[check.status] || 0) + 1;
  return acc;
}, {});
const overall = checks.some(c => c.status === 'blocking') ? 'blocking' : checks.some(c => c.status === 'warning') ? 'warning' : 'ok';
const result = { status: overall, target, summary, checks };

if (args.json) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`# runtime-healthcheck: ${overall}`);
  for (const c of checks) {
    const hint = c.hint ? ` (${c.hint})` : '';
    console.log(`[${c.status}] ${c.id}: ${c.detail}${hint}`);
  }
}

process.exit(overall === 'blocking' ? 1 : 0);

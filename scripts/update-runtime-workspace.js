#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { parseArgs, printHelp } = require('./lib/cli');
const { projectRoot, resolvePath, assertInside } = require('./lib/paths');

const HELP = `
Usage: node scripts/update-runtime-workspace.js [--target ~/.openclaw] [--apply]
       [--to <version>] [--only workspace|task-templates] [--no-restart]
       [--json] [--restart-command <cmd>]

Safely update an already-used OpenClaw runtime workspace with project-managed
OpenClaw Multi-Agent Team instructions and task templates.

Default is preview/dry-run. With --apply, successful no-conflict updates restart
Gateway by default. Use --no-restart to skip restart.

This command never updates OpenClaw config, model/provider settings, memory,
sessions, state, credentials, or user-owned workspace files.
`;

const EXIT = {
  OK: 0,
  RUNTIME: 1,
  CONFLICT: 2,
  FORBIDDEN: 3,
  VALIDATION: 4,
  ROLLBACK: 5,
  RESTART: 6
};

const MANAGED_BY = 'openclaw-multi-agent-team';
const STATE_REL = path.join('state', MANAGED_BY, 'update-state.json');
const PLAN_REL = path.join('state', MANAGED_BY, 'last-plan.json');
const LOCK_REL = path.join('state', MANAGED_BY, 'update.lock');

const ALLOWLIST = [
  /^workspace\/AGENTS\.md$/,
  /^workspace\/TEAM\.md$/,
  /^workspace\/shared\/tasks\/_template\/[A-Za-z0-9._-]+\.md$/
];

const DENYLIST = [
  /^openclaw\.json$/,
  /^agents\/[^/]+\/agent\//,
  /^agents\/[^/]+\/sessions\//,
  /^memory\//,
  /^state\/(?!openclaw-multi-agent-team\/)/,
  /^workspace\/MEMORY\.md$/,
  /^workspace\/USER\.md$/,
  /^workspace\/TOOLS\.md$/,
  /^workspace\/IDENTITY\.md$/,
  /^workspace\/HEARTBEAT\.md$/,
  /^workspace\/memory\//
];

const args = parseArgs(process.argv);
if (args.help) { printHelp(HELP); process.exit(EXIT.OK); }

function fail(message, code = EXIT.RUNTIME, extra = {}) {
  const payload = { ok: false, error: message, ...extra };
  if (args.json) console.log(JSON.stringify(payload, null, 2));
  else console.error(message);
  process.exit(code);
}

function sha256Text(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function sha256File(filePath) {
  return sha256Text(fs.readFileSync(filePath));
}

function nowIso() {
  return new Date().toISOString();
}

function toPosix(rel) {
  return rel.split(path.sep).join('/');
}

function normalizeTargetRel(input) {
  if (!input || typeof input !== 'string') throw new Error('target must be a non-empty string');
  if (path.isAbsolute(input)) throw new Error(`absolute target forbidden: ${input}`);
  const normalized = toPosix(path.posix.normalize(input.replace(/\\/g, '/')));
  if (normalized === '.' || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`target path traversal forbidden: ${input}`);
  }
  return normalized;
}

function isAllowedTarget(rel) {
  return ALLOWLIST.some((rx) => rx.test(rel));
}

function isDeniedTarget(rel) {
  return DENYLIST.some((rx) => rx.test(rel));
}

function ensureSafeTarget(rel) {
  const normalized = normalizeTargetRel(rel);
  if (isDeniedTarget(normalized)) throw new Error(`forbidden target: ${normalized}`);
  if (!isAllowedTarget(normalized)) throw new Error(`target outside updater allowlist: ${normalized}`);
  return normalized;
}

function sourcePath(root, sourceRel) {
  if (!sourceRel || typeof sourceRel !== 'string') throw new Error('source must be a non-empty string');
  if (path.isAbsolute(sourceRel)) throw new Error(`absolute source forbidden: ${sourceRel}`);
  const normalized = path.posix.normalize(sourceRel.replace(/\\/g, '/'));
  if (normalized === '.' || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`source path traversal forbidden: ${sourceRel}`);
  }
  const full = path.resolve(root, normalized);
  assertInside(full, root, 'source');
  if (!fs.existsSync(full)) throw new Error(`source file missing: ${sourceRel}`);
  if (!fs.statSync(full).isFile()) throw new Error(`source is not a file: ${sourceRel}`);
  return full;
}

function targetPath(targetRoot, rel) {
  const full = path.resolve(targetRoot, rel);
  assertInside(full, targetRoot, 'target');
  return full;
}

function pathHasSymlinkEscape(targetRoot, fullTarget) {
  const rel = path.relative(targetRoot, fullTarget);
  const parts = rel.split(path.sep).filter(Boolean);
  let current = targetRoot;
  for (let i = 0; i < parts.length; i += 1) {
    current = path.join(current, parts[i]);
    if (!fs.existsSync(current)) continue;
    const lst = fs.lstatSync(current);
    if (lst.isSymbolicLink()) return current;
  }
  return '';
}

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function writeJsonAtomic(filePath, value) {
  safeAtomicWriteAbsolute(filePath, JSON.stringify(value, null, 2) + '\n', 0o600);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function fsyncDir(dir) {
  try {
    const fd = fs.openSync(dir, 'r');
    try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  } catch (_) {
    // Some filesystems do not support directory fsync. Best effort.
  }
}

function safeAtomicWriteAbsolute(filePath, content, mode = 0o644) {
  ensureDir(path.dirname(filePath));
  const tmp = path.join(path.dirname(filePath), `.${path.basename(filePath)}.tmp-${process.pid}-${Date.now()}`);
  const fd = fs.openSync(tmp, 'w', mode);
  try {
    fs.writeFileSync(fd, content, 'utf8');
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tmp, filePath);
  fsyncDir(path.dirname(filePath));
}

function managedHeader({ source, version }) {
  return [
    '<!-- managed-by: openclaw-multi-agent-team -->',
    `<!-- source: ${source} -->`,
    `<!-- version: ${version} -->`,
    '',
    ''
  ].join('\n');
}

function stripManagedHeader(text) {
  const lines = String(text).split(/\n/);
  if (lines[0] && lines[0].includes('managed-by: openclaw-multi-agent-team')) {
    const idx = lines.findIndex((line, i) => i > 0 && line.trim() === '');
    if (idx >= 0 && idx <= 4) return lines.slice(idx + 1).join('\n');
  }
  return text;
}

function hasManagedMarker(text) {
  return String(text).slice(0, 300).includes('managed-by: openclaw-multi-agent-team');
}

function withManagedHeader(sourceText, item, version) {
  return managedHeader({ source: item.source, version }) + stripManagedHeader(sourceText).replace(/^\uFEFF/, '');
}

function listManifests(root) {
  const dir = path.join(root, 'updates', 'runtime');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => /^\d+\.\d+\.\d+\.json$/.test(name))
    .sort(compareVersionFiles)
    .map((name) => path.join(dir, name));
}

function compareVersions(a, b) {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}

function compareVersionFiles(a, b) {
  return compareVersions(a.replace(/\.json$/, ''), b.replace(/\.json$/, ''));
}

function loadSelectedManifests(root, stateVersion, toVersion) {
  const files = listManifests(root);
  const selected = [];
  for (const file of files) {
    const m = readJson(file, null);
    if (!m || typeof m !== 'object') throw new Error(`invalid manifest: ${file}`);
    if (!m.version) throw new Error(`manifest missing version: ${file}`);
    if (toVersion && compareVersions(m.version, toVersion) > 0) continue;
    if (stateVersion && compareVersions(m.version, stateVersion) <= 0) continue;
    selected.push({ ...m, manifestPath: file });
  }
  if (toVersion && !selected.some((m) => m.version === toVersion) && (!stateVersion || compareVersions(toVersion, stateVersion) > 0)) {
    throw new Error(`target version manifest not found or not selectable: ${toVersion}`);
  }
  return selected;
}

function validateManifest(manifest, only) {
  if (!Array.isArray(manifest.files)) throw new Error(`manifest ${manifest.version} files must be an array`);
  const seen = new Set();
  for (const item of manifest.files) {
    const rel = normalizeTargetRel(item.target);
    if (seen.has(rel)) throw new Error(`manifest ${manifest.version} duplicate target: ${rel}`);
    seen.add(rel);
    if (!['managed-overwrite', 'create-or-managed-overwrite'].includes(item.strategy)) {
      throw new Error(`manifest ${manifest.version} invalid strategy for ${rel}`);
    }
    if (only && item.kind !== only) continue;
  }
}

function backupPathFor(rel, backupRoot) {
  return path.join(backupRoot, rel);
}

function buildPlan({ root, targetRoot, manifests, state, only }) {
  const plan = {
    ok: true,
    mode: args.apply ? 'apply' : 'dry-run',
    targetRoot,
    sourceCommit: gitCommit(root),
    fromVersion: state.version || null,
    toVersion: manifests.length ? manifests[manifests.length - 1].version : (state.version || null),
    actions: [],
    conflicts: [],
    forbidden: [],
    skipped: [],
    restart: { planned: false, performed: false, reason: '' }
  };

  for (const manifest of manifests) {
    validateManifest(manifest, only);
    for (const item of manifest.files) {
      if (only && item.kind !== only) continue;
      let rel;
      try {
        rel = ensureSafeTarget(item.target);
      } catch (err) {
        plan.forbidden.push({ manifest: manifest.version, target: item.target, reason: err.message });
        continue;
      }
      const src = sourcePath(root, item.source);
      const dst = targetPath(targetRoot, rel);
      const symlink = pathHasSymlinkEscape(targetRoot, dst);
      if (symlink) {
        plan.forbidden.push({ manifest: manifest.version, target: rel, reason: `symlink in target path: ${symlink}` });
        continue;
      }
      const sourceRaw = fs.readFileSync(src, 'utf8');
      const desired = withManagedHeader(sourceRaw, item, manifest.version);
      const desiredSha = sha256Text(desired);
      const exists = fs.existsSync(dst);
      if (exists && !fs.statSync(dst).isFile()) {
        plan.forbidden.push({ manifest: manifest.version, target: rel, reason: 'target exists and is not a regular file' });
        continue;
      }
      const current = exists ? fs.readFileSync(dst, 'utf8') : '';
      const currentSha = exists ? sha256Text(current) : '';
      if (exists && currentSha === desiredSha) {
        plan.skipped.push({ manifest: manifest.version, target: rel, reason: 'unchanged' });
        continue;
      }
      const fileState = state.files && state.files[rel];
      const managed = exists && hasManagedMarker(current);
      const matchesState = exists && fileState && fileState.sha256 === currentSha;
      const matchesSourceBody = exists && current === stripManagedHeader(desired);
      const matchesManagedBody = exists && managed && stripManagedHeader(current) === stripManagedHeader(desired);
      const matchesPreviousSha = exists && Array.isArray(item.previousSha256) && item.previousSha256.includes(currentSha);
      const missingAllowed = !exists && item.strategy === 'create-or-managed-overwrite';
      const canUpdate = missingAllowed || matchesState || matchesSourceBody || matchesManagedBody || matchesPreviousSha;
      if (!canUpdate) {
        plan.conflicts.push({ manifest: manifest.version, target: rel, reason: exists ? 'local file is unmanaged or modified' : 'target missing but strategy does not allow create' });
        continue;
      }
      plan.actions.push({
        type: exists ? 'update' : 'create',
        manifest: manifest.version,
        source: item.source,
        target: rel,
        targetPath: dst,
        sourceSha256: sha256Text(sourceRaw),
        desiredSha256: desiredSha,
        previousSha256: exists ? currentSha : null,
        reason: exists ? (matchesState ? 'matches previous updater state' : 'has managed marker') : 'target missing and create allowed',
        content: desired
      });
    }
  }
  plan.restart.planned = plan.actions.length > 0 && plan.conflicts.length === 0 && plan.forbidden.length === 0 && manifests.some((m) => m.restart && m.restart.default !== false) && !args['no-restart'];
  plan.restart.reason = plan.restart.planned ? (manifests[manifests.length - 1]?.restart?.reason || 'Managed runtime files changed.') : '';
  if (plan.conflicts.length || plan.forbidden.length) plan.ok = false;
  return plan;
}

function gitCommit(root) {
  const r = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : '';
}

function printPlan(plan) {
  if (args.json) {
    const safe = { ...plan, actions: plan.actions.map(({ content, targetPath, ...rest }) => rest) };
    console.log(JSON.stringify(safe, null, 2));
    return;
  }
  console.log(`# Runtime workspace update (${plan.mode})`);
  console.log(`target: ${plan.targetRoot}`);
  console.log(`from: ${plan.fromVersion || 'unknown'} -> ${plan.toVersion || 'none'}`);
  for (const a of plan.actions) console.log(`[${a.type}] ${a.target} (${a.reason})`);
  for (const s of plan.skipped) console.log(`[skip] ${s.target} (${s.reason})`);
  for (const c of plan.conflicts) console.log(`[conflict] ${c.target}: ${c.reason}`);
  for (const f of plan.forbidden) console.log(`[forbidden] ${f.target}: ${f.reason}`);
  console.log(`restart: ${plan.restart.planned ? 'planned' : 'not planned'}`);
}

function acquireLock(targetRoot) {
  const lockPath = path.join(targetRoot, LOCK_REL);
  ensureDir(path.dirname(lockPath));
  try {
    const fd = fs.openSync(lockPath, 'wx', 0o600);
    fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, at: nowIso() }) + '\n');
    fs.closeSync(fd);
  } catch (err) {
    throw new Error(`update lock exists: ${lockPath}`);
  }
  return () => { try { fs.rmSync(lockPath, { force: true }); } catch (_) { /* ignore */ } };
}

function makeBackup(plan, targetRoot) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const backupRoot = path.join(targetRoot, 'backups', MANAGED_BY, `update-${stamp}`);
  ensureDir(backupRoot);
  for (const action of plan.actions) {
    const dst = targetPath(targetRoot, action.target);
    if (!fs.existsSync(dst)) continue;
    const backupFile = backupPathFor(action.target, backupRoot);
    ensureDir(path.dirname(backupFile));
    fs.copyFileSync(dst, backupFile);
  }
  const safePlan = { ...plan, actions: plan.actions.map(({ content, targetPath: _tp, ...rest }) => rest) };
  writeJsonAtomic(path.join(backupRoot, 'plan.json'), safePlan);
  return backupRoot;
}

function rollback(applied, backupRoot, targetRoot) {
  for (let i = applied.length - 1; i >= 0; i -= 1) {
    const action = applied[i];
    const dst = targetPath(targetRoot, action.target);
    const backupFile = backupPathFor(action.target, backupRoot);
    if (fs.existsSync(backupFile)) {
      safeAtomicWriteAbsolute(dst, fs.readFileSync(backupFile, 'utf8'));
    } else {
      fs.rmSync(dst, { force: true });
    }
  }
}

function applyPlan(plan, targetRoot, statePath, previousState = {}) {
  const release = acquireLock(targetRoot);
  const applied = [];
  let backupRoot = '';
  try {
    backupRoot = makeBackup(plan, targetRoot);
    for (const action of plan.actions) {
      const dst = targetPath(targetRoot, action.target);
      const symlink = pathHasSymlinkEscape(targetRoot, dst);
      if (symlink) throw new Error(`symlink in target path during apply: ${symlink}`);
      safeAtomicWriteAbsolute(dst, action.content);
      applied.push(action);
    }
    const newState = {
      version: plan.toVersion,
      appliedAt: nowIso(),
      sourceCommit: plan.sourceCommit,
      files: { ...((previousState && previousState.files) || {}) }
    };
    for (const action of plan.actions) {
      newState.files[action.target] = {
        sha256: action.desiredSha256,
        source: action.source,
        version: action.manifest
      };
    }
    writeJsonAtomic(statePath, newState);
    return { backupRoot };
  } catch (err) {
    try { rollback(applied, backupRoot, targetRoot); }
    catch (rollbackErr) { throw Object.assign(new Error(`${err.message}; rollback failed: ${rollbackErr.message}`), { code: EXIT.ROLLBACK }); }
    throw err;
  } finally {
    release();
  }
}

function restartGateway(command) {
  const cmd = command || 'openclaw gateway restart';
  const r = spawnSync(cmd, { shell: true, stdio: 'inherit', encoding: 'utf8' });
  return r.status === 0;
}

(function main() {
  const root = projectRoot();
  const targetRoot = resolvePath(args.target || '~/.openclaw');
  const statePath = path.join(targetRoot, STATE_REL);
  const planPath = path.join(targetRoot, PLAN_REL);
  const state = readJson(statePath, { version: '', files: {} });
  const only = args.only || '';
  if (only && !['workspace', 'task-templates'].includes(only)) fail(`invalid --only: ${only}`, EXIT.VALIDATION);
  let manifests;
  try {
    manifests = loadSelectedManifests(root, state.version || '', args.to || '');
  } catch (err) {
    fail(err.message, EXIT.VALIDATION);
  }
  let plan;
  try {
    plan = buildPlan({ root, targetRoot, manifests, state, only });
  } catch (err) {
    fail(err.message, EXIT.VALIDATION);
  }
  ensureDir(path.dirname(planPath));
  writeJsonAtomic(planPath, { ...plan, actions: plan.actions.map(({ content, targetPath: _tp, ...rest }) => rest) });
  printPlan(plan);
  if (plan.forbidden.length) process.exit(EXIT.FORBIDDEN);
  if (plan.conflicts.length) process.exit(EXIT.CONFLICT);
  if (!args.apply) process.exit(EXIT.OK);
  if (plan.actions.length === 0) {
    if (!args.json) console.log('No changes applied; restart skipped.');
    process.exit(EXIT.OK);
  }
  let result;
  try {
    result = applyPlan(plan, targetRoot, statePath, state);
  } catch (err) {
    fail(err.message, err.code || EXIT.RUNTIME);
  }
  if (!args.json) console.log(`Backup: ${result.backupRoot}`);
  if (plan.restart.planned) {
    const ok = restartGateway(args['restart-command']);
    if (!ok) fail('Update applied, but gateway restart failed.', EXIT.RESTART, { backup: result.backupRoot });
    if (!args.json) console.log('Gateway restarted.');
  } else if (!args.json) {
    console.log('Restart skipped.');
  }
})();

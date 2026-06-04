#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..', '..');
const script = path.join(root, 'scripts', 'update-runtime-workspace.js');

function run(argv, opts = {}) {
  return spawnSync(process.execPath, [script, ...argv], { encoding: 'utf8', ...opts });
}

function must(argv, opts = {}) {
  const r = run(argv, opts);
  if (r.status !== 0) {
    console.error(r.stdout || '');
    console.error(r.stderr || '');
    throw new Error(`command failed: ${argv.join(' ')}`);
  }
  return r;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function makeTarget() {
  return fs.mkdtempSync('/tmp/oc-mat-update-runtime-');
}

function cleanTarget(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const templateTeam = fs.readFileSync(path.join(root, 'workspace-template', 'TEAM.md'), 'utf8');
const templateAgents = fs.readFileSync(path.join(root, 'roles', 'main', 'AGENTS.md'), 'utf8');
const templateStatus = fs.readFileSync(path.join(root, 'task-templates', '_template', 'status.md'), 'utf8');
const templateSop = fs.readFileSync(path.join(root, 'task-templates', '_template', 'main-supervisor-sop.md'), 'utf8');

// dry-run must not write managed target files.
{
  const target = makeTarget();
  try {
    fs.mkdirSync(path.join(target, 'workspace', 'shared', 'tasks', '_template'), { recursive: true });
    fs.writeFileSync(path.join(target, 'workspace', 'AGENTS.md'), templateAgents);
    fs.writeFileSync(path.join(target, 'workspace', 'TEAM.md'), templateTeam);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'status.md'), templateStatus);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'main-supervisor-sop.md'), templateSop);
    const r = must(['--target', target]);
    assert(r.stdout.includes('Runtime workspace update (dry-run)'), 'dry-run output missing');
    assert(!fs.readFileSync(path.join(target, 'workspace', 'TEAM.md'), 'utf8').includes('managed-by: openclaw-multi-agent-team'), 'dry-run modified workspace file');
    assert(!fs.existsSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'subagents.md')), 'dry-run created template file');
    assert(fs.existsSync(path.join(target, 'state', 'openclaw-multi-agent-team', 'last-plan.json')), 'dry-run should write audit plan');
  } finally { cleanTarget(target); }
}

// apply should create/update allowed files and restart by default when a mock restart succeeds.
{
  const target = makeTarget();
  const restartMarker = path.join(target, 'restart-marker');
  try {
    fs.mkdirSync(path.join(target, 'workspace', 'shared', 'tasks', '_template'), { recursive: true });
    fs.writeFileSync(path.join(target, 'workspace', 'AGENTS.md'), templateAgents);
    fs.writeFileSync(path.join(target, 'workspace', 'TEAM.md'), templateTeam);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'status.md'), templateStatus);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'main-supervisor-sop.md'), templateSop);
    const r = must(['--target', target, '--apply', '--restart-command', `touch ${restartMarker}`]);
    assert(r.stdout.includes('Gateway restarted.'), 'apply should restart with mock command');
    assert(fs.existsSync(restartMarker), 'restart mock not executed');
    assert(fs.existsSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'subagents.md')), 'subagents template not created');
    const team = fs.readFileSync(path.join(target, 'workspace', 'TEAM.md'), 'utf8');
    assert(team.includes('managed-by: openclaw-multi-agent-team'), 'managed marker missing');
    const state = readJson(path.join(target, 'state', 'openclaw-multi-agent-team', 'update-state.json'));
    assert(state.version === '1.1.0', 'state version not updated');
  } finally { cleanTarget(target); }
}

// --no-restart must skip restart after successful apply.
{
  const target = makeTarget();
  const restartMarker = path.join(target, 'restart-marker');
  try {
    fs.mkdirSync(path.join(target, 'workspace', 'shared', 'tasks', '_template'), { recursive: true });
    fs.writeFileSync(path.join(target, 'workspace', 'AGENTS.md'), templateAgents);
    fs.writeFileSync(path.join(target, 'workspace', 'TEAM.md'), templateTeam);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'status.md'), templateStatus);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'main-supervisor-sop.md'), templateSop);
    must(['--target', target, '--apply', '--no-restart', '--restart-command', `touch ${restartMarker}`]);
    assert(!fs.existsSync(restartMarker), '--no-restart executed restart command');
  } finally { cleanTarget(target); }
}

// user-modified unmanaged files conflict and must not be overwritten or restarted.
{
  const target = makeTarget();
  const restartMarker = path.join(target, 'restart-marker');
  try {
    fs.mkdirSync(path.join(target, 'workspace'), { recursive: true });
    fs.writeFileSync(path.join(target, 'workspace', 'TEAM.md'), 'local user custom team file\n');
    const r = run(['--target', target, '--apply', '--restart-command', `touch ${restartMarker}`]);
    assert(r.status === 2, `expected conflict exit 2, got ${r.status}`);
    assert(fs.readFileSync(path.join(target, 'workspace', 'TEAM.md'), 'utf8') === 'local user custom team file\n', 'conflict file overwritten');
    assert(!fs.existsSync(restartMarker), 'restart happened despite conflict');
  } finally { cleanTarget(target); }
}

// user-modified managed files with updater state also conflict.
{
  const target = makeTarget();
  try {
    fs.mkdirSync(path.join(target, 'workspace', 'shared', 'tasks', '_template'), { recursive: true });
    fs.writeFileSync(path.join(target, 'workspace', 'AGENTS.md'), templateAgents);
    fs.writeFileSync(path.join(target, 'workspace', 'TEAM.md'), templateTeam);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'status.md'), templateStatus);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'main-supervisor-sop.md'), templateSop);
    must(['--target', target, '--apply', '--no-restart']);
    const statePath = path.join(target, 'state', 'openclaw-multi-agent-team', 'update-state.json');
    const state = readJson(statePath);
    state.version = '1.0.0';
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
    const teamPath = path.join(target, 'workspace', 'TEAM.md');
    fs.appendFileSync(teamPath, '\nlocal user edit\n');
    const r = run(['--target', target, '--apply', '--no-restart']);
    assert(r.status === 2, `expected managed conflict exit 2, got ${r.status}`);
    assert(fs.readFileSync(teamPath, 'utf8').includes('local user edit'), 'managed user edit overwritten');
  } finally { cleanTarget(target); }
}

// empty/non-interactive stdin must keep modified managed-file conflicts safe.
{
  const target = makeTarget();
  try {
    fs.mkdirSync(path.join(target, 'workspace', 'shared', 'tasks', '_template'), { recursive: true });
    fs.writeFileSync(path.join(target, 'workspace', 'AGENTS.md'), templateAgents);
    fs.writeFileSync(path.join(target, 'workspace', 'TEAM.md'), templateTeam);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'status.md'), templateStatus);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'main-supervisor-sop.md'), templateSop);
    must(['--target', target, '--apply', '--no-restart']);
    const statePath = path.join(target, 'state', 'openclaw-multi-agent-team', 'update-state.json');
    const state = readJson(statePath);
    state.version = '1.0.0';
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
    const teamPath = path.join(target, 'workspace', 'TEAM.md');
    fs.appendFileSync(teamPath, '\nlocal user edit\n');
    const before = fs.readFileSync(teamPath, 'utf8');
    const r = run(['--target', target, '--apply', '--no-restart'], { input: '' });
    assert(r.status === 2, `expected empty stdin conflict exit 2, got ${r.status}`);
    assert(fs.readFileSync(teamPath, 'utf8') === before, 'empty stdin overwrote managed user edit');
  } finally { cleanTarget(target); }
}

// explicit automation flag overwrites only modified managed conflicts, with backup and state updates.
{
  const target = makeTarget();
  try {
    fs.mkdirSync(path.join(target, 'workspace', 'shared', 'tasks', '_template'), { recursive: true });
    fs.writeFileSync(path.join(target, 'workspace', 'AGENTS.md'), templateAgents);
    fs.writeFileSync(path.join(target, 'workspace', 'TEAM.md'), templateTeam);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'status.md'), templateStatus);
    fs.writeFileSync(path.join(target, 'workspace', 'shared', 'tasks', '_template', 'main-supervisor-sop.md'), templateSop);
    must(['--target', target, '--apply', '--no-restart']);
    const statePath = path.join(target, 'state', 'openclaw-multi-agent-team', 'update-state.json');
    const state = readJson(statePath);
    state.version = '1.0.0';
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
    const teamPath = path.join(target, 'workspace', 'TEAM.md');
    fs.appendFileSync(teamPath, '\nlocal user edit\n');
    const before = fs.readFileSync(teamPath, 'utf8');
    const r = must(['--target', target, '--apply', '--no-restart', '--overwrite-conflicts']);
    const after = fs.readFileSync(teamPath, 'utf8');
    assert(!after.includes('local user edit'), '--overwrite-conflicts did not replace modified managed file');
    assert(after.includes('managed-by: openclaw-multi-agent-team'), 'overwritten file missing managed header');
    const match = r.stdout.match(/Backup: (.+)/);
    assert(match, 'backup path missing from overwrite output');
    assert(fs.readFileSync(path.join(match[1].trim(), 'workspace', 'TEAM.md'), 'utf8') === before, 'backup does not contain pre-overwrite content');
    const newState = readJson(statePath);
    assert(newState.version === '1.1.0', 'state version not advanced after overwrite');
    assert(newState.files['workspace/TEAM.md'].sha256 === sha256Text(after), 'state hash not updated after overwrite');
  } finally { cleanTarget(target); }
}

// forbidden manifest targets must be rejected before apply.
{
  const target = makeTarget();
  try {
    const tmpRepo = fs.mkdtempSync('/tmp/oc-mat-forbidden-repo-');
    fs.cpSync(root, tmpRepo, { recursive: true, dereference: false, filter: (src) => !src.includes(`${path.sep}.git${path.sep}`) });
    const updatesDir = path.join(tmpRepo, 'updates', 'runtime');
    fs.mkdirSync(updatesDir, { recursive: true });
    fs.writeFileSync(path.join(tmpRepo, 'workspace-template', 'TEAM.md'), 'bad\n');
    fs.writeFileSync(path.join(updatesDir, '9.9.9.json'), JSON.stringify({
      version: '9.9.9',
      files: [{ source: 'workspace-template/TEAM.md', target: 'openclaw.json', strategy: 'managed-overwrite', kind: 'workspace' }],
      restart: { default: true }
    }, null, 2));
    const r = spawnSync(process.execPath, [path.join(tmpRepo, 'scripts', 'update-runtime-workspace.js'), '--target', target, '--to', '9.9.9'], { encoding: 'utf8' });
    assert(r.status === 3, `expected forbidden exit 3, got ${r.status}`);
    assert(!fs.existsSync(path.join(target, 'openclaw.json')), 'forbidden target written');
    fs.rmSync(tmpRepo, { recursive: true, force: true });
  } finally { cleanTarget(target); }
}

// symlink escape must be rejected.
{
  const target = makeTarget();
  try {
    fs.mkdirSync(path.join(target, 'workspace', 'shared', 'tasks'), { recursive: true });
    fs.symlinkSync('/tmp', path.join(target, 'workspace', 'shared', 'tasks', '_template'));
    const r = run(['--target', target]);
    assert(r.status === 3, `expected forbidden exit 3 for symlink, got ${r.status}`);
  } finally { cleanTarget(target); }
}


function managedHeaderFor(source, version) {
  return [
    '<!-- managed-by: openclaw-multi-agent-team -->',
    '<!-- source: ' + source + ' -->',
    '<!-- version: ' + version + ' -->',
    '',
    ''
  ].join('\n');
}

function managedContent(source, version, body) {
  return managedHeaderFor(source, version) + body.replace(/^\uFEFF/, '');
}

function sha256Text(text) {
  return require('crypto').createHash('sha256').update(text).digest('hex');
}

function makeTempRepo() {
  const tmpRepo = fs.mkdtempSync('/tmp/oc-mat-cumulative-repo-');
  fs.cpSync(root, tmpRepo, { recursive: true, dereference: false, filter: (src) => !src.includes(path.sep + '.git' + path.sep) });
  return tmpRepo;
}

function writeCumulativeManifestFixture(tmpRepo, opts = {}) {
  const updatesDir = path.join(tmpRepo, 'updates', 'runtime');
  const fixtureDir = path.join(tmpRepo, 'updates', 'runtime-fixtures');
  fs.mkdirSync(updatesDir, { recursive: true });
  fs.mkdirSync(fixtureDir, { recursive: true });
  const sourceA = 'updates/runtime-fixtures/team-1.1.md';
  const sourceB = 'updates/runtime-fixtures/team-1.2.md';
  const sourceC = 'updates/runtime-fixtures/team-1.3.md';
  const bodyA = '# Team 1.1\n';
  const bodyB = '# Team 1.2\n';
  const bodyC = '# Team 1.3\n';
  fs.writeFileSync(path.join(tmpRepo, sourceA), bodyA);
  fs.writeFileSync(path.join(tmpRepo, sourceB), bodyB);
  fs.writeFileSync(path.join(tmpRepo, sourceC), bodyC);
  const contentA = managedContent(sourceA, '1.1.0', bodyA);
  const contentB = managedContent(sourceB, '1.2.0', bodyB);
  const contentC = managedContent(sourceC, '1.3.0', bodyC);
  const firstStrategy = opts.firstStrategy || 'managed-overwrite';
  fs.writeFileSync(path.join(updatesDir, '1.2.0.json'), JSON.stringify({
    version: '1.2.0',
    files: [{ source: sourceB, target: 'workspace/TEAM.md', strategy: firstStrategy, kind: 'workspace' }],
    restart: { default: true, reason: 'Reload 1.2 runtime files.' }
  }, null, 2));
  fs.writeFileSync(path.join(updatesDir, '1.3.0.json'), JSON.stringify({
    version: '1.3.0',
    files: [{ source: sourceC, target: 'workspace/TEAM.md', strategy: 'managed-overwrite', kind: 'workspace', previousSha256: opts.badPreviousSha ? ['0'.repeat(64)] : [sha256Text(contentB)] }],
    restart: { default: true, reason: 'Reload 1.3 runtime files.' }
  }, null, 2));
  return { sourceA, sourceB, sourceC, contentA, contentB, contentC };
}

function writeUpdaterState(target, version, files) {
  const stateDir = path.join(target, 'state', 'openclaw-multi-agent-team');
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(path.join(stateDir, 'update-state.json'), JSON.stringify({ version, appliedAt: new Date(0).toISOString(), sourceCommit: 'test', files }, null, 2) + '\n');
}

// skipped-version updates to the same target must use cumulative virtual state,
// honor intermediate previousSha256, and collapse to one final write action.
{
  const target = makeTarget();
  const tmpRepo = makeTempRepo();
  try {
    const fx = writeCumulativeManifestFixture(tmpRepo);
    const teamPath = path.join(target, 'workspace', 'TEAM.md');
    fs.mkdirSync(path.dirname(teamPath), { recursive: true });
    fs.writeFileSync(teamPath, fx.contentA);
    writeUpdaterState(target, '1.1.0', { 'workspace/TEAM.md': { sha256: sha256Text(fx.contentA), source: fx.sourceA, version: '1.1.0' } });
    const r = spawnSync(process.execPath, [path.join(tmpRepo, 'scripts', 'update-runtime-workspace.js'), '--target', target, '--apply', '--no-restart', '--to', '1.3.0'], { encoding: 'utf8' });
    assert(r.status === 0, 'expected cumulative apply success, got ' + r.status + '\nstdout=' + r.stdout + '\nstderr=' + r.stderr);
    assert(fs.readFileSync(teamPath, 'utf8') === fx.contentC, 'final cumulative content was not applied');
    const plan = readJson(path.join(target, 'state', 'openclaw-multi-agent-team', 'last-plan.json'));
    const actions = plan.actions.filter((a) => a.target === 'workspace/TEAM.md');
    assert(actions.length === 1, 'expected one collapsed action, got ' + actions.length);
    assert(actions[0].manifest === '1.3.0', 'collapsed action should record final manifest');
    assert(actions[0].manifestChain.includes('1.2.0') && actions[0].manifestChain.includes('1.3.0'), 'manifest chain missing intermediate versions');
    const state = readJson(path.join(target, 'state', 'openclaw-multi-agent-team', 'update-state.json'));
    assert(state.version === '1.3.0', 'state version not advanced to final target');
  } finally { cleanTarget(target); fs.rmSync(tmpRepo, { recursive: true, force: true }); }
}

// user edits before a skipped-version upgrade must still conflict and must not be overwritten.
{
  const target = makeTarget();
  const tmpRepo = makeTempRepo();
  try {
    const fx = writeCumulativeManifestFixture(tmpRepo);
    const teamPath = path.join(target, 'workspace', 'TEAM.md');
    fs.mkdirSync(path.dirname(teamPath), { recursive: true });
    fs.writeFileSync(teamPath, fx.contentA + 'local edit\n');
    writeUpdaterState(target, '1.1.0', { 'workspace/TEAM.md': { sha256: sha256Text(fx.contentA), source: fx.sourceA, version: '1.1.0' } });
    const r = spawnSync(process.execPath, [path.join(tmpRepo, 'scripts', 'update-runtime-workspace.js'), '--target', target, '--apply', '--no-restart', '--to', '1.3.0'], { encoding: 'utf8' });
    assert(r.status === 2, 'expected cumulative user-edit conflict exit 2, got ' + r.status);
    assert(fs.readFileSync(teamPath, 'utf8') === fx.contentA + 'local edit\n', 'user edit was overwritten');
  } finally { cleanTarget(target); fs.rmSync(tmpRepo, { recursive: true, force: true }); }
}

// an invalid intermediate previousSha256 must conflict against the virtual
// state and must not be silently accepted.
{
  const target = makeTarget();
  const tmpRepo = makeTempRepo();
  try {
    const fx = writeCumulativeManifestFixture(tmpRepo, { badPreviousSha: true });
    const teamPath = path.join(target, 'workspace', 'TEAM.md');
    fs.mkdirSync(path.dirname(teamPath), { recursive: true });
    fs.writeFileSync(teamPath, fx.contentA);
    writeUpdaterState(target, '1.1.0', { 'workspace/TEAM.md': { sha256: sha256Text(fx.contentA), source: fx.sourceA, version: '1.1.0' } });
    const r = spawnSync(process.execPath, [path.join(tmpRepo, 'scripts', 'update-runtime-workspace.js'), '--target', target, '--apply', '--no-restart', '--to', '1.3.0'], { encoding: 'utf8' });
    assert(r.status === 2, 'expected bad intermediate previousSha conflict exit 2, got ' + r.status);
    assert(fs.readFileSync(teamPath, 'utf8') === fx.contentA, 'bad previousSha update was applied');
  } finally { cleanTarget(target); fs.rmSync(tmpRepo, { recursive: true, force: true }); }
}

// a missing target must not be silently created when the first applicable
// selected manifest uses managed-overwrite.
{
  const target = makeTarget();
  const tmpRepo = makeTempRepo();
  try {
    writeCumulativeManifestFixture(tmpRepo, { firstStrategy: 'managed-overwrite' });
    writeUpdaterState(target, '1.1.0', {});
    const r = spawnSync(process.execPath, [path.join(tmpRepo, 'scripts', 'update-runtime-workspace.js'), '--target', target, '--apply', '--no-restart', '--to', '1.3.0'], { encoding: 'utf8' });
    assert(r.status === 2, 'expected missing managed-overwrite conflict exit 2, got ' + r.status);
    assert(!fs.existsSync(path.join(target, 'workspace', 'TEAM.md')), 'missing managed-overwrite target was created');
  } finally { cleanTarget(target); fs.rmSync(tmpRepo, { recursive: true, force: true }); }
}


console.log('ok update-runtime-workspace smoke');

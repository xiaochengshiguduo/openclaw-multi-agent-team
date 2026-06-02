#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..', '..');
const target = fs.mkdtempSync('/tmp/oc-mat-register-smoke-');

function run(script, argv, opts = {}) {
  const r = spawnSync(process.execPath, [path.join(root, 'scripts', script), ...argv], { encoding: 'utf8', ...opts });
  if (opts.expectFailure) {
    if (r.status === 0) throw new Error(`${script} unexpectedly succeeded`);
    return r;
  }
  if (r.status !== 0) {
    console.error(r.stdout || '');
    console.error(r.stderr || '');
    process.exit(r.status || 1);
  }
  return r;
}

try {
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'openclaw.json'), JSON.stringify({
    agents: { defaults: { model: { primary: 'custom-smoke/model' }, models: { 'custom-smoke/model': { alias: 'g' } } } }
  }, null, 2) + '\n');
  const result = run('register-agents.js', ['--target', target, '--roles', 'pm,docs']);
  if (!result.stdout.includes('would run: openclaw "agents" "add" "pm"')) throw new Error('missing pm dry-run command');
  if (!result.stdout.includes('would run: openclaw "agents" "add" "docs"')) throw new Error('missing docs dry-run command');
  const fakeBin = path.join(target, 'bin');
  const fakeOpenclaw = path.join(fakeBin, 'openclaw');
  const fakeLog = path.join(target, 'openclaw.log');
  fs.mkdirSync(fakeBin, { recursive: true });
  fs.writeFileSync(fakeOpenclaw, `#!/usr/bin/env node
const fs = require('fs');
const log = process.env.OC_MAT_FAKE_LOG;
if (log) fs.appendFileSync(log, process.argv.slice(2).join(' ') + '\\n');
const args = process.argv.slice(2);
if (args[0] === 'agents' && args[1] === 'list') {
  console.log('pm');
  process.exit(0);
}
if (args[0] === 'agents' && args[1] === 'add' && args[2] === 'pm') {
  console.error('Agent "pm" already exists. Run openclaw agents list to inspect configured agents.');
  process.exit(1);
}
if (args[0] === 'agents' && args[1] === 'add') process.exit(0);
process.exit(2);
`);
  fs.chmodSync(fakeOpenclaw, 0o755);
  const applyResult = run('register-agents.js', ['--target', target, '--roles', 'pm,docs', '--apply'], {
    env: { ...process.env, PATH: `${fakeBin}${path.delimiter}${process.env.PATH}`, OC_MAT_FAKE_LOG: fakeLog }
  });
  if (!applyResult.stderr.includes('SKIP: agent "pm" already exists')) throw new Error('existing agent was not skipped');
  const fakeCalls = fs.readFileSync(fakeLog, 'utf8');
  if (!fakeCalls.includes('agents add docs')) throw new Error('registration did not continue after existing agent');
  console.log('ok register-agents apply skips existing agents');
} finally {
  fs.rmSync(target, { recursive: true, force: true });
}

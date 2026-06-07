#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const team = fs.readFileSync(path.join(root, 'workspace-template', 'TEAM.md'), 'utf8');

let failures = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(message);
    failures += 1;
  }
}

for (const needle of [
  '## 3. Dispatch Protocol After Entering Multi-Agent Flow',
  'This section applies only after a task has already been judged by `AGENTS.md` / `routing.md` as requiring Multi-Agent flow',
  '`TEAM.md` only chooses roles, collaboration order, permissions, recovery, and completion standards after entry',
  'The goal is not to minimize headcount',
  '### 3.2 Dispatch Modes',
  'Dispatch modes describe collaboration within Multi-Agent flow',
  '### 3.3 Serial / Parallel Judgment',
  '### 3.4 Conflict Handling Protocol',
  'Evidence first',
  '### 3.5 Agent Permission Matrix',
  'External writes, messages, comments, PR, push, release',
  'Deploy, restart services, modify system config',
  '### 3.6 Recoverable Sub-Agent Dispatch Protocol',
  '### 3.7 Multi-Agent Completion Definition',
  '## Dispatch Mode',
  '## Dependencies',
  '## Completion Criteria',
  'Permission level:',
  '### 4.1 Feature Implementation',
  '### 4.2 Bug, Incident, and Environment',
  '### 4.3 Review, Verification, and Release',
  '### 4.4 Documentation, Research, and Long-term Rules',
  'Release readiness judgment',
  'Add a reusable SOP / template / skill',
  '`routing.md` records main\'s entry judgment and routing notes after Multi-Agent entry'
]) {
  assert(team.includes(needle), `TEAM.md missing: ${needle}`);
}

for (const forbidden of [
  'main-only',
  '默认尽量少拉人',
  '最少岗位优先',
  '最小团队原则'
]) {
  assert(!team.includes(forbidden), `TEAM.md should not contain forbidden phrase: ${forbidden}`);
}

if (failures) process.exit(1);
console.log('ok team dispatch protocol');

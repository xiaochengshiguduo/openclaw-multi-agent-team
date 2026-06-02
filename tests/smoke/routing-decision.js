#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

let failures = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(message);
    failures += 1;
  }
}

for (const rel of [
  'docs/concepts/routing-decision.md',
  'docs/concepts/routing-decision.zh-CN.md',
  'task-templates/_template/routing.md',
  'examples/task-lifecycle/TASK-example-001/routing.md',
  'examples/task-lifecycle/TASK-example-001/routing.zh-CN.md'
]) {
  assert(exists(rel), `Missing routing artifact: ${rel}`);
}

const routing = read('docs/concepts/routing-decision.md');
for (const needle of [
  'Level 1: main direct',
  'Level 2: main + one specialist Agent',
  'Level 3: main creates shared/tasks and coordinates multiple Agents',
  'Level 4: high-risk overlay requiring security/devops/reviewer participation',
  '## Scoring rubric',
  '## Role selection matrix',
  '## Required routing decision record'
]) {
  assert(routing.includes(needle), `routing-decision.md missing: ${needle}`);
}

const routingZh = read('docs/concepts/routing-decision.zh-CN.md');
for (const needle of [
  'Level 1: main 直接处理',
  'Level 2: main + 一个专家 Agent',
  'Level 3: main 创建 shared/tasks，并协调多个 Agent',
  'Level 4: 高风险叠加层，强制 security/devops/reviewer 参与',
  '## 评分表',
  '## 角色选择矩阵',
  '## 必需路由决策记录'
]) {
  assert(routingZh.includes(needle), `routing-decision.zh-CN.md missing: ${needle}`);
}

const archive = read('docs/concepts/shared-task-archive.md');
assert(archive.includes('routing.md'), 'shared-task-archive.md must mention routing.md');
assert(archive.includes('[Routing decision](routing-decision.md)'), 'shared-task-archive.md must link routing decision');

const roles = read('docs/concepts/roles-and-responsibilities.md');
assert(roles.includes('main` must classify non-trivial work'), 'roles-and-responsibilities.md must require main routing classification');
assert(roles.includes('Level 4: high-risk overlay'), 'roles-and-responsibilities.md must mention Level 4');

const taskTemplate = read('docs/reference/task-template.md');
assert(taskTemplate.includes('- `routing.md`'), 'task-template.md must list routing.md');

const constants = read('scripts/lib/constants.js');
assert(constants.includes("TASK_TEMPLATE_FILES = ['metadata.md', 'routing.md', 'status.md', 'brief.md', 'plan.md']"), 'TASK_TEMPLATE_FILES must include routing.md');
assert(constants.includes("'metadata.md', 'routing.md', 'status.md'"), 'ALL_TASK_TEMPLATE_FILES must include routing.md');

const template = read('task-templates/_template/routing.md');
for (const needle of ['## Decision', '## Reasoning', '## Score', '## High-risk triggers', '## Selected Agents', '## Re-routing log']) {
  assert(template.includes(needle), `task routing template missing: ${needle}`);
}

if (failures) process.exit(1);
console.log('ok routing decision artifacts');

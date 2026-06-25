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
  'task-templates/_template/routing.md',
  'examples/task-lifecycle/TASK-example-001/routing.md',
]) {
  assert(exists(rel), `Missing routing artifact: ${rel}`);
}

const routing = read('docs/concepts/routing-decision.md');
for (const needle of [
  '`main` 是否可以直接完成这个任务，还是必须进入 Multi-Agent 流程？',
  '具体岗位路由由 `TEAM.md` 负责',
  '## main 自处理边界',
  '聊天 + 只读 + 非持久 + 低风险',
  '## 必须进入 Multi-Agent 的条件',
  '## 用户 override 规则',
  '## 必需路由决策记录',
]) {
  assert(routing.includes(needle), `routing-decision.md missing: ${needle}`);
}

const archive = read('docs/concepts/shared-task-archive.md');
assert(archive.includes('routing.md'), 'shared-task-archive.md must mention routing.md');

const roles = read('docs/concepts/roles-and-responsibilities.md');
assert(roles.includes('main'), 'roles-and-responsibilities.md must reference main');
assert(roles.includes('TEAM.md'), 'roles-and-responsibilities.md must reference TEAM.md');

const taskTemplate = read('docs/reference/task-template.md');
assert(taskTemplate.includes('routing.md'), 'task-template.md must list routing.md');

const constants = read('scripts/lib/constants.js');
assert(constants.includes('routing.md'), 'TASK_TEMPLATE_FILES must include routing.md');
assert(constants.includes('subagents.md'), 'TASK_TEMPLATE_FILES must include subagents.md');

const template = read('task-templates/_template/routing.md');
for (const needle of ['## 决策', '## 推理', '## 重路由日志']) {
  assert(template.includes(needle), `task routing template missing: ${needle}`);
}

const mainAgents = read('roles/main/AGENTS.md');
assert(mainAgents.includes('main'), 'roles/main/AGENTS.md must reference main');
assert(mainAgents.includes('TEAM.md'), 'roles/main/AGENTS.md must reference TEAM.md');

if (failures) process.exit(1);
console.log('ok routing decision artifacts');

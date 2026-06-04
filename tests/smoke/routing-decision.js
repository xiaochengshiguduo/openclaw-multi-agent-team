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
  'May `main` complete this task directly, or must the task enter the Multi-Agent workflow?',
  'Concrete role routing after entry is owned by `TEAM.md`',
  '## Main self-handling boundary',
  'chat + read-only + non-durable + low-risk',
  '## Mandatory Multi-Agent entry',
  'modifies durable artifacts',
  'creates formal project outcomes',
  'affects runtime state or environment',
  'is primarily review, testing, verification, audit, risk assessment, or release readiness',
  'produces reusable procedures',
  '## User override rule',
  '## Required routing decision record'
]) {
  assert(routing.includes(needle), `routing-decision.md missing: ${needle}`);
}

const routingZh = read('docs/concepts/routing-decision.zh-CN.md');
for (const needle of [
  '`main` 是否可以直接完成这个任务，还是必须进入 Multi-Agent 流程？',
  '具体岗位路由由 `TEAM.md` 负责',
  '## main 自处理边界',
  '聊天 + 只读 + 非持久 + 低风险',
  '## 必须进入 Multi-Agent 的条件',
  '修改持久产物',
  '产生正式项目结果',
  '影响 runtime 状态或运行环境',
  '审查、测试、验证、审计、风险评估或发布就绪判断',
  '产生可复用流程',
  '## 用户 override 规则',
  '## 必需路由决策记录'
]) {
  assert(routingZh.includes(needle), `routing-decision.zh-CN.md missing: ${needle}`);
}

const archive = read('docs/concepts/shared-task-archive.md');
assert(archive.includes('routing.md'), 'shared-task-archive.md must mention routing.md');
assert(archive.includes('[Routing decision](routing-decision.md)'), 'shared-task-archive.md must link routing decision');

const roles = read('docs/concepts/roles-and-responsibilities.md');
assert(roles.includes('Before execution, `main` must decide only the entry boundary'), 'roles-and-responsibilities.md must require main entry boundary decision');
assert(roles.includes('`TEAM.md` decides concrete role routing'), 'roles-and-responsibilities.md must defer concrete routing to TEAM.md');

const taskTemplate = read('docs/reference/task-template.md');
assert(taskTemplate.includes('- `routing.md`'), 'task-template.md must list routing.md');

const constants = read('scripts/lib/constants.js');
assert(constants.includes("TASK_TEMPLATE_FILES = ['metadata.md', 'routing.md', 'status.md', 'brief.md', 'plan.md', 'subagents.md']"), 'TASK_TEMPLATE_FILES must include routing.md and subagents.md');
assert(constants.includes("'metadata.md', 'routing.md', 'status.md'"), 'ALL_TASK_TEMPLATE_FILES must include routing.md');
assert(constants.includes("'plan.md', 'subagents.md', 'agent-output.md'"), 'ALL_TASK_TEMPLATE_FILES must include subagents.md');

const template = read('task-templates/_template/routing.md');
for (const needle of ['## Decision', '## Reasoning', '## Direct handling allowed', '## Mandatory Multi-Agent entry triggers', '## Notes for TEAM.md routing', '## Re-routing log']) {
  assert(template.includes(needle), `task routing template missing: ${needle}`);
}

const mainAgents = read('roles/main/AGENTS.md');
for (const needle of ['## 3.1 main 自处理边界', '聊天、只读、非持久、低风险', '必须进入 Multi-Agent 流程', '由 TEAM.md 决定具体岗位路由']) {
  assert(mainAgents.includes(needle), `roles/main/AGENTS.md missing: ${needle}`);
}

if (failures) process.exit(1);
console.log('ok routing decision artifacts');

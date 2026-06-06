#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');

let failures = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(message);
    failures += 1;
  }
}

// Check workspace-template/TEAM.md
const team = fs.readFileSync(path.join(root, 'workspace-template', 'TEAM.md'), 'utf8');

for (const needle of [
  '### 3.6 子 Agent 模型选择协议',
  'main 调用 `sessions_spawn` 时，默认应省略 `model` 参数',
  '由 OpenClaw 配置决定子 Agent 使用的模型',
  '允许显式指定 `model` 的情况',
  '用户明确要求特定模型',
  '任务档案或项目协议要求',
  '临时降级或事故缓解',
  '在任务档案的 `subagents.md` 中记录使用的 `model` 和原因',
  '避免为常规子 Agent 硬编码便利别名',
  '因为"快一点""便宜一点""习惯用"等个人偏好而覆盖配置默认',
  '### 3.7 子 Agent 可恢复调度协议',
  '### 3.8 Multi-Agent 完成定义'
]) {
  assert(team.includes(needle), `workspace-template/TEAM.md missing: ${needle}`);
}

// Check roles/main/AGENTS.md
const agentsMain = fs.readFileSync(path.join(root, 'roles', 'main', 'AGENTS.md'), 'utf8');

for (const needle of [
  '调用 `sessions_spawn` 时，默认省略 `model` 参数',
  '由 OpenClaw 配置决定子 Agent 模型',
  '只有在用户明确要求特定模型、任务/项目协议要求，或临时降级/事故缓解时，才显式指定 `model`',
  '显式指定 `model` 时，必须在任务档案的 `subagents.md` 中记录模型和原因'
]) {
  assert(agentsMain.includes(needle), `roles/main/AGENTS.md missing: ${needle}`);
}

// Check task-templates/_template/subagents.md
const subagentsTemplate = fs.readFileSync(path.join(root, 'task-templates', '_template', 'subagents.md'), 'utf8');

for (const needle of [
  'Default: omit `model` in sessions_spawn',
  'rely on OpenClaw config/agent defaults',
  'Record model + reason when explicitly overriding',
  '| model | model reason |',
  'Model reason examples'
]) {
  assert(subagentsTemplate.includes(needle), `task-templates/_template/subagents.md missing: ${needle}`);
}

// Verify no hardcoded model overrides in examples
const examplesDir = path.join(root, 'examples');
if (fs.existsSync(examplesDir)) {
  const files = fs.readdirSync(examplesDir, { recursive: true });
  for (const file of files) {
    if (file.endsWith('.md')) {
      const content = fs.readFileSync(path.join(examplesDir, file), 'utf8');
      // Allow documentation mentions but flag spawn examples with model: ddgpt
      if (content.includes('sessions_spawn') && content.match(/model:\s*['"]?ddgpt/i)) {
        console.warn(`Warning: examples/${file} contains sessions_spawn with hardcoded ddgpt model`);
      }
    }
  }
}

if (failures) process.exit(1);
console.log('ok subagent model override protocol');

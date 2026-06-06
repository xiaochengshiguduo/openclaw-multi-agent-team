#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const inventory = require(path.join(root, 'scripts', 'lib', 'runtime-localization-inventory.json'));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function zhMirrorPath(rel) {
  return rel.replace(/\.md$/, inventory.localizedMirrorSuffix || '.zh-CN.md');
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function headingOutline(text) {
  return text.split(/\r?\n/)
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) => {
      const m = line.match(/^(#{1,6})\s+(.*)$/);
      return { level: m[1].length, text: m[2].trim() };
    });
}

function hasCjk(text) {
  return /[\u3400-\u9fff]/.test(text);
}

function containsAll(text, phrases, rel) {
  for (const phrase of phrases) {
    assert(text.includes(phrase), `${rel} missing critical protocol anchor: ${phrase}`);
  }
}

assert(inventory.localizedMirrorSuffix === '.zh-CN.md', 'inventory must declare .zh-CN.md mirror suffix');
assert(Array.isArray(inventory.sourceFiles) && inventory.sourceFiles.length > 0, 'inventory sourceFiles required');

const seen = new Set();
for (const item of inventory.sourceFiles) {
  assert(item.path.endsWith('.md') && !item.path.endsWith('.zh-CN.md'), `inventory must list English source markdown only: ${item.path}`);
  const mirror = zhMirrorPath(item.path);
  assert(!seen.has(mirror), `duplicate zh-CN mirror path: ${mirror}`);
  seen.add(mirror);
  assert(fs.existsSync(path.join(root, mirror)), `missing zh-CN mirror for ${item.path}: ${mirror}`);

  const en = read(item.path);
  const zh = read(mirror);
  assert(zh.trim().length > 0, `empty zh-CN mirror: ${mirror}`);
  assert(hasCjk(zh), `zh-CN mirror must contain Chinese text: ${mirror}`);

  const enHeadings = headingOutline(en);
  const zhHeadings = headingOutline(zh);
  assert(zhHeadings.length === enHeadings.length, `heading count mismatch for ${mirror}: expected ${enHeadings.length}, got ${zhHeadings.length}`);
  for (let i = 0; i < enHeadings.length; i += 1) {
    assert(zhHeadings[i].level === enHeadings[i].level, `heading level mismatch for ${mirror} at #${i + 1}: expected ${enHeadings[i].level}, got ${zhHeadings[i].level}`);
  }
}

containsAll(read('roles/main/AGENTS.zh-CN.md'), [
  'main 自处理边界',
  '调度规则',
  '记忆规则',
  'Multi-Agent'
], 'roles/main/AGENTS.zh-CN.md');
containsAll(read('workspace-template/TEAM.zh-CN.md'), [
  '子 Agent 模型选择协议',
  '子 Agent 可恢复调度协议',
  '权限矩阵',
  '任务档案'
], 'workspace-template/TEAM.zh-CN.md');
containsAll(read('task-templates/_template/subagents.zh-CN.md'), [
  'Recovery Log',
  'cleanup',
  'model reason',
  'sessions_yield'
], 'task-templates/_template/subagents.zh-CN.md');
containsAll(read('task-templates/_template/main-supervisor-sop.zh-CN.md'), [
  'main 是用户唯一入口',
  'Multi-Agent 流程',
  '子 Agent 可恢复调度 SOP'
], 'task-templates/_template/main-supervisor-sop.zh-CN.md');

console.log(`ok runtime localization bilingual mirrors (${seen.size} zh-CN mirrors)`);

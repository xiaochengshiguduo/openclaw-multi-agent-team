#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const rolesRoot = path.join(root, 'roles');
const roles = fs.readdirSync(rolesRoot).filter((name) => fs.statSync(path.join(rolesRoot, name)).isDirectory()).sort();

let failures = 0;
function fail(message) {
  console.error(message);
  failures += 1;
}

for (const role of roles) {
  const file = path.join(rolesRoot, role, 'AGENTS.md');
  if (!fs.existsSync(file)) {
    fail(`Missing AGENTS.md for role: ${role}`);
    continue;
  }

  const text = fs.readFileSync(file, 'utf8');
  if (!text.startsWith(`# AGENTS.md - ${role} /`)) {
    fail(`Unexpected AGENTS.md title for role ${role}`);
  }
  if (!text.includes('SOUL.md')) {
    fail(`AGENTS.md for role ${role} does not reference SOUL.md`);
  }
  if (!text.includes('## 2. 岗位焦点')) {
    fail(`AGENTS.md for role ${role} is missing role focus section`);
  }
  if (!text.includes(`${role} Checklist`)) {
    fail(`AGENTS.md for role ${role} is missing role checklist`);
  }
  if (!text.includes('至少检查')) {
    fail(`AGENTS.md for role ${role} checklist should include check items`);
  }
  if (!text.includes('## 6. 输出格式') && !text.includes('## 7. 对用户输出')) {
    fail(`AGENTS.md for role ${role} is missing output guidance`);
  }
}

const mainText = fs.readFileSync(path.join(rolesRoot, 'main', 'AGENTS.md'), 'utf8');
for (const forbidden of [
  '用户默认不直接与你沟通',
  '你也不直接对用户输出',
  '请按以下格式回复 main',
  '未经 main 明确授权'
]) {
  if (mainText.includes(forbidden)) fail(`main AGENTS.md contains child-agent-only phrase: ${forbidden}`);
}
if (!mainText.includes('你直接面向用户')) fail('main AGENTS.md does not say it directly faces the user');
if (!mainText.includes('Telegram')) fail('main AGENTS.md should include Telegram-facing guidance');

for (const role of roles.filter((name) => name !== 'main')) {
  const text = fs.readFileSync(path.join(rolesRoot, role, 'AGENTS.md'), 'utf8');
  if (!text.includes('用户默认不直接与你沟通；你也不直接对用户输出。')) {
    fail(`${role} AGENTS.md is missing child-agent user boundary`);
  }
  if (!text.includes('请按以下格式回复 main：')) {
    fail(`${role} AGENTS.md is missing child-agent output format`);
  }
  if (!text.includes(`## 1. 基本关系`)) {
    fail(`${role} AGENTS.md is missing basic relationship section`);
  }
}

if (failures) process.exit(1);
console.log(`ok role agent protocols (${roles.length} roles)`);

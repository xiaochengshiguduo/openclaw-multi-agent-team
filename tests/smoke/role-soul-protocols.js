#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const rolesRoot = path.join(root, 'roles');
const roles = fs.readdirSync(rolesRoot).filter((name) => fs.statSync(path.join(rolesRoot, name)).isDirectory()).sort();
const childRoles = roles.filter((role) => role !== 'main');

let failures = 0;
function fail(message) {
  console.error(message);
  failures += 1;
}

for (const role of roles) {
  const file = path.join(rolesRoot, role, 'SOUL.md');
  if (!fs.existsSync(file)) {
    fail(`Missing SOUL.md for role: ${role}`);
    continue;
  }

  const text = fs.readFileSync(file, 'utf8');
  if (!text.startsWith(`# ${role} - `)) fail(`${role} SOUL.md has unexpected title`);
  for (const heading of ['## 身份', '## 性格', '## 职责', '## 边界', '## 输出要求']) {
    if (!text.includes(heading)) fail(`${role} SOUL.md missing heading: ${heading}`);
  }
  if (!text.includes('AGENTS.md / Task Brief')) {
    fail(`${role} SOUL.md output requirement should defer to AGENTS.md / Task Brief`);
  }
}

for (const role of childRoles) {
  const text = fs.readFileSync(path.join(rolesRoot, role, 'SOUL.md'), 'utf8');
  for (const phrase of [
    '只对 main 输出，不直接面向用户',
    "必须围绕 main 的 Task Brief 工作，不绕过 main 联系其他 Agent 或外部系统",
    '未经 main 明确授权，不执行外部写操作'
  ]) {
    if (!text.includes(phrase)) fail(`${role} SOUL.md missing governance/safety phrase: ${phrase}`);
  }
}

const mainText = fs.readFileSync(path.join(rolesRoot, 'main', 'SOUL.md'), 'utf8');
for (const phrase of [
  '聊天、只读、非持久、低风险',
  '必须进入 Multi-Agent',
  '按 TEAM.md 建档'
]) {
  if (!mainText.includes(phrase)) fail(`main SOUL.md missing boundary phrase: ${phrase}`);
}

const researchText = fs.readFileSync(path.join(rolesRoot, 'research', 'SOUL.md'), 'utf8');
if (!researchText.includes('主要服务对象：main')) {
  fail('research SOUL.md should reference main');
}

const architectText = fs.readFileSync(path.join(rolesRoot, 'architect', 'SOUL.md'), 'utf8');
if (!architectText.includes('主要服务对象：main')) {
  fail('architect SOUL.md should reference main');
}

const securityText = fs.readFileSync(path.join(rolesRoot, 'security', 'SOUL.md'), 'utf8');
if (!securityText.includes('不执行攻击性测试')) {
  fail('security SOUL.md should preserve testing authorization');
}
if (!securityText.includes('不打印值')) {
  fail('security SOUL.md should avoid exposing sensitive values');
}

if (failures) process.exit(1);
console.log(`ok role SOUL protocols (${roles.length} roles)`);

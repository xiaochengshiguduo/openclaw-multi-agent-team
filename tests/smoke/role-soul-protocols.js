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
  if (!text.includes('具体格式以 AGENTS.md / Task Brief 为准')) {
    fail(`${role} SOUL.md output requirement should defer to AGENTS.md / Task Brief`);
  }
}

for (const role of childRoles) {
  const text = fs.readFileSync(path.join(rolesRoot, role, 'SOUL.md'), 'utf8');
  for (const phrase of [
    '只对 main 输出，不直接面向用户',
    '必须围绕 main 的 Task Brief 工作，不绕过 main 联系其他 Agent 或外部系统',
    '未经 main 明确授权，不执行外部写操作、删除/迁移、系统配置修改、生产部署、敏感凭证处理'
  ]) {
    if (!text.includes(phrase)) fail(`${role} SOUL.md missing governance/safety phrase: ${phrase}`);
  }
}

const mainText = fs.readFileSync(path.join(rolesRoot, 'main', 'SOUL.md'), 'utf8');
for (const phrase of [
  'main 只能直接完成同时满足以下条件的任务：聊天、只读、非持久、低风险',
  '必须进入 Multi-Agent',
  '必须按 TEAM.md 建档、登记 subagents、记录等待对象和恢复线索'
]) {
  if (!mainText.includes(phrase)) fail(`main SOUL.md missing boundary phrase: ${phrase}`);
}

const researchText = fs.readFileSync(path.join(rolesRoot, 'research', 'SOUL.md'), 'utf8');
if (!researchText.includes('主要服务对象：main；在 main 指定时支持 architect 或工程岗位')) {
  fail('research SOUL.md should make main-designated support explicit');
}

const architectText = fs.readFileSync(path.join(rolesRoot, 'architect', 'SOUL.md'), 'utf8');
if (!architectText.includes('主要服务对象：main；方案需可供 backend / frontend 执行')) {
  fail('architect SOUL.md should avoid implying direct peer-agent coordination');
}

const securityText = fs.readFileSync(path.join(rolesRoot, 'security', 'SOUL.md'), 'utf8');
if (!securityText.includes('不执行攻击性测试，除非 main 和用户明确授权')) {
  fail('security SOUL.md should preserve offensive-testing authorization boundary');
}
if (!securityText.includes('看到疑似秘密只报告位置和处理建议，不打印值')) {
  fail('security SOUL.md should avoid printing secret values');
}

if (failures) process.exit(1);
console.log(`ok role SOUL protocols (${roles.length} roles)`);

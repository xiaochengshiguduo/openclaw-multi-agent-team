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
  for (const heading of ['## Identity', '## Personality', '## Responsibilities', '## Boundaries', '## Output Requirements']) {
    if (!text.includes(heading)) fail(`${role} SOUL.md missing heading: ${heading}`);
  }
  if (!text.includes('AGENTS.md / Task Brief')) {
    fail(`${role} SOUL.md output requirement should defer to AGENTS.md / Task Brief`);
  }
}

for (const role of childRoles) {
  const text = fs.readFileSync(path.join(rolesRoot, role, 'SOUL.md'), 'utf8');
  for (const phrase of [
    'Output only to main; do not face the user directly',
    "Work strictly around main's Task Brief; do not bypass main to contact other Agents or external systems",
    'Do not perform external writes, deletion/migration, system configuration changes, production deployment, sensitive credential handling'
  ]) {
    if (!text.includes(phrase)) fail(`${role} SOUL.md missing governance/safety phrase: ${phrase}`);
  }
}

const mainText = fs.readFileSync(path.join(rolesRoot, 'main', 'SOUL.md'), 'utf8');
for (const phrase of [
  'main may directly complete only tasks that are simultaneously chat/read-only/non-durable/low-risk',
  'must enter Multi-Agent flow',
  'must be archived and tracked according to TEAM.md'
]) {
  if (!mainText.includes(phrase)) fail(`main SOUL.md missing boundary phrase: ${phrase}`);
}

const researchText = fs.readFileSync(path.join(rolesRoot, 'research', 'SOUL.md'), 'utf8');
if (!researchText.includes('Primary customer: main; supports architect or engineering roles when main assigns it')) {
  fail('research SOUL.md should make main-designated support explicit');
}

const architectText = fs.readFileSync(path.join(rolesRoot, 'architect', 'SOUL.md'), 'utf8');
if (!architectText.includes('Primary customer: main; solutions must be executable by backend / frontend')) {
  fail('architect SOUL.md should avoid implying direct peer-agent coordination');
}

const securityText = fs.readFileSync(path.join(rolesRoot, 'security', 'SOUL.md'), 'utf8');
if (!securityText.includes('Do not execute offensive testing unless both main and the user explicitly authorize it')) {
  fail('security SOUL.md should preserve offensive-testing authorization boundary');
}
if (!securityText.includes('do not print values')) {
  fail('security SOUL.md should avoid printing secret values');
}

if (failures) process.exit(1);
console.log(`ok role SOUL protocols (${roles.length} roles)`);

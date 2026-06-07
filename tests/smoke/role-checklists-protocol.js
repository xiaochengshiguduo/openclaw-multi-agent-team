#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const rolesRoot = path.join(root, 'roles');

const expected = {
  pm: ['target users', 'scope', 'acceptance criteria', 'user statements'],
  architect: ['module boundaries', 'interface', 'migration', 'rollback'],
  backend: ['interface', 'data', 'permission', 'verification'],
  frontend: ['loading', 'empty', 'error', 'accessibility'],
  qa: ['test', 'automated', 'manual', 'severity'],
  reviewer: ['review scope', 'blocking issue', 'non-blocking suggestion', 'scope limitations'],
  security: ['trust boundaries', 'attack surface', 'secret values', 'user authorization'],
  devops: ['target environment', 'read-only', 'dry-run', 'rollback'],
  docs: ['reader', 'verified facts', 'bilingual', 'invented'],
  research: ['decision criteria', 'cross-check', 'facts', 'sources']
};

const forbiddenChildRolePhrases = [
  'ask the user directly',
  'decide on your own to call other Agents',
  'decide whether to enter Multi-Agent',
  'may modify all related files by default',
  'may restart directly',
  'may deploy directly',
  'proactively scan, brute-force, or exploit',
  'fill in unknown facts'
];

let failures = 0;
function fail(message) {
  console.error(message);
  failures += 1;
}

for (const [role, requiredPhrases] of Object.entries(expected)) {
  const file = path.join(rolesRoot, role, 'AGENTS.md');
  const text = fs.readFileSync(file, 'utf8');
  const lower = text.toLowerCase();
  const checklistHeading = `## 8. ${role} Checklist`;

  if (!text.includes(checklistHeading)) {
    fail(`${role} AGENTS.md missing checklist heading: ${checklistHeading}`);
  }
  if (!lower.includes('when taking')) {
    fail(`${role} checklist should frame checks around receiving a task`);
  }
  if (!lower.includes('check at least')) {
    fail(`${role} checklist should include explicit check guidance`);
  }

  for (const phrase of requiredPhrases) {
    if (!lower.includes(phrase.toLowerCase())) {
      fail(`${role} checklist missing role-specific phrase: ${phrase}`);
    }
  }

  for (const phrase of forbiddenChildRolePhrases) {
    if (lower.includes(phrase.toLowerCase())) {
      fail(`${role} AGENTS.md contains forbidden routing/permission phrase: ${phrase}`);
    }
  }
}

const mainText = fs.readFileSync(path.join(rolesRoot, 'main', 'AGENTS.md'), 'utf8');
if (!mainText.includes('main may directly complete only tasks that are simultaneously chat, read-only, non-durable, and low-risk.')) {
  fail('main self-handling boundary changed or missing');
}
if (!mainText.includes('## 9. main Checklist')) {
  fail('main AGENTS.md should include main checklist without changing the existing boundary sections');
}

if (failures) process.exit(1);
console.log('ok role checklists protocol');

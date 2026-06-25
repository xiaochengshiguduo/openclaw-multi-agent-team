#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const rolesRoot = path.join(root, 'roles');

const expected = {
  pm: ['目标用户', '范围', '验收标准', '用户原话'],
  architect: ['模块边界', '接口', '迁移', '回滚'],
  backend: ['接口', '数据', '权限', '验证'],
  frontend: ['加载', '空态', '错误态', '可访问性'],
  qa: ['测试', '自动化', '手工', '严重度'],
  reviewer: ['审查范围', 'blocking', 'non-blocking', '范围限制'],
  security: ['信任边界', '攻击面', '敏感值', '授权'],
  devops: ['目标环境', '只读', 'dry-run', '回滚'],
  docs: ['读者', '已验证事实', '中英文配对', '不支持项'],
  research: ['决策标准', '交叉验证', '事实', '来源'],
};

const forbiddenChildRolePhrases = [
  '直接询问用户',
  '自行决定联系其他 Agent',
  '决定是否进入 Multi-Agent',
  '默认可修改所有相关文件',
  '可直接重启',
  '可直接部署',
  '主动扫描、暴力破解或利用',
  '捏造未知事实',
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
  if (!text.includes('接手') && !text.includes('接到')) {
    fail(`${role} checklist should frame checks around receiving a task`);
  }
  if (!text.includes('至少检查')) {
    fail(`${role} checklist should include explicit check guidance`);
  }

  for (const phrase of requiredPhrases) {
    if (!text.includes(phrase)) {
      fail(`${role} checklist missing role-specific phrase: ${phrase}`);
    }
  }

  for (const phrase of forbiddenChildRolePhrases) {
    if (text.includes(phrase)) {
      fail(`${role} AGENTS.md contains forbidden routing/permission phrase: ${phrase}`);
    }
  }
}

const mainText = fs.readFileSync(path.join(rolesRoot, 'main', 'AGENTS.md'), 'utf8');
if (!mainText.includes('聊天、只读、非持久、低风险')) {
  fail('main self-handling boundary changed or missing');
}
if (!mainText.includes('main Checklist') && !mainText.includes('main 清单')) {
  fail('main AGENTS.md should include main checklist');
}

if (failures) process.exit(1);
console.log('ok role checklists protocol');

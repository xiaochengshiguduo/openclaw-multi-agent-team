#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const rolesRoot = path.join(root, 'roles');

const expected = {
  pm: ['目标用户', '范围', '验收标准', '用户原话'],
  architect: ['模块边界', '接口契约', '迁移路径', '回滚点'],
  backend: ['接口契约', '数据模型', '权限边界', '验证结果'],
  frontend: ['加载态', '空态', '错误态', '可访问性'],
  qa: ['测试用例', '自动化已跑', '手工已验', '严重度'],
  reviewer: ['审查范围', 'blocking issue', 'non-blocking suggestion', '审查范围限制'],
  security: ['信任边界', '攻击面', '敏感值', '用户明确授权'],
  devops: ['目标环境', '只读诊断', 'dry-run', '回滚'],
  docs: ['目标读者', '已验证事实', '中英文配对', '不要编造'],
  research: ['决策标准', '交叉验证', '事实', '来源']
};

const forbiddenChildRolePhrases = [
  '直接问用户',
  '自行决定调用其他 Agent',
  '决定是否进入 Multi-Agent',
  '默认可修改相关所有文件',
  '可直接重启',
  '可直接部署',
  '主动扫描、爆破、利用',
  '补齐未知事实'
];

let failures = 0;
function fail(message) {
  console.error(message);
  failures += 1;
}

for (const [role, requiredPhrases] of Object.entries(expected)) {
  const file = path.join(rolesRoot, role, 'AGENTS.md');
  const text = fs.readFileSync(file, 'utf8');
  const checklistHeading = `## 8. ${role} Checklist`;

  if (!text.includes(checklistHeading)) {
    fail(`${role} AGENTS.md missing checklist heading: ${checklistHeading}`);
  }
  if (!text.includes('接手')) {
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
if (!mainText.includes('main 只能直接完成同时满足以下条件的任务：聊天、只读、非持久、低风险。')) {
  fail('main self-handling boundary changed or missing');
}
if (!mainText.includes('## 9. main Checklist')) {
  fail('main AGENTS.md should include main checklist without changing the existing boundary sections');
}

if (failures) process.exit(1);
console.log('ok role checklists protocol');

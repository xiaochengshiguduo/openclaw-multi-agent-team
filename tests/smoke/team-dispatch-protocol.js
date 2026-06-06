#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const team = fs.readFileSync(path.join(root, 'workspace-template', 'TEAM.md'), 'utf8');

let failures = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(message);
    failures += 1;
  }
}

for (const needle of [
  '## 3. 进入 Multi-Agent 后的调度协议',
  '本节只适用于已经根据 `AGENTS.md` / `routing.md` 判定必须进入 Multi-Agent 流程的任务',
  '`TEAM.md` 只负责进入后的岗位选择、协作顺序、权限控制、恢复和完成标准',
  '目标不是人数最少',
  '### 3.2 调度模式',
  '调度模式只描述 Multi-Agent 内部协作形态',
  '### 3.3 串行 / 并行判断',
  '### 3.4 冲突处理协议',
  '证据优先',
  '### 3.5 Agent 权限矩阵',
  '外部写操作、发送消息、评论、PR、push、release',
  '部署、重启服务、修改系统配置',
  '### 3.6 子 Agent 可恢复调度协议',
  '### 3.7 Multi-Agent 完成定义',
  '## Dispatch Mode',
  '## Dependencies',
  '## Completion Criteria',
  'Permission level:',
  '### 4.1 功能实现类',
  '### 4.2 缺陷、事故和环境类',
  '### 4.3 审查、验证和发布类',
  '### 4.4 文档、调研和长期规则类',
  '发布就绪判断',
  '新增可复用 SOP / 模板 / skill',
  '`routing.md` 记录 main 入口判断以及进入 Multi-Agent 后的路由备注'
]) {
  assert(team.includes(needle), `TEAM.md missing: ${needle}`);
}

for (const forbidden of [
  'main-only',
  'direct handling',
  '默认尽量少拉人',
  '最少岗位优先',
  '最小团队原则'
]) {
  assert(!team.includes(forbidden), `TEAM.md should not contain forbidden phrase: ${forbidden}`);
}

if (failures) process.exit(1);
console.log('ok team dispatch protocol');

#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');

const excludedPrefixes = ['roles/', 'task-templates/', 'workspace-template/'];
const rootRuntimeFiles = new Set(['AGENTS.md', 'SOUL.md', 'USER.md', 'TOOLS.md', 'HEARTBEAT.md', 'IDENTITY.md']);
const runtimeLocalizationInventory = require(path.join(root, 'scripts', 'lib', 'runtime-localization-inventory.json'));
const allowedRuntimeZhMirrors = new Set(
  runtimeLocalizationInventory.sourceFiles
    .filter((item) => item.path.endsWith('.md'))
    .map((item) => item.path.replace(/\.md$/, runtimeLocalizationInventory.localizedMirrorSuffix || '.zh-CN.md'))
);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', 'reports'].includes(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(p);
  }
  return out;
}

function rel(file) {
  return path.relative(root, file).replace(/\\/g, '/');
}

function isExcluded(file) {
  const r = rel(file);
  return excludedPrefixes.some(prefix => r.startsWith(prefix)) || r.startsWith('memory/') || r.startsWith('shared/') || rootRuntimeFiles.has(r);
}

function stripFrontMatter(lines) {
  if (lines[0] !== '---') return { bodyStart: 0 };
  let i = 1;
  while (i < lines.length && lines[i] !== '---') i += 1;
  return { bodyStart: i < lines.length ? i + 1 : 0 };
}

function firstNonBlankLine(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const { bodyStart } = stripFrontMatter(lines);
  let i = bodyStart;
  while (i < lines.length && lines[i].trim() === '') i += 1;
  return { line: lines[i] || '', lineNo: i + 1 };
}

function hasSwitcher(file, expectedLink, side) {
  const first = firstNonBlankLine(file);
  if (side === 'en') return first.line.includes('English') && first.line.includes(expectedLink) && first.line.includes('中文');
  return first.line.includes('English') && first.line.includes(expectedLink) && first.line.includes('中文');
}

const mdFiles = walk(root);
const mdSet = new Set(mdFiles.map(rel));
let failures = 0;
let pairs = 0;

for (const file of mdFiles) {
  const r = rel(file);
  if (r.endsWith('.zh-CN.md')) continue;
  if (isExcluded(file)) continue;

  const zhRel = r.replace(/\.md$/, '.zh-CN.md');
  if (!mdSet.has(zhRel)) {
    console.error(`Missing zh-CN sibling for ${r}: expected ${zhRel}`);
    failures += 1;
    continue;
  }

  pairs += 1;
}

for (const file of mdFiles) {
  const r = rel(file);
  if (!r.endsWith('.zh-CN.md')) continue;
  const enRel = r.replace(/\.zh-CN\.md$/, '.md');
  if (!mdSet.has(enRel)) {
    console.error(`zh-CN file has no English sibling: ${r}`);
    failures += 1;
  }
  if (excludedPrefixes.some(prefix => r.startsWith(prefix)) && !allowedRuntimeZhMirrors.has(r)) {
    console.error(`Unexpected runtime zh-CN mirror not listed in runtime localization inventory: ${r}`);
    failures += 1;
  }
}

if (failures) process.exit(1);
console.log(`ok markdown language pairs (${pairs} English/Chinese pairs)`);

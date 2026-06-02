#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const p = path.join(dir, entry.name);
    const rel = path.relative(root, p).split(path.sep).join('/');
    if (isIgnoredPrivateWorkspaceFile(rel, entry)) continue;
    if (entry.isDirectory()) walk(p);
    else if (entry.isFile() && /\.(md|js|json|json5|sh)$/.test(entry.name)) files.push(p);
  }
}
function isIgnoredPrivateWorkspaceFile(rel, entry) {
  if (rel.startsWith('memory/') || rel.startsWith('shared/')) return true;
  if (entry.isDirectory()) return false;
  return ['AGENTS.md', 'SOUL.md', 'HEARTBEAT.md', 'IDENTITY.md', 'USER.md', 'TOOLS.md'].includes(rel);
}
walk(root);
let failures = 0;
const linkRe = /\[[^\]]+\]\(([^)]+)\)/g;
for (const file of files.filter(f => f.endsWith('.md'))) {
  const text = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = linkRe.exec(text))) {
    const target = match[1];
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const noAnchor = target.split('#')[0];
    if (!noAnchor) continue;
    const resolved = path.resolve(path.dirname(file), noAnchor);
    if (!fs.existsSync(resolved)) {
      console.error(`Broken link in ${path.relative(root, file)}: ${target}`);
      failures += 1;
    }
  }
}
if (failures) process.exit(1);
console.log(`ok markdown links (${files.filter(f => f.endsWith('.md')).length} markdown files)`);

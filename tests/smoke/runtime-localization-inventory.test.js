#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const inventoryPath = path.join(root, 'scripts', 'lib', 'runtime-localization-inventory.json');

const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

if (!inventory.sourceFiles || !Array.isArray(inventory.sourceFiles) || inventory.sourceFiles.length === 0) {
  console.error('inventory.sourceFiles must be a non-empty array');
  process.exit(1);
}

if (inventory.defaultLanguage !== 'zh-CN') {
  console.error('defaultLanguage must be zh-CN');
  process.exit(1);
}

// Verify all source files exist
let missing = 0;
for (const item of inventory.sourceFiles) {
  const filePath = path.join(root, item.path);
  if (!fs.existsSync(filePath)) {
    console.error(`source file missing: ${item.path}`);
    missing++;
  }
}
if (missing > 0) {
  console.error(`${missing} source file(s) missing`);
  process.exit(1);
}

console.log('runtime localization inventory smoke test passed');

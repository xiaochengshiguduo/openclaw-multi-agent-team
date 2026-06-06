#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const { ROLES, ALL_TASK_TEMPLATE_FILES } = require(path.join(root, 'scripts', 'lib', 'constants.js'));
const inventory = require(path.join(root, 'scripts', 'lib', 'runtime-localization-inventory.json'));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function listFiles(relDir, rx = /.*/) {
  return fs.readdirSync(path.join(root, relDir))
    .filter((name) => rx.test(name))
    .sort();
}

function normalizeSet(values) {
  return new Set(values.map((value) => String(value).replace(/\\/g, '/')));
}

assert(inventory.schemaVersion === 1, 'inventory schemaVersion must be 1');
assert(Array.isArray(inventory.languages), 'inventory languages must be an array');
assert(inventory.languages.includes('en'), 'inventory must include en');
assert(inventory.languages.includes('zh-CN'), 'inventory must include zh-CN');
assert(inventory.defaultLanguage === 'en', 'inventory defaultLanguage must be en');
assert(inventory.localizedMirrorSuffix === '.zh-CN.md', 'inventory mirror suffix must be .zh-CN.md');
assert(Array.isArray(inventory.sourceFiles), 'inventory sourceFiles must be an array');

const paths = inventory.sourceFiles.map((item) => item.path);
const pathSet = normalizeSet(paths);
assert(pathSet.size === paths.length, 'inventory must not contain duplicate source paths');

for (const item of inventory.sourceFiles) {
  assert(item && typeof item === 'object', 'inventory entries must be objects');
  assert(typeof item.path === 'string' && item.path.endsWith('.md'), `inventory entry path must be markdown: ${JSON.stringify(item)}`);
  assert(!item.path.endsWith('.zh-CN.md'), `inventory must list English source paths only for Step 2: ${item.path}`);
  assert(!path.isAbsolute(item.path), `inventory path must be relative: ${item.path}`);
  assert(!item.path.split('/').includes('..'), `inventory path must not traverse: ${item.path}`);
  assert(fs.existsSync(path.join(root, item.path)), `inventory source missing: ${item.path}`);
  assert(typeof item.kind === 'string' && item.kind, `inventory entry missing kind: ${item.path}`);
}

const expectedRoleFiles = [];
const roleDirs = listFiles('roles', /^[A-Za-z0-9_-]+$/);
assert(JSON.stringify(roleDirs) === JSON.stringify([...ROLES].sort()), 'roles/ directories must match scripts/lib/constants.js ROLES');
for (const role of ROLES) {
  expectedRoleFiles.push(`roles/${role}/AGENTS.md`, `roles/${role}/SOUL.md`);
}
for (const rel of expectedRoleFiles) {
  assert(pathSet.has(rel), `inventory missing role runtime source: ${rel}`);
}
for (const rel of [...pathSet].filter((p) => p.startsWith('roles/'))) {
  assert(expectedRoleFiles.includes(rel), `inventory has unexpected role runtime source: ${rel}`);
}

const expectedWorkspaceFiles = [
  'workspace-template/AGENTS.md',
  'workspace-template/SOUL.md',
  'workspace-template/TEAM.md',
  'workspace-template/USER.template.md',
  'workspace-template/TOOLS.template.md',
  'workspace-template/MEMORY.template.md',
  'workspace-template/HEARTBEAT.template.md',
  'workspace-template/IDENTITY.template.md'
].sort();
for (const rel of expectedWorkspaceFiles) {
  assert(pathSet.has(rel), `inventory missing workspace generation source: ${rel}`);
}
for (const rel of [...pathSet].filter((p) => p.startsWith('workspace-template/'))) {
  assert(expectedWorkspaceFiles.includes(rel), `inventory has unexpected workspace-template source: ${rel}`);
}

const taskTemplateFiles = listFiles('task-templates/_template', /^[^.].*\.md$/)
  .filter((name) => !name.endsWith('.zh-CN.md'));
assert(JSON.stringify(taskTemplateFiles) === JSON.stringify([...ALL_TASK_TEMPLATE_FILES].sort()), 'task template directory must match ALL_TASK_TEMPLATE_FILES');
for (const name of taskTemplateFiles) {
  const rel = `task-templates/_template/${name}`;
  assert(pathSet.has(rel), `inventory missing task template source: ${rel}`);
}

const manifestDir = path.join(root, 'updates', 'runtime');
function inventoryTarget(item) {
  if (item.path === 'workspace-template/TEAM.md') return 'workspace/TEAM.md';
  if (item.target.startsWith('workspace/') || item.target.startsWith('workspace-')) return item.target;
  return `workspace/${item.target}`;
}

for (const name of listFiles('updates/runtime', /^\d+\.\d+\.\d+\.json$/)) {
  const manifest = JSON.parse(fs.readFileSync(path.join(manifestDir, name), 'utf8'));
  assert(Array.isArray(manifest.files), `runtime manifest missing files array: ${name}`);
  for (const file of manifest.files) {
    assert(typeof file.source === 'string' && file.source, `manifest item missing source: ${name}`);
    assert(pathSet.has(file.source), `inventory missing source referenced by ${name}: ${file.source}`);
    if (file.sources) {
      assert(file.sources.en === file.source || file.sources.en, `localized manifest source map must include en: ${name} ${file.target}`);
      for (const [language, rel] of Object.entries(file.sources)) {
        assert(language === 'en' || language === 'zh-CN', `unexpected localized source language ${language} in ${name}`);
        if (language === 'zh-CN') {
          assert(rel.endsWith('.zh-CN.md'), `zh-CN manifest source must use .zh-CN.md mirror in ${name}: ${rel}`);
          assert(fs.existsSync(path.join(root, rel)), `manifest zh-CN source missing in ${name}: ${rel}`);
        } else {
          assert(pathSet.has(rel), `inventory missing localized manifest source ${language} in ${name}: ${rel}`);
        }
      }
    }
  }
}

const localizationManifest = JSON.parse(fs.readFileSync(path.join(manifestDir, '1.2.0.json'), 'utf8'));
const localizationTargets = new Map(localizationManifest.files.map((file) => [file.target, file]));
const updaterExcludedWorkspaceTemplateSources = new Set([
  // Role-specific files are installed from roles/<role>/... during generation and update.
  'workspace-template/AGENTS.md',
  'workspace-template/SOUL.md',
  // User-local files are generated on new machines but should not be overwritten by runtime updates.
  'workspace-template/USER.template.md',
  'workspace-template/TOOLS.template.md',
  'workspace-template/MEMORY.template.md',
  'workspace-template/HEARTBEAT.template.md',
  'workspace-template/IDENTITY.template.md'
]);
function isUpdaterLocalizedSource(item) {
  return item.kind === 'role-agents'
    || item.kind === 'role-soul'
    || item.kind === 'task-template'
    || item.path === 'workspace-template/TEAM.md';
}
for (const item of inventory.sourceFiles) {
  if (!isUpdaterLocalizedSource(item)) {
    assert(updaterExcludedWorkspaceTemplateSources.has(item.path), `unexpected source excluded from 1.2.0 updater coverage: ${item.path}`);
    continue;
  }
  const expectedTarget = inventoryTarget(item);
  const file = localizationTargets.get(expectedTarget);
  assert(file, `1.2.0 manifest missing localized inventory target: ${expectedTarget} from ${item.path}`);
  assert(file.source === item.path, `1.2.0 manifest source mismatch for ${expectedTarget}: expected ${item.path}, got ${file.source}`);
  assert(file.sources && file.sources.en === item.path, `1.2.0 manifest missing en source for ${expectedTarget}`);
  assert(file.sources['zh-CN'] === item.path.replace(/\.md$/, '.zh-CN.md'), `1.2.0 manifest missing zh-CN mirror source for ${expectedTarget}`);
}
for (const file of localizationManifest.files) {
  const inventoryItem = inventory.sourceFiles.find((item) => inventoryTarget(item) === file.target && item.path === file.source);
  assert(inventoryItem, `1.2.0 manifest entry is not backed by inventory: ${file.target} from ${file.source}`);
  assert(isUpdaterLocalizedSource(inventoryItem), `1.2.0 manifest unexpectedly includes updater-excluded source: ${file.source}`);
}

console.log('runtime localization inventory smoke test passed');

#!/usr/bin/env node
'use strict';

const assert = require('assert');
const {
  DEFAULT_RUNTIME_LANGUAGE,
  normalizeRuntimeLanguage,
  resolveManifestSource
} = require('../../scripts/lib/runtime-localization');

// Default language is zh-CN
assert.strictEqual(DEFAULT_RUNTIME_LANGUAGE, 'zh-CN');

// normalizeRuntimeLanguage
assert.strictEqual(normalizeRuntimeLanguage(), 'zh-CN');
assert.strictEqual(normalizeRuntimeLanguage(''), 'zh-CN');
assert.strictEqual(normalizeRuntimeLanguage('zh-CN'), 'zh-CN');
assert.throws(() => normalizeRuntimeLanguage('en'), /invalid language: en/);
assert.throws(() => normalizeRuntimeLanguage('fr'), /invalid language: fr/);

// resolveManifestSource - simple source field
assert.strictEqual(
  resolveManifestSource({ source: 'roles/main/AGENTS.md' }),
  'roles/main/AGENTS.md',
  'source field should resolve directly'
);

// resolveManifestSource - rejects missing source
assert.throws(
  () => resolveManifestSource({ }),
  /source must be a non-empty string/,
  'missing source should throw'
);

// resolveManifestSource - rejects null item
assert.throws(
  () => resolveManifestSource(null),
  /manifest item must be an object/,
  'null item should throw'
);

console.log('ok runtime localization source resolution');

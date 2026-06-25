#!/usr/bin/env node
'use strict';

const assert = require('assert');
const {
  DEFAULT_RUNTIME_LANGUAGE,
  SUPPORTED_RUNTIME_LANGUAGES,
  normalizeRuntimeLanguage,
  resolveManifestSource
} = require('../../scripts/lib/runtime-localization');

assert.strictEqual(DEFAULT_RUNTIME_LANGUAGE, 'zh-CN');
assert.deepStrictEqual(SUPPORTED_RUNTIME_LANGUAGES, ['en', 'zh-CN']);
assert.strictEqual(normalizeRuntimeLanguage(), 'zh-CN');
assert.strictEqual(normalizeRuntimeLanguage(''), 'zh-CN');
assert.strictEqual(normalizeRuntimeLanguage('en'), 'en');
assert.strictEqual(normalizeRuntimeLanguage('zh-CN'), 'zh-CN');
assert.throws(() => normalizeRuntimeLanguage('fr'), /invalid language: fr/);

// Legacy source (no sources map) resolves for default language zh-CN
assert.strictEqual(
  resolveManifestSource({ source: 'roles/main/AGENTS.md' }, 'zh-CN'),
  'roles/main/AGENTS.md',
  'legacy source should resolve for default language zh-CN'
);

// Legacy source fails for non-default language en
assert.throws(
  () => resolveManifestSource({ source: 'roles/main/AGENTS.md' }, 'en'),
  /source missing for selected language en/,
  'legacy source must not silently resolve to default for English'
);

// sources map overrides legacy source
assert.strictEqual(
  resolveManifestSource({ source: 'fallback.md', sources: { en: 'english.md' } }, 'en'),
  'english.md',
  'sources.en should override legacy source for English when present'
);

assert.strictEqual(
  resolveManifestSource({ source: 'fallback.md', sources: { en: 'english.md', 'zh-CN': 'chinese.md' } }, 'zh-CN'),
  'chinese.md',
  'sources.zh-CN should resolve for Chinese'
);

// English fails when sources.en is absent (no fallback to legacy source when sources map exists)
assert.throws(
  () => resolveManifestSource({ source: 'fallback.md', sources: { 'zh-CN': 'chinese.md' } }, 'en'),
  /source missing for selected language en/,
  'English should fail when sources.en is absent'
);

// Chinese fails when sources.zh-CN is absent (no fallback when sources map exists)
assert.throws(
  () => resolveManifestSource({ source: 'fallback.md', sources: { en: 'english.md' } }, 'zh-CN'),
  /source missing for selected language zh-CN/,
  'Chinese should fail when sources.zh-CN is absent'
);

assert.throws(
  () => resolveManifestSource({ source: 'fallback.md', sources: { fr: 'french.md' } }, 'en'),
  /invalid manifest source language: fr/,
  'unknown sources map language should fail clearly'
);

assert.throws(
  () => resolveManifestSource({ source: 'fallback.md' }, 'fr'),
  /invalid language: fr/,
  'unknown selected language should fail clearly'
);

console.log('ok runtime localization source resolution');

#!/usr/bin/env node
'use strict';

const assert = require('assert');
const {
  DEFAULT_RUNTIME_LANGUAGE,
  SUPPORTED_RUNTIME_LANGUAGES,
  normalizeRuntimeLanguage,
  resolveManifestSource
} = require('../../scripts/lib/runtime-localization');

assert.strictEqual(DEFAULT_RUNTIME_LANGUAGE, 'en');
assert.deepStrictEqual(SUPPORTED_RUNTIME_LANGUAGES, ['en', 'zh-CN']);
assert.strictEqual(normalizeRuntimeLanguage(), 'en');
assert.strictEqual(normalizeRuntimeLanguage(''), 'en');
assert.strictEqual(normalizeRuntimeLanguage('en'), 'en');
assert.strictEqual(normalizeRuntimeLanguage('zh-CN'), 'zh-CN');
assert.throws(() => normalizeRuntimeLanguage('fr'), /invalid language: fr/);

assert.strictEqual(
  resolveManifestSource({ source: 'roles/main/AGENTS.md' }, 'en'),
  'roles/main/AGENTS.md',
  'legacy source should resolve for English'
);

assert.throws(
  () => resolveManifestSource({ source: 'roles/main/AGENTS.md' }, 'zh-CN'),
  /source missing for selected language zh-CN/,
  'legacy source must not silently resolve to English for Chinese'
);

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

assert.strictEqual(
  resolveManifestSource({ source: 'fallback.md', sources: { 'zh-CN': 'chinese.md' } }, 'en'),
  'fallback.md',
  'English should fall back to legacy source when sources.en is absent'
);

assert.throws(
  () => resolveManifestSource({ source: 'fallback.md', sources: { en: 'english.md' } }, 'zh-CN'),
  /source missing for selected language zh-CN/,
  'Chinese should fail clearly instead of falling back to English'
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

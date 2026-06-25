'use strict';

const DEFAULT_RUNTIME_LANGUAGE = 'zh-CN';

function normalizeRuntimeLanguage(language, { field = 'language' } = {}) {
  const value = language === undefined || language === null || language === '' ? DEFAULT_RUNTIME_LANGUAGE : language;
  if (value !== DEFAULT_RUNTIME_LANGUAGE) {
    throw new Error(`invalid ${field}: ${value}; only ${DEFAULT_RUNTIME_LANGUAGE} is supported`);
  }
  return value;
}

function resolveManifestSource(item) {
  if (!item || typeof item !== 'object') throw new Error('manifest item must be an object');
  if (!item.source || typeof item.source !== 'string') throw new Error('source must be a non-empty string');
  return item.source;
}

module.exports = {
  DEFAULT_RUNTIME_LANGUAGE,
  normalizeRuntimeLanguage,
  resolveManifestSource
};

'use strict';

const SUPPORTED_RUNTIME_LANGUAGES = Object.freeze(['en', 'zh-CN']);
const DEFAULT_RUNTIME_LANGUAGE = 'zh-CN';

function normalizeRuntimeLanguage(language, { defaultLanguage = DEFAULT_RUNTIME_LANGUAGE, field = 'language' } = {}) {
  const value = language === undefined || language === null || language === '' ? defaultLanguage : language;
  if (!SUPPORTED_RUNTIME_LANGUAGES.includes(value)) {
    throw new Error(`invalid ${field}: ${value}; supported languages: ${SUPPORTED_RUNTIME_LANGUAGES.join(', ')}`);
  }
  return value;
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function resolveManifestSource(item, language = DEFAULT_RUNTIME_LANGUAGE) {
  if (!item || typeof item !== 'object') throw new Error('manifest item must be an object');
  const selectedLanguage = normalizeRuntimeLanguage(language);
  const sources = item.sources;

  if (sources !== undefined) {
    if (!sources || typeof sources !== 'object' || Array.isArray(sources)) {
      throw new Error('manifest sources must be an object map');
    }
    for (const key of Object.keys(sources)) normalizeRuntimeLanguage(key, { field: 'manifest source language' });

    if (selectedLanguage === DEFAULT_RUNTIME_LANGUAGE && hasOwn(sources, DEFAULT_RUNTIME_LANGUAGE)) {
      if (!sources[DEFAULT_RUNTIME_LANGUAGE] || typeof sources[DEFAULT_RUNTIME_LANGUAGE] !== 'string') {
        throw new Error(`manifest source for ${DEFAULT_RUNTIME_LANGUAGE} must be a non-empty string`);
      }
      return sources[DEFAULT_RUNTIME_LANGUAGE];
    }
    if (selectedLanguage === DEFAULT_RUNTIME_LANGUAGE) {
      throw new Error(`manifest source missing for selected language ${selectedLanguage}`);
    }
    if (selectedLanguage !== DEFAULT_RUNTIME_LANGUAGE) {
      if (!hasOwn(sources, selectedLanguage)) {
        throw new Error(`manifest source missing for selected language ${selectedLanguage}`);
      }
      if (!sources[selectedLanguage] || typeof sources[selectedLanguage] !== 'string') {
        throw new Error(`manifest source for ${selectedLanguage} must be a non-empty string`);
      }
      return sources[selectedLanguage];
    }
  }

  if (selectedLanguage !== DEFAULT_RUNTIME_LANGUAGE) {
    throw new Error(`manifest source missing for selected language ${selectedLanguage}`);
  }

  if (!item.source || typeof item.source !== 'string') throw new Error('source must be a non-empty string');
  return item.source;
}

module.exports = {
  DEFAULT_RUNTIME_LANGUAGE,
  SUPPORTED_RUNTIME_LANGUAGES,
  normalizeRuntimeLanguage,
  resolveManifestSource
};

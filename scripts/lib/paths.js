'use strict';

const path = require('path');
const os = require('os');

function projectRoot() {
  return path.resolve(__dirname, '..', '..');
}

function expandHome(input) {
  if (!input) return input;
  if (input === '~') return os.homedir();
  if (input.startsWith('~/')) return path.join(os.homedir(), input.slice(2));
  return input;
}

function resolvePath(input) {
  return path.resolve(expandHome(input));
}

function assertInside(child, parent, label = 'path') {
  const rel = path.relative(parent, child);
  if (rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))) return;
  throw new Error(`${label} escapes root: ${child} is not inside ${parent}`);
}

module.exports = { projectRoot, expandHome, resolvePath, assertInside };

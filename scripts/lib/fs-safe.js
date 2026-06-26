'use strict';

const fs = require('fs');
const path = require('path');

function exists(p) {
  return fs.existsSync(p);
}

function ensureDir(p, actions) {
  actions.push({ type: 'mkdir', path: p });
}

function copyFile(src, dest, actions) {
  actions.push({ type: 'copy', src, dest });
}

function symlink(target, linkPath, actions) {
  actions.push({ type: 'symlink', target, path: linkPath });
}

function removePath(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function applyActions(actions, { force = false } = {}) {
  const results = [];
  for (const action of actions) {
    if (action.type === 'mkdir') {
      if (exists(action.path)) {
        results.push({ ...action, status: 'skipped', reason: 'exists' });
      } else {
        fs.mkdirSync(action.path, { recursive: true });
        results.push({ ...action, status: 'created' });
      }
    } else if (action.type === 'copy') {
      fs.mkdirSync(path.dirname(action.dest), { recursive: true });
      const existed = exists(action.dest);
      if (existed && !force) {
        results.push({ ...action, status: 'skipped', reason: 'exists' });
      } else {
        fs.copyFileSync(action.src, action.dest, force ? 0 : fs.constants.COPYFILE_EXCL);
        results.push({ ...action, status: existed && force ? 'overwritten' : 'copied' });
      }
    } else if (action.type === 'write') {
      fs.mkdirSync(path.dirname(action.dest), { recursive: true });
      const existed = exists(action.dest);
      if (existed && !force) {
        results.push({ ...action, status: 'skipped', reason: 'exists' });
      } else {
        fs.writeFileSync(action.dest, action.content, 'utf8');
        results.push({ ...action, status: existed && force ? 'overwritten' : 'written' });
      }
    } else if (action.type === 'symlink') {
      if (exists(action.path)) {
        if (!force) {
          results.push({ ...action, status: 'skipped', reason: 'exists' });
        } else {
          removePath(action.path);
          fs.symlinkSync(action.target, action.path, 'dir');
          results.push({ ...action, status: 'overwritten' });
        }
      } else {
        fs.symlinkSync(action.target, action.path, 'dir');
        results.push({ ...action, status: 'linked' });
      }
    }
  }
  return results;
}

module.exports = { exists, ensureDir, copyFile, symlink, applyActions };

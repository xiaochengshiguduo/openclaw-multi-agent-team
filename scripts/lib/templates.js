'use strict';

const fs = require('fs');
const path = require('path');
const { projectRoot } = require('./paths');

function requireTemplate(rel) {
  const p = path.join(projectRoot(), rel);
  if (!fs.existsSync(p)) throw new Error(`Missing template: ${rel}`);
  return p;
}

module.exports = { requireTemplate };

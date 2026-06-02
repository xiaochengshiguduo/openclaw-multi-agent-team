'use strict';

const ROLE_RE = /^[a-z][a-z0-9-]{0,31}$/;
const TASK_SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

function assertRoleName(role) {
  if (!ROLE_RE.test(role)) throw new Error(`Invalid role name: ${role}`);
}

function assertTaskSlug(slug) {
  if (!TASK_SLUG_RE.test(slug)) throw new Error(`Invalid task slug: ${slug}`);
}

module.exports = { ROLE_RE, TASK_SLUG_RE, assertRoleName, assertTaskSlug };

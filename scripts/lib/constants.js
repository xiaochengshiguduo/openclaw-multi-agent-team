'use strict';

const ROLES = ['main', 'pm', 'architect', 'backend', 'frontend', 'qa', 'reviewer', 'security', 'devops', 'docs', 'research'];
const ROLE_AGENTS = ROLES.filter((role) => role !== 'main');
const TASK_TEMPLATE_FILES = ['metadata.md', 'routing.md', 'status.md', 'brief.md', 'plan.md', 'subagents.md'];
const ALL_TASK_TEMPLATE_FILES = [
  'metadata.md', 'routing.md', 'status.md', 'brief.md', 'plan.md', 'subagents.md', 'agent-output.md', 'requirements-package.md',
  'main-supervisor-sop.md', 'pm.md', 'architecture.md', 'backend.md', 'frontend.md', 'qa.md',
  'review.md', 'security.md', 'devops.md', 'docs.md', 'research.md', 'final.md'
];

const REQUIRED_NODE_MAJOR = 24;
const VERIFIED_OPENCLAW_VERSION = 'OpenClaw 2026.5.27';

module.exports = { ROLES, ROLE_AGENTS, TASK_TEMPLATE_FILES, ALL_TASK_TEMPLATE_FILES, REQUIRED_NODE_MAJOR, VERIFIED_OPENCLAW_VERSION };

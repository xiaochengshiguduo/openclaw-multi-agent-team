'use strict';

/**
 * Sections to keep for role (non-main) agent TEAM.md.
 * Keys are `## ` heading prefixes; everything under the heading until the
 * next `## ` (or `### ` at the same or higher level) is included.
 *
 * Special handling:
 *  - '## 2.' → only include the subsection matching the role name
 *  - '## 3.' → include intro paragraph + 3.1 + 3.5 + 3.7, skip 3.2-3.4, 3.6
 */
const ROLE_KEEP_SECTIONS = [
  '## 1. 团队原则',
  '## 1.1 跨 workspace 共享约定',
  '## 2. 岗位列表',       // filtered to own role
  '## 3. 进入 Multi-Agent 后的调度协议', // filtered subsections
  '## 5. 标准 Task Brief',
  '## 6. 标准输出格式',
  '## 7. 阻塞级别',
  '## 8. 任务档案',
  '## 9. 任务状态流转',
];

const ROLE_KEEP_SUBSECTIONS_3 = [
  '### 3.1 信息不足时的处理',
  '### 3.5 Agent 权限矩阵',
  '### 3.7 Multi-Agent 完成定义',
];

/**
 * Split TEAM.md into blocks by `## ` headings.
 * Returns [{ heading, lines }] where heading is the `## ...` line itself.
 */
function splitByH2(content) {
  const rawLines = content.split('\n');
  const blocks = [];
  let current = { heading: '', lines: [] };

  for (const line of rawLines) {
    if (/^## /.test(line)) {
      if (current.heading || current.lines.length) blocks.push(current);
      current = { heading: line, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.heading || current.lines.length) blocks.push(current);
  return blocks;
}

/**
 * Within a `## 2. 岗位列表` block, extract only the `### <role>` subsection.
 */
function filterRolesBlock(blockLines, roleName) {
  const result = [];
  let capturing = false;
  const targetHeading = `### ${roleName}`;

  for (const line of blockLines) {
    if (/^### /.test(line)) {
      if (line.trim().toLowerCase() === targetHeading.toLowerCase()) {
        capturing = true;
        result.push(line);
      } else {
        capturing = false;
      }
    } else if (capturing) {
      result.push(line);
    }
  }
  return result;
}

/**
 * Within a `## 3.` block, keep only intro + specific subsections.
 */
function filterSection3(blockLines) {
  const result = [];
  let currentSubsection = ''; // '' means intro area
  let keepSubsection = true;

  for (const line of blockLines) {
    if (/^### /.test(line)) {
      currentSubsection = line.trim();
      keepSubsection = ROLE_KEEP_SUBSECTIONS_3.some(k =>
        currentSubsection.toLowerCase().startsWith(k.toLowerCase())
      );
      if (keepSubsection) result.push(line);
    } else if (keepSubsection) {
      result.push(line);
    }
  }
  return result;
}

/**
 * Generate a trimmed TEAM.md for a specific role agent.
 * @param {string} fullContent - the complete TEAM.md content
 * @param {string} roleName - e.g. 'backend', 'pm'
 * @returns {string} trimmed content
 */
function generateRoleTeamMd(fullContent, roleName) {
  const blocks = splitByH2(fullContent);
  const output = [];

  for (const block of blocks) {
    const heading = block.heading;

    // Title line (no ## prefix) or meta block before first heading
    if (!heading) {
      // Keep the title and description
      output.push(...block.lines);
      continue;
    }

    // Check if this section should be kept
    const isKept = ROLE_KEEP_SECTIONS.some(k =>
      heading.trim().toLowerCase().startsWith(k.toLowerCase())
    );

    if (!isKept) continue;

    // Special handling for §2 (岗位列表) - only own role
    if (heading.trim().toLowerCase().startsWith('## 2. 岗位列表')) {
      output.push(heading);
      output.push('');
      output.push(...filterRolesBlock(block.lines, roleName));
      continue;
    }

    // Special handling for §3 (调度协议) - filtered subsections
    if (heading.trim().toLowerCase().startsWith('## 3. 进入 multi-agent')) {
      output.push(heading);
      output.push(...filterSection3(block.lines));
      continue;
    }

    // Default: keep entire block
    output.push(heading);
    output.push(...block.lines);
  }

  // Clean up trailing blank lines
  while (output.length && output[output.length - 1].trim() === '') output.pop();
  output.push(''); // single trailing newline

  return output.join('\n');
}

module.exports = { generateRoleTeamMd };

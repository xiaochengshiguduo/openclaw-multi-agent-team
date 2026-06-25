'use strict';

/**
 * Smart config merger for OpenClaw multi-agent team installation.
 *
 * Design goal: NEVER destroy user data. Merge the team template into an
 * existing OpenClaw config while preserving:
 * - User's model providers and API keys
 * - User's existing agents.list[] entries (merge by id, never blind-overwrite)
 * - Any user config sections the template does not own
 *
 * The merger is pure: it takes existing + template, returns { merged, plan }.
 * The plan describes every decision so callers can show a diff / ask the user.
 */

function isObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Deep merge where template fills gaps but existing user values win on scalar
 * conflicts unless the key is in templateOwnedKeys (team-managed sections).
 */
function deepMergePreferExisting(existing, template) {
  if (!isObject(existing)) return template;
  if (!isObject(template)) return existing;
  const out = { ...existing };
  for (const key of Object.keys(template)) {
    if (!(key in out)) {
      out[key] = template[key];
    } else if (isObject(out[key]) && isObject(template[key])) {
      out[key] = deepMergePreferExisting(out[key], template[key]);
    }
    // scalar/array conflict: keep existing user value
  }
  return out;
}

/**
 * Merge agents.list[] by id. Existing entries win on conflict, but the
 * template's subagents policy fields are merged into matching ids.
 */
function mergeAgentList(existingList, templateList, plan) {
  const existing = Array.isArray(existingList) ? existingList.map((a) => ({ ...a })) : [];
  const template = Array.isArray(templateList) ? templateList : [];
  const byId = new Map(existing.map((a) => [a.id, a]));

  for (const tplAgent of template) {
    if (!tplAgent || !tplAgent.id) continue;
    const found = byId.get(tplAgent.id);
    if (!found) {
      // New agent from template: add it
      byId.set(tplAgent.id, { ...tplAgent });
      plan.push({ type: 'agent-add', id: tplAgent.id, detail: 'new agent from team template' });
    } else {
      // Existing agent: merge subagents policy, preserve user's other fields
      const merged = { ...found };
      if (tplAgent.subagents) {
        merged.subagents = { ...(found.subagents || {}), ...tplAgent.subagents };
        // allowAgents: union, not overwrite
        if (Array.isArray(found.subagents?.allowAgents) && Array.isArray(tplAgent.subagents.allowAgents)) {
          merged.subagents.allowAgents = Array.from(
            new Set([...found.subagents.allowAgents, ...tplAgent.subagents.allowAgents])
          );
        }
      }
      byId.set(tplAgent.id, merged);
      plan.push({ type: 'agent-merge', id: tplAgent.id, detail: 'merged subagents policy, preserved user fields' });
    }
  }
  return Array.from(byId.values());
}

/**
 * Merge model providers. User providers and API keys always win.
 * Template can only ADD providers the user does not already have.
 */
function mergeProviders(existingProviders, templateProviders, plan) {
  const out = { ...(existingProviders || {}) };
  for (const id of Object.keys(templateProviders || {})) {
    if (out[id]) {
      plan.push({ type: 'provider-keep', id, detail: 'preserved existing provider + API key' });
    } else {
      out[id] = templateProviders[id];
      plan.push({ type: 'provider-add', id, detail: 'added provider from template' });
    }
  }
  return out;
}

/**
 * Main merge entry. Returns { merged, plan, warnings }.
 *
 * templateConfig is the team's desired config (subagent policy, role agents,
 * optional provider defaults). existingConfig is the user's current config.
 */
function mergeOpenClawConfig(existingConfig, templateConfig) {
  const existing = isObject(existingConfig) ? existingConfig : {};
  const template = isObject(templateConfig) ? templateConfig : {};
  const plan = [];
  const warnings = [];

  const merged = JSON.parse(JSON.stringify(existing));

  // 1. Model providers: user wins, template only adds missing
  if (template.models?.providers) {
    merged.models = merged.models || {};
    if (!merged.models.mode && template.models.mode) merged.models.mode = template.models.mode;
    merged.models.providers = mergeProviders(merged.models?.providers, template.models.providers, plan);
  }

  // 2. agents.defaults: deep merge, but team-owned subagents policy fields win
  if (template.agents?.defaults) {
    merged.agents = merged.agents || {};
    merged.agents.defaults = deepMergePreferExisting(merged.agents.defaults, template.agents.defaults);
    // subagents policy is team-managed: template values win for these specific keys
    if (template.agents.defaults.subagents) {
      merged.agents.defaults.subagents = {
        ...(merged.agents.defaults.subagents || {}),
        ...template.agents.defaults.subagents
      };
      plan.push({ type: 'subagents-policy', detail: 'applied team subagent policy (maxSpawnDepth, etc.)' });
    }
  }

  // 3. agents.list: merge by id
  if (template.agents?.list) {
    merged.agents = merged.agents || {};
    merged.agents.list = mergeAgentList(merged.agents?.list, template.agents.list, plan);
  }

  // 4. tools.sessions.visibility: team needs 'all' for coordination, but warn if user had stricter
  if (template.tools?.sessions?.visibility) {
    merged.tools = merged.tools || {};
    merged.tools.sessions = merged.tools.sessions || {};
    const userVis = merged.tools.sessions.visibility;
    if (userVis && userVis !== template.tools.sessions.visibility) {
      warnings.push(`tools.sessions.visibility: user had "${userVis}", team needs "${template.tools.sessions.visibility}". Keeping team value; review if you intended stricter visibility.`);
    }
    merged.tools.sessions.visibility = template.tools.sessions.visibility;
    plan.push({ type: 'sessions-visibility', detail: `set to "${template.tools.sessions.visibility}"` });
  }

  // 5. Detect and warn about legacy A2A config that should be removed
  if (merged.tools?.agentToAgent) {
    warnings.push('Detected legacy tools.agentToAgent config. The new subagent architecture does not use it. Consider removing it manually after verifying nothing else depends on it.');
  }
  if (merged.session?.agentToAgent) {
    warnings.push('Detected legacy session.agentToAgent (ping-pong) config. The new subagent architecture does not use maxPingPongTurns. Consider removing it manually.');
  }

  return { merged, plan, warnings };
}

module.exports = {
  mergeOpenClawConfig,
  mergeAgentList,
  mergeProviders,
  deepMergePreferExisting
};

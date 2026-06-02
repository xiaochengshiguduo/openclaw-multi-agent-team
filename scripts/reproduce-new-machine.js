#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');
const { parseArgs, printHelp, isApply } = require('./lib/cli');
const { resolvePath } = require('./lib/paths');
const { ROLE_AGENTS, ROLES } = require('./lib/constants');
const { agentToAgentPatch } = require('./lib/openclaw-config');

const HELP = `
Usage: node scripts/reproduce-new-machine.js [--target ~/.openclaw] [--apply]
       [--config-path <path>]
       [--model <provider/model>] [--provider-id <id>] [--model-id <id>] [--base-url <url>]
       [--api <api>] [--alias <alias>] [--api-key-env <ENV>]
       [--api-key <key>]
       [--keep-config-backups <n>] [--no-prune-config-backups]
       [--no-reuse-config]
       [--yes] [--skip-config] [--skip-restart]

Interactive one-command reproduction for a new OpenClaw machine.

Default is preview/dry-run.

Config reuse (default ON):
- If an existing OpenClaw config is found at <target>/openclaw.json, the script reuses
  only the fields it needs (provider/model/baseUrl/api/apiKey/alias) as defaults.
- CLI flags always win.
- In --apply mode, the script only prompts for missing required values.

Non-interactive mode:
- If prompts are not possible (for example, when running with --yes), you must provide
  required values via CLI flags (or via config reuse); otherwise the script will exit.

With --apply, the script:
- overwrites repository-managed workspaces/templates
- registers role Agents via OpenClaw native command flow (no channel binding)
- overwrites project-managed OpenClaw config sections for model + A2A routing
- validates config
- restarts Gateway unless --skip-restart is used

- Use --api-key-env <ENV> for non-interactive secrets. --api-key <key> is accepted
  for compatibility, but environment variables or interactive hidden input are safer.
- In interactive mode, pasted API keys are not echoed.
- Do not commit generated OpenClaw config or backups.
- OpenClaw may create config backups during patch writes. By default this script
  keeps the newest 1 'openclaw.json.bak*' file after apply; use
  --keep-config-backups <n> or --no-prune-config-backups to change that.
`;

const DEFAULTS = {
  target: '~/.openclaw',
  providerId: 'custom-openai',
  modelId: 'gpt-5.5',
  baseUrl: 'https://api.openai.com/v1',
  api: 'openai-completions',
  alias: 'g'
};

const args = parseArgs(process.argv);
if (args.help) { printHelp(HELP); process.exit(0); }

function readJsonIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function extractReusableConfig(existing) {
  if (!existing || typeof existing !== 'object') return null;
  const primary = existing?.agents?.defaults?.model?.primary;
  const primaryParts = modelParts(primary);
  const alias = primary && existing?.agents?.defaults?.models?.[primary]?.alias;
  let providerId = primaryParts ? primaryParts.providerId : '';
  let modelId = primaryParts ? primaryParts.modelId : '';
  const provider = providerId ? existing?.models?.providers?.[providerId] : null;
  const baseUrl = provider?.baseUrl;
  const api = provider?.api;
  let apiKey = '';
  let apiKeyEnv = '';
  if (provider && typeof provider.apiKey === 'object' && provider.apiKey && provider.apiKey.source === 'env') {
    apiKeyEnv = provider.apiKey.id || '';
  } else if (provider && typeof provider.apiKey === 'string') {
    apiKey = provider.apiKey;
  }
  return {
    providerId,
    modelId,
    baseUrl,
    api,
    alias,
    apiKey,
    apiKeyEnv
  };
}

function run(cmd, argv, opts = {}) {
  const label = `${cmd} ${argv.map(a => String(a).includes(' ') ? JSON.stringify(a) : a).join(' ')}`;
  console.log(`\n$ ${label}`);
  const r = spawnSync(cmd, argv, { stdio: 'inherit', encoding: 'utf8', ...opts });
  if (r.status !== 0) process.exit(r.status || 1);
  return r;
}

function capture(cmd, argv, opts = {}) {
  return spawnSync(cmd, argv, { encoding: 'utf8', ...opts });
}

function shellQuote(s) {
  return `'${String(s).replace(/'/g, `'"'"'`)}'`;
}

function modelParts(model) {
  const value = String(model || '').trim();
  const slash = value.indexOf('/');
  if (slash <= 0 || slash === value.length - 1) return null;
  return { providerId: value.slice(0, slash), modelId: value.slice(slash + 1) };
}

function createRl() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function ask(rl, question, fallback) {
  return new Promise(resolve => {
    const suffix = fallback ? ` [${fallback}]` : '';
    rl.question(`${question}${suffix}: `, answer => resolve(answer.trim() || fallback || ''));
  });
}

function askSecret(question) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return Promise.resolve('');
  return new Promise(resolve => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    let value = '';
    stdout.write(`${question}: `);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    function onData(ch) {
      if (ch === '\u0003') {
        stdin.setRawMode(false);
        stdout.write('\n');
        process.exit(130);
      }
      if (ch === '\r' || ch === '\n') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        stdout.write('\n');
        resolve(value);
        return;
      }
      if (ch === '\u007f' || ch === '\b') {
        value = value.slice(0, -1);
        return;
      }
      value += ch;
    }
    stdin.on('data', onData);
  });
}

function confirm(rl, question, assumeYes) {
  if (assumeYes) return Promise.resolve(true);
  return new Promise(resolve => {
    rl.question(`${question} [y/N]: `, answer => resolve(/^y(es)?$/i.test(answer.trim())));
  });
}

function mergeMainSubagentAllowList(existing, routingPatch) {
  const mainPatch = routingPatch.agents.list.find((agent) => agent.id === 'main');
  if (!mainPatch) return [];
  const existingList = Array.isArray(existing?.agents?.list) ? existing.agents.list : [];
  const list = existingList.map((agent) => ({ ...agent }));
  const mainIndex = list.findIndex((agent) => agent && agent.id === 'main');
  if (mainIndex >= 0) {
    list[mainIndex] = {
      ...list[mainIndex],
      subagents: {
        ...(list[mainIndex].subagents || {}),
        ...(mainPatch.subagents || {})
      }
    };
    return list;
  }
  return [mainPatch, ...list];
}

function buildConfigPatch({ providerId, modelId, baseUrl, api, alias, apiKey, apiKeyEnv, existingConfig }) {
  const model = `${providerId}/${modelId}`;
  const provider = {
    baseUrl,
    api,
    models: [{
      id: modelId,
      name: `${modelId} (${providerId})`,
      reasoning: false,
      input: ['text', 'image'],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 128000,
      maxTokens: 4096,
      api
    }]
  };
  if (apiKeyEnv) provider.apiKey = { source: 'env', provider: 'default', id: apiKeyEnv };
  else if (apiKey) provider.apiKey = apiKey;

  const routingPatch = agentToAgentPatch(ROLES);
  return {
    models: { mode: 'merge', providers: { [providerId]: provider } },
    agents: {
      defaults: {
        model: { primary: model },
        models: { [model]: { alias } }
      },
      list: mergeMainSubagentAllowList(existingConfig, routingPatch)
    },
    tools: routingPatch.tools,
    session: routingPatch.session
  };
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function ensureConfigFileExists(configPath) {
  try {
    if (fs.existsSync(configPath)) return;
    ensureParentDir(configPath);
    fs.writeFileSync(configPath, JSON.stringify({}, null, 2) + '\n', { mode: 0o600 });
  } catch (_) {
    // best effort; openclaw will error with a clearer message if it cannot write
  }
}

function configBackupFiles(configPath) {
  const dir = path.dirname(configPath);
  const base = path.basename(configPath);
  let names = [];
  try {
    names = fs.readdirSync(dir);
  } catch (_) {
    return [];
  }
  return names
    .filter((name) => name === `${base}.bak` || new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.bak\\.\\d+$`).test(name))
    .map((name) => {
      const filePath = path.join(dir, name);
      let stat = null;
      try { stat = fs.statSync(filePath); } catch (_) { /* ignore unreadable entries */ }
      return stat && stat.isFile() ? { path: filePath, mtimeMs: stat.mtimeMs } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.mtimeMs - a.mtimeMs || b.path.localeCompare(a.path));
}

function pruneConfigBackups(configPath, keepCount) {
  if (!Number.isInteger(keepCount) || keepCount < 0) throw new Error('--keep-config-backups must be a non-negative integer');
  const backups = configBackupFiles(configPath);
  const remove = backups.slice(keepCount);
  for (const backup of remove) fs.rmSync(backup.path, { force: true });
  return { kept: Math.min(backups.length, keepCount), removed: remove.length };
}

function parseNonNegativeInt(value, flag) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    console.error(`${flag} must be a non-negative integer`);
    process.exit(2);
  }
  return parsed;
}

async function main() {
  const apply = isApply(args);
  const target = resolvePath(args.target || DEFAULTS.target);
  const configPath = resolvePath(args['config-path'] || path.join(target, 'openclaw.json'));
  const openclawEnv = { ...process.env, OPENCLAW_CONFIG_PATH: configPath };
  const reuseConfig = args['no-reuse-config'] !== true;
  const existingConfigPath = configPath;
  const existingConfig = reuseConfig ? readJsonIfExists(existingConfigPath) : null;
  const reused = reuseConfig ? extractReusableConfig(existingConfig) : null;

  let providerId = args['provider-id'] || (reused && reused.providerId) || DEFAULTS.providerId;
  let modelId = args['model-id'] || (reused && reused.modelId) || DEFAULTS.modelId;
  if (args.model) {
    const parsed = modelParts(args.model);
    if (!parsed) {
      console.error('--model must use provider/model format, for example custom-openai/gpt-5.5');
      process.exit(2);
    }
    providerId = parsed.providerId;
    modelId = parsed.modelId;
  }
  let baseUrl = args['base-url'] || (reused && reused.baseUrl) || DEFAULTS.baseUrl;
  let api = args.api || (reused && reused.api) || DEFAULTS.api;
  let alias = args.alias || (reused && reused.alias) || DEFAULTS.alias;
  let apiKey = args['api-key'] || (reused && reused.apiKey) || '';
  let apiKeyEnv = args['api-key-env'] || (reused && reused.apiKeyEnv) || '';
  const skipConfig = args['skip-config'] === true;
  const skipRestart = args['skip-restart'] === true;
  const pruneBackups = args['no-prune-config-backups'] !== true;
  const keepConfigBackups = args['keep-config-backups'] === undefined
    ? 1
    : parseNonNegativeInt(args['keep-config-backups'], '--keep-config-backups');
  const yes = args.yes === true;

  const interactive = process.stdin.isTTY && process.stdout.isTTY && !yes && apply && !skipConfig;

  if (interactive) {
    const rl = createRl();
    console.log('\n# Model/provider setup');
    if (reuseConfig) {
      if (existingConfig) console.log(`Reusing defaults from ${existingConfigPath} (use --no-reuse-config to disable)`);
      else console.log(`No existing config found at ${existingConfigPath}; using script defaults`);
    } else {
      console.log('Config reuse disabled (using --no-reuse-config); using script defaults');
    }
    providerId = await ask(rl, 'Provider id', providerId);
    modelId = await ask(rl, 'Model id', modelId);
    baseUrl = await ask(rl, 'Base URL', baseUrl);
    api = await ask(rl, 'API kind', api);
    alias = await ask(rl, 'Model alias', alias);

    // Prefer a pasteable API key in interactive mode when the reused env var is not set.
    if (apiKeyEnv && !process.env[apiKeyEnv] && !apiKey) {
      console.log(`Note: environment variable ${apiKeyEnv} is not set. You can paste an API key now instead.`);
      apiKeyEnv = '';
    }

    apiKeyEnv = await ask(rl, 'API key environment variable name (leave empty for hidden key input)', apiKeyEnv);
    rl.close();
    if (!apiKeyEnv && !apiKey) apiKey = await askSecret('API key (input hidden)');
  }

  // If config says apiKey comes from env, fail fast with a copy/paste fix when missing.
  // In interactive mode we prefer prompting for a pasteable key instead.
  if (apply && !skipConfig && !interactive && apiKeyEnv && !process.env[apiKeyEnv]) {
    console.error(`Missing required environment variable for model provider apiKey: ${apiKeyEnv}`);
    console.error('Fix (copy/paste):');
    console.error(`  export ${apiKeyEnv}='YOUR_API_KEY'`);
    console.error('Then re-run this command (or prefix the env var on the same line).');
    process.exit(2);
  }

  if (apply && !skipConfig && !apiKey && !apiKeyEnv) {
    console.error('Missing API key. Provide --api-key-env <ENV>, export the reused env var, or run interactively for hidden input.');
    process.exit(2);
  }

  const model = `${providerId}/${modelId}`;
  const patch = buildConfigPatch({ providerId, modelId, baseUrl, api, alias, apiKey, apiKeyEnv, existingConfig });
  const patchPath = path.join(os.tmpdir(), `openclaw-mat-reproduce-${process.pid}.patch.json`);
  fs.writeFileSync(patchPath, JSON.stringify(patch, null, 2) + '\n', { mode: 0o600 });
  process.on('exit', () => {
    try { fs.rmSync(patchPath, { force: true }); } catch (_) { /* best effort cleanup */ }
  });

  console.log('# New-machine reproduction plan');
  console.log(`target: ${target}`);
  console.log(`configPath: ${configPath}`);
  console.log(`model: ${model} (alias ${alias})`);
  if (!skipConfig) {
    if (reuseConfig) {
      console.log(`config reuse: ${existingConfig ? `from ${existingConfigPath}` : `none found at ${existingConfigPath}`}`);
      console.log('config reuse fields: agents.defaults.model.primary, agents.defaults.models[primary].alias, models.providers[provider].{baseUrl,api,apiKey}');
      console.log('config overwrite fields: agents.defaults.model.primary/models alias, A2A routing');
    } else {
      console.log('config reuse: disabled (--no-reuse-config)');
    }
  }
  console.log(`config: ${skipConfig ? 'skip' : 'overwrite project-managed model + A2A routing sections; register role agents via openclaw agents add'}`);
  console.log(`gateway restart: ${skipRestart ? 'skip' : 'run after config apply'}`);
  console.log(`mode: ${apply ? 'apply' : 'dry-run preview'}`);

  if (!skipConfig) {
    console.log(`openclaw config: using OPENCLAW_CONFIG_PATH=${configPath}`);
  }

  if (!apply) {
    console.log('\nDry-run only. Planned commands:');
    console.log(`node scripts/doctor-local.js`);
    console.log(`node scripts/healthcheck-local.js`);
    console.log(`node tests/smoke/run.js`);
    console.log(`node scripts/repro-check.js --target ${shellQuote(target)}`);
    console.log(`node scripts/generate-workspaces.js --target ${shellQuote(target)} --apply`);
    if (!skipConfig) {
      console.log(`openclaw config patch --file ${shellQuote(patchPath)} --dry-run`);
      console.log(`openclaw config patch --file ${shellQuote(patchPath)}`);
      if (pruneBackups) console.log(`prune OpenClaw config backups: keep newest ${keepConfigBackups} openclaw.json.bak* file(s)`);
      else console.log('prune OpenClaw config backups: skip');
    }
    console.log(`node scripts/register-agents.js --target ${shellQuote(target)} --model ${shellQuote(alias)} --apply`);
    if (!skipConfig) {
      console.log(`openclaw config validate`);
    }
    if (!skipRestart) console.log(`openclaw gateway restart`);
    console.log('\nRe-run with --apply to execute. Add --yes plus --api-key-env <ENV> for non-interactive use.');
    return;
  }

  const rl = process.stdin.isTTY && process.stdout.isTTY && !yes ? createRl() : null;
  if (rl) {
    const ok = await confirm(rl, 'This will overwrite generated workspaces and project-managed OpenClaw config sections. Continue?', false);
    rl.close();
    if (!ok) {
      console.log('Cancelled.');
      return;
    }
  }

  run(process.execPath, [path.join(__dirname, 'doctor-local.js')]);
  run(process.execPath, [path.join(__dirname, 'healthcheck-local.js')]);
  run(process.execPath, [path.join(__dirname, '..', 'tests', 'smoke', 'run.js')]);
  run(process.execPath, [path.join(__dirname, 'repro-check.js'), '--target', target]);
  run(process.execPath, [path.join(__dirname, 'generate-workspaces.js'), '--target', target, '--apply']);

  if (!skipConfig) {
    ensureConfigFileExists(configPath);
    run('openclaw', ['config', 'patch', '--file', patchPath, '--dry-run'], { env: openclawEnv });
    run('openclaw', ['config', 'patch', '--file', patchPath], { env: openclawEnv });
    if (pruneBackups) {
      const result = pruneConfigBackups(configPath, keepConfigBackups);
      console.log(`Pruned OpenClaw config backups: removed ${result.removed}, kept ${result.kept}`);
    }
  }

  run(process.execPath, [path.join(__dirname, 'register-agents.js'), '--target', target, '--model', alias, '--apply']);

  if (!skipConfig) {
    run('openclaw', ['config', 'validate'], { env: openclawEnv });
  }

  if (!skipRestart) {
    const status = capture('openclaw', ['gateway', 'status'], { env: openclawEnv });
    if (status.status !== 0) console.error('Warning: could not inspect Gateway status before restart; attempting restart anyway.');
    run('openclaw', ['gateway', 'restart'], { env: openclawEnv });
  }

  run(process.execPath, [path.join(__dirname, 'healthcheck-runtime.js'), '--target', target]);
  console.log('\n# Reproduction command completed');
  console.log('If runtime healthcheck still reports A2A disabled, wait a few seconds for Gateway restart and re-run:');
  console.log(`node scripts/healthcheck-runtime.js --target ${shellQuote(target)}`);
}

if (require.main === module) {
  main().catch(err => {
    console.error(err && err.stack ? err.stack : String(err));
    process.exit(1);
  });
}

module.exports = { buildConfigPatch, mergeMainSubagentAllowList, configBackupFiles, pruneConfigBackups };

# Development Guidelines

This document is the maintainer contract for `openclaw-multi-agent-team`.

The repository exists to reproduce a complete OpenClaw multi-agent software team on a new machine. The team mirrors a real software organization: `main` is the Telegram-facing supervisor and delivery owner; role agents such as PM, architect, backend, frontend, QA, reviewer, security, DevOps, docs, and research provide specialized work through `main`.

These rules keep the project reproducible, safe to publish, runtime-safe, bilingual, and hard to accidentally turn into a private `.openclaw` backup.

## 1. Product Boundary

This repository is a template and setup toolkit, not a live runtime.

It may contain:

- Generic role templates under `roles/`.
- Generic workspace templates under `workspace-template/`.
- Task archive templates under `task-templates/`.
- Preview-first setup, registration, routing, healthcheck, and reproduction scripts under `scripts/`.
- Sanitized examples under `examples/`.
- Bilingual documentation under `docs/` and root-level docs.
- Tests that verify clean-clone behavior and template integrity.

It must not contain:

- A real `.openclaw` runtime backup.
- Real `openclaw.json` files, auth profiles, memories, sessions, transcripts, task archives, Telegram chat IDs, private user messages, or contact data.
- Real API keys, provider tokens, Telegram bot tokens, Gateway tokens, private keys, or machine credentials.
- Hidden automation that silently mutates a real OpenClaw installation.

A future maintainer must be able to clone the repository, inspect it, run dry-runs, and understand the intended team without inheriting anyone's private environment.

## 2. Core Design Invariants

Preserve these invariants in every change:

- `main` is the only default user-facing agent and Telegram delivery owner.
- Role agents are internal specialists by default; they respond to `main`, not to the user or external channels.
- New-machine reproduction is the primary workflow; clean-clone behavior matters more than local convenience.
- Write-capable scripts are preview-first and require explicit `--apply`.
- Runtime changes are conservative, reviewable, and scoped to project-managed config.
- Examples and fixtures are fake, sanitized, and educational.
- English and Chinese docs are first-class and semantically aligned.
- Tests must not require private OpenClaw runtime state or credentials.

If a proposed change violates an invariant, stop and document the reason before proceeding.

## 3. Role Template Policy

Role prompts are product surface. Treat `roles/*/AGENTS.md` and `roles/*/SOUL.md` as executable team design, not casual documentation.

For every role:

- `SOUL.md` defines identity, temperament, responsibilities, and role boundaries.
- `AGENTS.md` defines operating rules, collaboration protocol, safety boundaries, and output format.
- The role must map to a real team function with clear ownership.
- Responsibilities should overlap only where real teams overlap, and the handoff rule must be explicit.
- A role must know what it can do directly, what it should report to `main`, and what requires another specialist.

Special rules:

- `main` must explicitly state that it faces the user, handles Telegram-friendly communication, dispatches specialists, integrates results, and asks the user before high-risk operations.
- Non-main roles must explicitly state that they do not directly face the user and do not bypass `main`.
- No role may receive external write capability by default.
- Reviewer, QA, security, and DevOps must remain distinct: review checks code quality, QA checks behavior, security checks risk, DevOps checks runtime and deployment.
- PM and architect must remain distinct: PM defines product scope and acceptance; architect defines technical shape and tradeoffs.

When changing roles, update relevant docs, examples, task templates, script constants, and smoke checks together.

## 4. Telegram and Channel Policy

The intended deployment primarily uses Telegram bots, but Telegram binding is not a default role capability.

Rules:

- `main` is the default Telegram-facing entrypoint.
- Role agents should not be bound to Telegram or other external channels unless an operator explicitly configures that outside the default template.
- Scripts and examples may describe Telegram setup with placeholders, but must not include real bot tokens, chat IDs, user IDs, or message history.
- Documentation should emphasize that user communication, confirmations, and final delivery flow through `main`.
- A role agent must not send external messages, emails, posts, or channel replies unless `main` and the user explicitly authorize that external action.

This keeps the generated team behaving like a coordinated team instead of many independent bots talking over each other.

## 5. Runtime Boundary and Config Policy

OpenClaw configuration is user-specific and safety-sensitive.

Default behavior:

- Do not modify real OpenClaw config.
- Do not restart Gateway.
- Do not bind channels.
- Do not overwrite workspaces.
- Do not copy runtime memories, sessions, transcripts, or private tasks.

Allowed exception:

- Dedicated reproduction scripts may apply validated project-managed configuration and restart Gateway only after clear preview output and explicit `--apply`.

Config operations must preserve unrelated user config by default. If a merge cannot be done safely, stop and ask for manual review. Role registration should use OpenClaw native commands where possible instead of hand-editing unknown config shapes.

## 6. Script Design Policy

Scripts are part of the product. Make them boring, inspectable, and safe.

Requirements:

- Default to dry-run or preview.
- Require `--apply` for writes, command execution, restarts, or config mutation.
- Print planned writes and commands before executing them.
- Use actionable error messages.
- Avoid destructive overwrite unless the operation is explicitly documented, previewed, and project-managed.
- Avoid shell tricks when Node.js standard library APIs are clearer.
- Keep dependencies minimal and avoid packages with hidden network calls, telemetry, or surprising postinstall behavior.
- JSON modes must output valid JSON without prose mixed in.
- Scripts must run from a clean clone without generated private state already present.

Executable shell blocks in documentation must be copy-paste runnable as written. Put placeholders, pseudo-commands, and directory sketches in `text` blocks, not executable `bash` blocks.

## 7. Reproduction Workflow Policy

New-machine reproduction is the main promise of this repository.

A reproduction-related change must consider:

- Clean clone setup.
- Workspace generation.
- Role prompt installation.
- Role agent registration.
- Model alias and provider placeholders.
- Agent-to-agent routing.
- Telegram binding through `main`.
- Healthchecks and troubleshooting.
- Rollback or manual review when config cannot be merged safely.

Do not optimize for a single maintainer's machine. If a workflow only works because local files, credentials, generated workspaces, or private config already exist, it is not a valid repository feature yet.

## 8. Task Archive Policy

`shared/tasks/` is the durable collaboration record for multi-agent work.

Default directory format:

```text
shared/tasks/TASK-YYYYMMDD-HHMM-slug/
```

Recommended files:

```text
metadata.md
status.md
brief.md
plan.md
pm.md
requirements-package.md
architecture.md
backend.md
frontend.md
qa.md
review.md
security.md
devops.md
docs.md
research.md
final.md
```

Rules:

- `main` owns task archive creation, routing, status, and final delivery by default.
- Role agents write only assigned files or return output to `main` unless explicitly authorized.
- `brief.md` defines scope for the current task.
- `final.md` is the user-facing delivery artifact.
- Slugs must be short, lowercase, non-sensitive, and readable in paths.
- Template changes must preserve old task archives as readable records.

## 9. Documentation Policy

Documentation is a product surface, not an afterthought.

Rules:

- Keep English and Chinese documents semantically aligned.
- Preserve the same commands, warnings, paths, safety boundaries, and examples across language pairs.
- Update both languages when changing headings, workflows, flags, examples, or links.
- Do not claim behavior that scripts or templates do not implement.
- Do not imply this repository installs OpenClaw or bypasses OpenClaw's official setup and security model.
- Mention dry-run and `--apply` behavior wherever a workflow can mutate files or config.
- Remove stale examples instead of leaving misleading instructions.

Documentation drift is a bug.

## 10. Security and Sanitization Policy

Never commit real secrets or private runtime data.

Forbidden content includes:

- API keys, provider tokens, Telegram bot tokens, Gateway tokens, private keys, auth files.
- Real `openclaw.json` files or backups.
- Real user memory, sessions, transcripts, private tasks, chat IDs, contact IDs, messages, or logs.
- Machine-specific credentials or sensitive infrastructure paths.

Allowed content includes:

- Placeholder values such as `YOUR_API_KEY`, `YOUR_TELEGRAM_BOT_TOKEN`, and `<MODEL_ALIAS>`.
- Fake IDs and fake users.
- Sanitized examples that clearly cannot be mistaken for live credentials.

If a real secret is committed, remove it and rotate it. A later git deletion is not enough.

## 11. Versioning and Compatibility

The repository version is declared in `package.json` and is separate from the installed OpenClaw version.

Do not install, upgrade, downgrade, or pin OpenClaw from this repository. Document known-good OpenClaw versions as compatibility references, not universal guarantees.

Treat these as compatibility-relevant changes:

- Role names or responsibilities.
- Workspace layout.
- Task archive schema.
- Script flags, defaults, and output formats.
- Config patch shape.
- Agent registration or routing behavior.

Add migration notes when existing generated workspaces or task archives may be affected.

## 12. Testing and Quality Gates

Run the smallest meaningful gate for the affected change.

Baseline checks:

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
node tests/smoke/run.js
```

Additional guidance:

- Role prompt changes should run role protocol smoke checks through `node tests/smoke/run.js`.
- Reproduction changes should run `node scripts/repro-check.js` and inspect dry-run output.
- Script changes should test `--help`, dry-run, and `--apply` in a fixture when possible.
- Documentation changes should run markdown link and language-pair checks.
- Config/routing changes should inspect generated patches or command previews.
- Security-sensitive changes should include a sanitization review.

Do not claim verification without naming the command, inspection, or blocker.

## 13. CI Policy

CI must stay safe, credential-free, and dry-run oriented.

CI should not:

- Require real OpenClaw credentials.
- Bind Telegram or any external channel.
- Restart a real Gateway.
- Mutate real OpenClaw config.
- Upload private runtime artifacts.
- Depend on maintainer-local workspaces.

CI may cover smoke tests, script dry-runs, markdown structure, bilingual pairs, role protocol checks, sensitive pattern scans, example sanitization, and clean-clone regressions.

## 14. Commit and Review Policy

Keep changes easy to review.

Rules:

- Prefer focused commits.
- Do not mix unrelated script, role, documentation, security, and example changes unless the change genuinely spans them.
- Check `git status` before committing.
- Do not commit generated private workspaces or runtime files.
- Mention user-visible behavior changes in commit messages or PR descriptions.
- Run the smallest meaningful quality gate before finalizing.

Before merging or shipping, ask:

- Does `main` remain the default user-facing supervisor?
- Do role agents still avoid direct external communication by default?
- Is dry-run still the default for write-capable workflows?
- Could this leak secrets, real IDs, memories, transcripts, private paths, or runtime config?
- Are docs and examples aligned with actual scripts and templates?
- Are English and Chinese docs aligned?
- Are smoke tests or targeted checks updated where needed?
- Is a migration note needed?

## 15. Maintainer Principles

Maintain the repository like infrastructure for future teams.

Prefer safety over convenience, reviewability over hidden automation, generic templates over private assumptions, clear role boundaries over clever prompts, and clean-clone reproducibility over local shortcuts.

The best change is one a future maintainer can audit, run, adapt, and roll back without needing your machine, your secrets, or your memory.

# Runtime Localization Design

This document defines the target design for runtime localization of the OpenClaw multi-agent team. It is a design contract only: Step 1 does not add translated runtime protocol files and does not change install or update behavior.

## Goals

Runtime localization lets a one-click install choose the language used by managed runtime files, and lets the runtime updater preserve that local language in later updates.

Supported runtime languages:

- `en` — English
- `zh-CN` — Simplified Chinese

The language choice affects managed runtime workspace content only. Repository documentation may continue to be bilingual through existing sibling Markdown files.

## Install default and interactivity policy

The install/reproduction path should use this policy once implemented:

1. Explicit language option wins. A future flag or environment value such as `--language en`, `--language zh-CN`, or an equivalent documented installer parameter selects the language without prompting.
2. Interactive apply runs may prompt when no explicit language is supplied. The prompt should offer `en` and `zh-CN`, show the default, and accept an empty answer as the default.
3. Non-interactive runs must not block waiting for input. If no explicit language is supplied, they use the default language.
4. The default language is `en` unless a future installer entrypoint explicitly documents a different user-facing default.
5. Invalid language values fail fast with a clear error before writing runtime files.

This preserves current behavior for unattended installs while adding an opt-in path for Chinese runtime content.

## Runtime source inventory

The durable Step 2 inventory is `scripts/lib/runtime-localization-inventory.json`. It lists the English runtime source files that must participate in localization, including role `AGENTS.md`/`SOUL.md`, workspace generation templates, task templates, and sources referenced by `updates/runtime/*.json`.

`tests/smoke/runtime-localization-inventory.test.js` keeps that inventory aligned with current role folders, task template constants, and runtime update manifests. The inventory intentionally records expected source paths only; it does not create Chinese mirrors and does not change install or update behavior.

## Target runtime behavior

When the selected language is `en`, all managed main/subagent runtime files and task templates installed into the OpenClaw runtime workspace must be English.

When the selected language is `zh-CN`, all managed main/subagent runtime files and task templates installed into the OpenClaw runtime workspace must be Simplified Chinese.

The runtime localization set includes, at minimum:

- main workspace instructions, for example `workspace/AGENTS.md` from `roles/main/AGENTS.md`;
- team/runtime operating instructions, for example `workspace/TEAM.md` from `workspace-template/TEAM.md`;
- task archive templates under `workspace/shared/tasks/_template/*.md`;
- role-agent instruction files that are copied or generated into runtime workspaces during reproduction;
- any future managed runtime prompt, checklist, or template file shipped by install/update manifests.

Language consistency is more important than partial coverage. An install or update that would mix English and Chinese runtime protocols for managed files should be rejected or treated as incomplete until all selected-language sources are available.

## File naming convention

Existing English files keep their current paths. Chinese mirrors use the `.zh-CN.md` suffix beside the English file.

Examples:

| English source | Chinese mirror |
|---|---|
| `roles/main/AGENTS.md` | `roles/main/AGENTS.zh-CN.md` |
| `workspace-template/TEAM.md` | `workspace-template/TEAM.zh-CN.md` |
| `task-templates/_template/status.md` | `task-templates/_template/status.zh-CN.md` |

This keeps backward compatibility for current manifests and scripts that refer to English source paths.

## Updater language state

The runtime updater should record the selected local runtime language in its state file:

```json
{
  "version": "1.2.0",
  "language": "zh-CN",
  "appliedAt": "2026-06-06T12:00:00.000Z",
  "sourceCommit": "...",
  "files": {}
}
```

The state file remains `state/openclaw-multi-agent-team/update-state.json`. The `language` field should be one of `en` or `zh-CN`.

File entries may continue to record source, version, and checksum metadata. When localized sources are used, the recorded `source` should be the actual selected source path so audits can explain exactly which language file was installed.

## Manifest schema direction

Future runtime update manifests should support a localized `sources` map while keeping backward compatibility with the existing single `source` field.

Current compatible shape:

```json
{
  "source": "workspace-template/TEAM.md",
  "target": "workspace/TEAM.md",
  "strategy": "managed-overwrite",
  "kind": "workspace"
}
```

Future localized shape:

```json
{
  "source": "workspace-template/TEAM.md",
  "sources": {
    "en": "workspace-template/TEAM.md",
    "zh-CN": "workspace-template/TEAM.zh-CN.md"
  },
  "target": "workspace/TEAM.md",
  "strategy": "managed-overwrite",
  "kind": "workspace"
}
```

Rules:

- `source` remains valid and means the English/default source.
- `sources.en` should normally match `source` when both are present.
- `sources.zh-CN` points to the Chinese mirror.
- Unknown language keys should be ignored or rejected consistently during manifest validation; implementation should document the chosen behavior.
- Missing selected-language sources should not silently install a different language unless the fallback policy below explicitly allows it.

## Update language detection and fallback order

When the update script runs, it should determine the runtime language in this order:

1. Explicit update option, for example `--language en` or `--language zh-CN`.
2. Existing updater state `state/openclaw-multi-agent-team/update-state.json` field `language`.
3. Existing managed runtime file metadata if a future managed header records language.
4. Installer/reproduction state if a future install state file records language.
5. Default language `en`.

After language detection, source selection should use this order for each manifest item:

1. `sources[language]` when present.
2. For `en` only, legacy `source` when `sources.en` is absent.
3. Fail with a clear missing-localized-source error for non-English selected languages.

The updater should preserve the detected language by writing it back to update state after successful apply. Dry-runs should include the detected language and selected source paths in the audit plan.

## Bilingual protocol consistency test strategy

Future implementation should add smoke tests that verify bilingual runtime protocol consistency without requiring semantic machine translation quality checks.

Recommended checks:

- Every localized runtime source listed in manifests has both an English file and a `.zh-CN.md` mirror.
- Each manifest item that installs managed runtime Markdown can resolve sources for both `en` and `zh-CN`.
- An `en` dry-run plan selects English paths only.
- A `zh-CN` dry-run plan selects `.zh-CN.md` paths only where localized runtime files are required.
- Missing selected-language source files fail validation instead of falling back to mixed runtime protocols.
- Updater state preserves `language` across dry-run/apply cycles and across versioned manifest overlays.
- Main instructions, subagent instructions, role checklist/protocol files, and task templates are covered by the same language selection rules.

These tests should complement existing Markdown language-pair tests. They should not attempt to judge translation quality automatically.

## Phased implementation plan

Step 2 and later should proceed in phases:

1. **Source inventory and schema tests** — list all managed runtime files, add manifest/source resolution tests, and define any helper functions without changing installed behavior.
2. **Chinese runtime mirrors** — add `.zh-CN.md` mirrors for runtime protocols and task templates, preserving protocol meaning and safety constraints.
3. **Manifest localization support** — add `sources` maps to runtime manifests while retaining `source` for compatibility.
4. **Install language selection** — add installer/reproduction language option, interactive prompt policy, validation, and language state recording.
5. **Updater preservation** — make `update-runtime-workspace.js` detect, preserve, and write language state; include selected source paths in plans and managed metadata as needed.
6. **End-to-end verification** — add install/update smoke tests for `en`, `zh-CN`, missing mirror failures, non-interactive defaults, and conflict handling.
7. **Documentation and release notes** — update script references, getting-started guides, compatibility notes, and changelog/release notes when behavior lands.

## Success criteria

The design is complete when future implementation can satisfy these criteria:

- one-click install can choose `en` or `zh-CN`;
- non-interactive install defaults to `en` without prompting;
- selected language is recorded in runtime updater state;
- updater preserves the local runtime language by default;
- English installs contain only English managed runtime files;
- Chinese installs contain only Chinese managed runtime files;
- manifests remain backward compatible with legacy `source` entries;
- tests detect missing localized runtime sources and mixed-language managed runtime output.

## Non-goals

Step 1 and the broader runtime localization design do not aim to:

- translate runtime protocol files during this step;
- change current install or update behavior during this step;
- localize OpenClaw core, Gateway, model/provider configuration, logs, transcripts, memories, or user-created task content;
- automatically translate user input or agent output;
- infer language from private user content;
- support languages beyond `en` and `zh-CN` before a future design update.

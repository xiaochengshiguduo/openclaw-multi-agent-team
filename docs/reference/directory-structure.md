# Directory Structure

```text
openclaw-multi-agent-team/
├── README.md
├── README.zh-CN.md
├── LICENSE
├── SECURITY.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── .gitignore
├── package.json
├── docs/
├── roles/
├── workspace-template/
├── task-templates/
├── scripts/
├── examples/
├── tests/
└── dist/
```

## `roles/`

Reusable role templates. Do not store real memory or private user data here.

## `workspace-template/`

Generic workspace placeholders used during generation.

## `task-templates/`

Templates copied into `shared/tasks/_template/`.

## `scripts/`

Preview-first setup, healthcheck, and helper scripts.

## `examples/`

Fake/sanitized teaching examples.

## `tests/`

Smoke tests and fixtures.

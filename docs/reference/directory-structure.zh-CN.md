[English](directory-structure.md) | 中文

# 目录结构

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

可复用的角色模板。不要在这里存放真实记忆或用户私有数据。

## `workspace-template/`

生成期间使用的通用工作区占位文件。

## `task-templates/`

会复制到 `shared/tasks/_template/` 的模板。

## `scripts/`

预览优先的设置、健康检查和辅助脚本。

## `examples/`

虚构 / 已脱敏的教学示例。

## `tests/`

冒烟测试和 fixtures。

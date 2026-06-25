# Runtime Localization 设计

本文定义 OpenClaw multi-agent team 的运行时本地化目标设计。本文件只是设计契约：第 1 步不会新增已翻译的运行时协议文件，也不会改变安装或更新行为。

## 目标

Runtime localization 允许一键安装时选择托管运行时文件使用的语言，并让运行时更新器在后续更新中保留本地选择的语言。

支持的运行时语言：

- `en` — English
- `zh-CN` — 简体中文

语言选择只影响托管的运行时 workspace 内容。仓库文档仍可继续通过现有的双语 Markdown 兄弟文件维护。

## 安装默认值和交互策略

实现后，安装/复现路径应采用以下策略：

1. 显式语言选项优先。未来的 `--language en`、`--language zh-CN` 或等价安装参数可以在不提示的情况下选择语言。
2. 交互式 apply 运行在没有显式语言时可以提示用户。提示应提供 `en` 和 `zh-CN`，显示默认值，并允许空输入表示使用默认值。
3. 非交互运行不得阻塞等待输入。如果没有显式语言，应使用默认语言。
4. 默认语言是 `en`，除非未来某个安装入口明确文档化了不同的用户可见默认值。
5. 非法语言值应在写入运行时文件前快速失败，并给出清晰错误。

这可以保持无人值守安装的当前行为，同时为中文运行时内容提供显式选择路径。

## 运行时源文件清单

持久化的 Step 2 清单是 `scripts/lib/runtime-localization-inventory.json`。它列出必须参与本地化的英文运行时源文件，包括角色 `AGENTS.md`/`SOUL.md`、工作区生成模板、任务模板，以及 `updates/runtime/*.json` 引用的源文件。

`tests/smoke/runtime-localization-inventory.test.js` 会让该清单与当前角色目录、任务模板常量和运行时更新清单保持一致。该清单只记录预期源路径；它不会创建中文镜像，也不会改变安装或更新行为。

## 目标运行时行为

当选择语言为 `en` 时，安装到 OpenClaw 运行时 workspace 的所有托管 main / 子 Agent 运行时文件和任务模板都必须是英文。

当选择语言为 `zh-CN` 时，安装到 OpenClaw 运行时 workspace 的所有托管 main / 子 Agent 运行时文件和任务模板都必须是简体中文。

运行时本地化集合至少包括：

- main workspace 指令，例如 `workspace/AGENTS.md` 来自 `roles/main/AGENTS.md`；
- team / runtime 运行指令，例如 `workspace/TEAM.md` 来自 `workspace-template/TEAM.md`；
- `workspace/shared/tasks/_template/*.md` 下的任务档案模板；
- 复现过程中复制或生成到运行时 workspace 的角色 Agent 指令文件；
- 未来由安装/更新 manifest 发布的任何托管运行时 prompt、检查清单或模板文件。

语言一致性比局部覆盖更重要。若一次安装或更新会让托管运行时协议混合中英文，应拒绝执行，或视为不完整，直到所选语言的所有源文件都可用。

## 文件命名约定

现有英文文件保持当前路径。中文镜像文件放在英文文件旁边，并使用 `.zh-CN.md` 后缀。

示例：

| 英文源文件 | 中文镜像 |
|---|---|
| `roles/main/AGENTS.md` | `roles/main/AGENTS.zh-CN.md` |
| `workspace-template/TEAM.md` | `workspace-template/TEAM.zh-CN.md` |
| `task-templates/_template/status.md` | `task-templates/_template/status.zh-CN.md` |

这可以保持当前引用英文源路径的 manifest 和脚本的向后兼容性。

## 更新器语言状态

运行时更新器应在状态文件中记录所选本地运行时语言：

```json
{
  "version": "1.2.0",
  "language": "zh-CN",
  "appliedAt": "2026-06-06T12:00:00.000Z",
  "sourceCommit": "...",
  "files": {}
}
```

状态文件仍然是 `state/openclaw-multi-agent-team/update-state.json`。`language` 字段应为 `en` 或 `zh-CN`。

文件条目可以继续记录 source、version 和 checksum 元数据。使用本地化源文件时，记录的 `source` 应是实际选中的源路径，这样审计时可以解释安装的是哪种语言文件。

## Manifest schema 方向

未来 runtime update manifest 应支持本地化 `sources` 映射，同时保持对现有单个 `source` 字段的向后兼容。

当前兼容形态：

```json
{
  "source": "workspace-template/TEAM.md",
  "target": "workspace/TEAM.md",
  "strategy": "managed-overwrite",
  "kind": "workspace"
}
```

未来本地化形态：

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

规则：

- `source` 继续有效，并表示英文/默认源文件。
- 同时存在 `source` 和 `sources.en` 时，`sources.en` 通常应与 `source` 一致。
- `sources.zh-CN` 指向中文镜像。
- 未知语言键应在 manifest 校验中被一致地忽略或拒绝；实现时应文档化所选行为。
- 缺少所选语言源文件时，不应静默安装另一种语言，除非下方 fallback 策略明确允许。

## 更新语言检测和 fallback 顺序

更新脚本运行时，应按以下顺序确定运行时语言：

1. 显式更新选项，例如 `--language en` 或 `--language zh-CN`。
2. 现有更新器状态文件 `state/openclaw-multi-agent-team/update-state.json` 中的 `language` 字段。
3. 现有托管运行时文件元数据，如果未来 managed header 记录了语言。
4. 安装/复现状态，如果未来安装状态文件记录了语言。
5. 默认语言 `en`。

确定语言后，每个 manifest 项应按以下顺序选择源文件：

1. 存在时使用 `sources[language]`。
2. 仅当语言为 `en` 且缺少 `sources.en` 时，使用旧版 `source`。
3. 对非英文所选语言，若缺少源文件，应以清晰的 missing-localized-source 错误失败。

更新器成功 apply 后应把检测到的语言写回 update state。Dry-run 计划应包含检测到的语言和选中的源路径，方便审计。

## 双语协议一致性测试策略

未来实现应新增 smoke tests，在不尝试自动判断翻译质量的前提下验证双语运行时协议一致性。

推荐检查：

- manifest 中列出的每个本地化运行时源文件都有英文文件和 `.zh-CN.md` 镜像。
- 每个安装托管运行时 Markdown 的 manifest 项都能解析 `en` 和 `zh-CN` 两种源。
- `en` dry-run plan 只选择英文路径。
- `zh-CN` dry-run plan 在需要本地化运行时文件时只选择 `.zh-CN.md` 路径。
- 缺少所选语言源文件时校验失败，而不是 fallback 成混合语言运行时协议。
- updater state 在 dry-run / apply 周期和版本化 manifest 叠加过程中保留 `language`。
- main 指令、子 Agent 指令、角色检查清单/协议文件、任务模板均受同一语言选择规则覆盖。

这些测试应补充现有 Markdown language-pair 测试。它们不应尝试自动判断翻译质量。

## 分阶段实现计划

第 2 步及之后建议分阶段推进：

1. **源文件盘点和 schema 测试** — 列出所有托管运行时文件，添加 manifest/source 解析测试，并定义必要 helper；不改变已安装行为。
2. **中文运行时镜像** — 为运行时协议和任务模板新增 `.zh-CN.md` 镜像，保持协议含义和安全约束等价。
3. **Manifest 本地化支持** — 向 runtime manifest 增加 `sources` 映射，同时保留 `source` 以兼容旧逻辑。
4. **安装语言选择** — 增加安装/复现语言选项、交互提示策略、校验和语言状态记录。
5. **更新器语言保留** — 让 `update-runtime-workspace.js` 检测、保留并写入语言状态；按需在计划和托管元数据中包含选中源路径。
6. **端到端验证** — 为 `en`、`zh-CN`、缺失镜像失败、非交互默认值和冲突处理添加安装/更新 smoke tests。
7. **文档和发布说明** — 行为落地时更新脚本参考、getting-started 指南、兼容性说明和 changelog / release notes。

## 成功标准

当未来实现满足以下条件时，本设计才算完整落地：

- 一键安装可以选择 `en` 或 `zh-CN`；
- 非交互安装默认使用 `en`，不会提示阻塞；
- 选中的语言记录在运行时 updater state 中；
- updater 默认保留本地运行时语言；
- 英文安装只包含英文托管运行时文件；
- 中文安装只包含中文托管运行时文件；
- manifest 对旧版 `source` 条目保持向后兼容；
- 测试能够发现缺失本地化运行时源文件和托管运行时输出混合语言的问题。

## 非目标

第 1 步和更广义的 runtime localization 设计不打算：

- 在本步骤翻译运行时协议文件；
- 在本步骤改变当前安装或更新行为；
- 本地化 OpenClaw core、Gateway、模型/供应商配置、日志、transcripts、memories 或用户创建的任务内容；
- 自动翻译用户输入或 Agent 输出；
- 从私有用户内容推断语言；
- 在未来设计更新前支持 `en` 和 `zh-CN` 之外的语言。

# 发布检查清单

创建 release tag、GitHub release 或修改仓库可见性前使用这个检查清单。

## 1. 范围确认

- [ ] 这是可复用模板/工具链，不是私有 workspace 备份。
- [ ] v1 仅支持 Linux。
- [ ] OpenClaw 安装/更新不在范围内。
- [ ] Config patching 保持 preview-first：一键复现必须显式 `--apply`；低层配置辅助脚本仍保持手动。
- [ ] Gateway 重启只能由专用复现/更新流程在显式 `--apply` 后执行；需要延后重启时，在支持的位置使用 `--no-restart`。低层辅助脚本不重启 Gateway。
- [ ] Telegram binding 默认只保留在 `main`。

## 2. 必需本地检查

```bash
node scripts/doctor-local.js
node scripts/healthcheck-local.js
node scripts/repro-check.js --target /tmp/oc-mat-release-repro
node scripts/repro-check.js --target /tmp/oc-mat-ci-repro --allow-missing-openclaw  # repository CI only
node scripts/preflight.js --target /tmp/oc-mat-preflight-repro
node tests/smoke/run.js
```

期望：

```text
# doctor-local: ok
# healthcheck-local: ok
# repro-check: ok or warning only
smoke tests passed
```

## 3. Secret/private-data 扫描

staging 前确认没有 private runtime state：

```bash
git status --short
git ls-files --others --exclude-standard
```

不能包含：

- `openclaw.json`
- `openclaw.json.*`
- auth profiles
- sessions/transcripts/logs
- `.env`
- private keys
- 真实 `MEMORY.md`
- 私有 `USER.md`
- 私有 `TOOLS.md`
- 真实任务档案

## 4. Git staging review

```bash
git add .
git status --short
git diff --cached --stat
git diff --cached --name-only
```

commit 前必须审查。

## 5. Release commit

只有在 maintainer 确认后执行：

```bash
git commit -m "Prepare vX.Y.Z release"
```

## 6. GitHub release readiness

创建 release tag 或修改仓库可见性前确认：

- [ ] repository name 正确
- [ ] README 渲染正常
- [ ] CI 通过
- [ ] SECURITY.md 存在
- [ ] LICENSE 存在
- [ ] issue/PR templates 存在
- [ ] docs/examples 中没有私有本地路径，除非是有意的通用 placeholder

## 7. Post-release sanity

创建 tag、GitHub release 或修改可见性后：

- [ ] clone 到干净临时目录
- [ ] 运行本地检查
- [ ] 运行 `repro-check.js`
- [ ] 验证 README quick start

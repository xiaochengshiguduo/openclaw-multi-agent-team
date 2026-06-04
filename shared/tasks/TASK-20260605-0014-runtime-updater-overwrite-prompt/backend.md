# Backend implementation notes

Changed files:
- `scripts/update-runtime-workspace.js`
  - Added `--overwrite-conflicts` explicit automation opt-in.
  - Modified managed-file conflicts remain safe by default: dry-run/non-interactive/empty/n exit conflict without overwrite.
  - Interactive TTY `--apply` runs now prompt for modified managed-file conflicts; `y`/`Y` authorizes overwriting only those listed managed conflict targets.
  - Rebuilds and re-audits the plan after authorization so backups, state, restart planning, and `last-plan.json` reflect the actual overwrite actions.
  - Keeps unmanaged conflicts, missing `managed-overwrite` conflicts, forbidden targets, and symlink safety unchanged.
- `tests/smoke/update-runtime-workspace.test.js`
  - Added isolated smoke coverage for empty/non-interactive no-overwrite behavior.
  - Added isolated smoke coverage for `--overwrite-conflicts`, including backup and state hash/version updates.

Validation run:
- `node tests/smoke/update-runtime-workspace.test.js` — passed.
- `npm test` — passed.
- Manual isolated pseudo-TTY check with `y` prompt response — passed earlier during implementation.

Notes:
- No real `~/.openclaw`, Gateway, external network, or push was used.
- Local commit should include only the updater, smoke test, and this task note.

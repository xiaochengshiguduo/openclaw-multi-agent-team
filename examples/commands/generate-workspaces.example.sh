#!/usr/bin/env bash
set -euo pipefail
node scripts/generate-workspaces.js --target "$HOME/.openclaw" --dry-run
echo "Review the dry-run output. Then run with --apply only when you are ready:"
echo 'node scripts/generate-workspaces.js --target "$HOME/.openclaw" --apply'

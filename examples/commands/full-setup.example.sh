#!/usr/bin/env bash
set -euo pipefail
node scripts/doctor-local.js
node scripts/generate-workspaces.js --target "$HOME/.openclaw" --dry-run
echo "Review dry-run output before running the same command with --apply."

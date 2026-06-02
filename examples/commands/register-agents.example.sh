#!/usr/bin/env bash
set -euo pipefail
node scripts/register-agents.js --target "$HOME/.openclaw" --model gpt/gpt-5.5
# Add --apply only after reviewing output.

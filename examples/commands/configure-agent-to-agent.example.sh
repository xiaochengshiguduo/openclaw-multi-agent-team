#!/usr/bin/env bash
set -euo pipefail
node scripts/configure-agent-routing.js > /tmp/openclaw-agent-routing.patch.json
cat /tmp/openclaw-agent-routing.patch.json

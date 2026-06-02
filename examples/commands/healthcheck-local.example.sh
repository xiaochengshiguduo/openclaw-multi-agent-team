#!/usr/bin/env bash
set -euo pipefail
node scripts/doctor-local.js
node scripts/healthcheck-local.js

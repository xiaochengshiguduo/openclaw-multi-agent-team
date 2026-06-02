#!/usr/bin/env bash
set -euo pipefail

# OpenClaw multi-agent team bootstrap (public repo only)
# - clones the repository if missing
# - runs automated reproduction (preview first unless --apply)

REPO_URL_DEFAULT="https://github.com/xiaochengshiguduo/openclaw-multi-agent-team.git"
TARGET_DEFAULT="$HOME/.openclaw"
DEST_DEFAULT="$HOME/openclaw-multi-agent-team"

usage() {
  cat <<'USAGE'
Usage:
  scripts/bootstrap-new-machine.sh [--dest <path>] [--target <path>] [--repo <url>] [--profile <name>] [--config-path <path>] [--apply] [--yes] [-- <extra reproduce args>]

Defaults:
  --repo   https://github.com/xiaochengshiguduo/openclaw-multi-agent-team.git
  --dest   ~/openclaw-multi-agent-team
  --target ~/.openclaw

Behavior:
  - Public git clone only (no gh auth).
  - Clones repo into --dest if it doesn't exist; otherwise reuses it.
  - Existing clean repos are fast-forwarded from their upstream when possible.
  - Existing repos with local changes are left untouched.
  - Runs: node scripts/reproduce-new-machine.js --target <target> [--apply] [--yes] plus any extra args after --

Examples:
  scripts/bootstrap-new-machine.sh
  scripts/bootstrap-new-machine.sh --apply
  scripts/bootstrap-new-machine.sh --apply --yes -- --api-key-env OPENCLAW_MODEL_API_KEY
USAGE
}

DEST="$DEST_DEFAULT"
TARGET="$TARGET_DEFAULT"
REPO_URL="$REPO_URL_DEFAULT"
PROFILE=""
APPLY=0
YES=0
CONFIG_PATH=""
EXTRA_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage; exit 0;;
    --dest)
      DEST="$2"; shift 2;;
    --target)
      TARGET="$2"; shift 2;;
    --repo)
      REPO_URL="$2"; shift 2;;
    --profile)
      PROFILE="$2"; shift 2;;
    --config-path)
      CONFIG_PATH="$2"; shift 2;;
    --apply)
      APPLY=1; shift;;
    --yes)
      YES=1; shift;;
    --)
      shift; EXTRA_ARGS+=("$@"); break;;
    *)
      echo "Unknown arg: $1" >&2
      usage; exit 2;;
  esac
done

if ! command -v git >/dev/null 2>&1; then
  echo "git not found in PATH" >&2
  exit 1
fi
if ! command -v node >/dev/null 2>&1; then
  echo "node not found in PATH" >&2
  exit 1
fi

mkdir -p "$(dirname "$DEST")"

if [[ -d "$DEST/.git" ]]; then
  echo "# Using existing repo: $DEST"
  if [[ -z "$(git -C "$DEST" status --porcelain)" ]]; then
    UPSTREAM="$(git -C "$DEST" rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)"
    if [[ -n "$UPSTREAM" ]]; then
      echo "# Updating existing repo from: $UPSTREAM"
      git -C "$DEST" fetch --prune
      git -C "$DEST" merge --ff-only "$UPSTREAM"
    else
      echo "# Existing repo has no upstream; skipping update"
    fi
  else
    echo "# Existing repo has local changes; skipping update"
  fi
else
  echo "# Cloning repo to: $DEST"
  git clone "$REPO_URL" "$DEST"
fi

cd "$DEST"

CMD=(node scripts/reproduce-new-machine.js --target "$TARGET")
if [[ -n "$CONFIG_PATH" ]]; then CMD+=(--config-path "$CONFIG_PATH"); fi
if [[ $APPLY -eq 1 ]]; then CMD+=(--apply); fi
if [[ $YES -eq 1 ]]; then CMD+=(--yes); fi
CMD+=("${EXTRA_ARGS[@]}")

if [[ -n "$PROFILE" ]]; then
  export OPENCLAW_PROFILE="$PROFILE"
fi

echo "# Running reproducer"
"${CMD[@]}"

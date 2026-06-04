#!/usr/bin/env bash
set -euo pipefail

# OpenClaw multi-agent team runtime workspace updater (public repo only)
# - clones/updates the repository if needed
# - runs the safe incremental runtime updater (dry-run first unless --apply)

REPO_URL_DEFAULT="https://github.com/xiaochengshiguduo/openclaw-multi-agent-team.git"
TARGET_DEFAULT="$HOME/.openclaw"
DEST_DEFAULT="$HOME/openclaw-multi-agent-team"

usage() {
  cat <<'USAGE'
Usage:
  scripts/update-runtime-workspace.sh [--dest <path>] [--target <path>] [--repo <url>] [--profile <name>] [--apply] [--no-restart] [--to <version>] [--only workspace|task-templates] [--json] [-- <extra updater args>]

Defaults:
  --repo   https://github.com/xiaochengshiguduo/openclaw-multi-agent-team.git
  --dest   ~/openclaw-multi-agent-team
  --target ~/.openclaw

Behavior:
  - Public git clone only (no gh auth).
  - Clones repo into --dest if it doesn't exist; otherwise reuses it.
  - Existing clean repos are fast-forwarded from their upstream when possible.
  - Existing repos with local changes are left untouched.
  - Runs: node scripts/update-runtime-workspace.js --target <target> plus forwarded args.
  - Default is dry-run. Runtime files are updated only with --apply.
  - With --apply, Gateway restarts after a safe no-conflict update unless --no-restart is used.

Remote examples:
  bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/update-runtime-workspace.sh)" --
  bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/update-runtime-workspace.sh)" -- --apply
  bash -c "$(curl -fsSL https://raw.githubusercontent.com/xiaochengshiguduo/openclaw-multi-agent-team/main/scripts/update-runtime-workspace.sh)" -- --apply --no-restart

Local examples:
  scripts/update-runtime-workspace.sh
  scripts/update-runtime-workspace.sh --apply
  scripts/update-runtime-workspace.sh --apply --no-restart
USAGE
}

DEST="$DEST_DEFAULT"
TARGET="$TARGET_DEFAULT"
REPO_URL="$REPO_URL_DEFAULT"
PROFILE=""
UPDATER_ARGS=()

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
    --apply|--no-restart|--json)
      UPDATER_ARGS+=("$1"); shift;;
    --to|--only|--restart-command)
      UPDATER_ARGS+=("$1" "$2"); shift 2;;
    --)
      shift; UPDATER_ARGS+=("$@"); break;;
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

if [[ -n "$PROFILE" ]]; then
  export OPENCLAW_PROFILE="$PROFILE"
fi

CMD=(node scripts/update-runtime-workspace.js --target "$TARGET")
CMD+=("${UPDATER_ARGS[@]}")

echo "# Running runtime workspace updater"
"${CMD[@]}"

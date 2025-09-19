#!/usr/bin/env bash
# Installs local git hooks from .githooks into .git/hooks
set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
HOOKS_DIR="$REPO_ROOT/.githooks"
GIT_HOOKS_DIR="$REPO_ROOT/.git/hooks"

if [[ ! -d "$HOOKS_DIR" ]]; then
  echo "No .githooks directory found."
  exit 1
fi

cp -v "$HOOKS_DIR/*" "$GIT_HOOKS_DIR/" || true
chmod +x "$GIT_HOOKS_DIR/pre-commit"

echo "Installed git hooks from $HOOKS_DIR to $GIT_HOOKS_DIR"

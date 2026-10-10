#!/bin/zsh
set -e
cd "$(dirname "$0")/.."
if command -v pnpm >/dev/null 2>&1; then
  pnpm dev
elif [ -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm" ]; then
  export PATH="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
  "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm" dev
else
  echo "Instalá Node.js 24 y pnpm, ejecutá pnpm install y volvé a abrir este archivo."
  read -r
fi

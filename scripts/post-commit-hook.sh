#!/usr/bin/env bash
# post-commit-hook.sh — Regenera portfolio-metrics.json cuando metrics.json cambia
# Instalado via install-hooks.sh en cada repo del workspace

BUILD="$HOME/projects/core/portfolio-metrics/build.mjs"

# Solo actuar si metrics.json estuvo en el último commit
if git diff-tree --no-commit-id -r --name-only HEAD | grep -q "^metrics\.json$"; then
  echo "[portfolio] metrics.json actualizado — regenerando portfolio-metrics.json..."
  if node "$BUILD" 2>&1; then
    echo "[portfolio] ✔ portfolio-metrics.json regenerado"
  else
    echo "[portfolio] ✘ Error al regenerar portfolio-metrics.json" >&2
  fi
fi

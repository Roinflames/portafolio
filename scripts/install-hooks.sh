#!/usr/bin/env bash
# install-hooks.sh — Instala post-commit-hook en todos los repos del workspace
# Uso: bash scripts/install-hooks.sh [--dry-run]

set -euo pipefail

WORKSPACE="$HOME/projects"
HOOK_SRC="$HOME/projects/core/portfolio-metrics/scripts/post-commit-hook.sh"
DRY_RUN=${1:-""}

installed=0; skipped=0; failed=0

install_hook() {
  local repo_path="$1"
  local repo_name
  repo_name=$(basename "$repo_path")

  # Excluir portfolio-metrics (evita loop infinito)
  [[ "$repo_name" == "portfolio-metrics" ]] && return

  if [[ ! -d "$repo_path/.git" ]]; then
    echo "  — $repo_name (sin .git, omitido)"
    ((skipped++)) || true
    return
  fi

  local hook_dest="$repo_path/.git/hooks/post-commit"

  if [[ "$DRY_RUN" == "--dry-run" ]]; then
    echo "  [dry-run] instalaría en $repo_name"
    return
  fi

  # Si ya existe un hook, encadenarlo en lugar de sobreescribir
  if [[ -f "$hook_dest" ]] && ! grep -q "post-commit-hook.sh" "$hook_dest"; then
    echo "  ⚠  $repo_name — hook existente, encadenando..."
    echo "" >> "$hook_dest"
    echo "# portfolio hook" >> "$hook_dest"
    echo "bash \"$HOOK_SRC\"" >> "$hook_dest"
  else
    cp "$HOOK_SRC" "$hook_dest"
    chmod +x "$hook_dest"
  fi

  echo "  ✔  $repo_name"
  ((installed++)) || true
}

echo ""
echo "Instalando post-commit hook en repos del workspace..."
echo ""

for group in clients core labs; do
  group_path="$WORKSPACE/$group"
  [[ ! -d "$group_path" ]] && continue

  for repo_path in "$group_path"/*/; do
    install_hook "$repo_path"
  done
done

echo ""
echo "Instalados: $installed  │  Omitidos: $skipped"
echo ""

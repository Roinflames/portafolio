#!/usr/bin/env bash
# ws-health.sh — Audita repos del workspace y reporta config faltante o stale
# Uso: ./scripts/ws-health.sh [--only-errors]

set -euo pipefail

WORKSPACE="/home/rreyes/projects"
ONLY_ERRORS=${1:-""}
TODAY=$(date +%s)
STALE_DAYS=30

# Colores
RED='\033[0;31m'
YEL='\033[0;33m'
GRN='\033[0;32m'
DIM='\033[2m'
NC='\033[0m'

ok()   { echo -e "  ${GRN}✔${NC}  $1"; }
warn() { echo -e "  ${YEL}⚠${NC}  $1"; }
fail() { echo -e "  ${RED}✘${NC}  $1"; }
dim()  { echo -e "  ${DIM}    $1${NC}"; }

total=0; errors=0; warnings=0

check_repo() {
  local repo_path="$1"
  local repo_name
  repo_name=$(basename "$repo_path")
  local has_error=false
  local output=""

  # Leer priority y progress_percent del metrics.json si existe
  local priority="" progress="" last_update="" p2p3=false
  if [[ -f "$repo_path/metrics.json" ]]; then
    priority=$(python3 -c "import json,sys; d=json.load(open('$repo_path/metrics.json')); print(d.get('priority',''))" 2>/dev/null || echo "")
    progress=$(python3 -c "import json,sys; d=json.load(open('$repo_path/metrics.json')); v=d.get('progress_percent'); print('' if v is None else v)" 2>/dev/null || echo "")
    last_update=$(python3 -c "import json,sys; d=json.load(open('$repo_path/metrics.json')); print(d.get('last_update',''))" 2>/dev/null || echo "")
  fi

  [[ "$priority" == "P2" || "$priority" == "P3" ]] && p2p3=true

  # --- Checks ---

  # metrics.json
  if [[ ! -f "$repo_path/metrics.json" ]]; then
    output+=$(fail "metrics.json ausente")$'\n'
    has_error=true; ((errors++)) || true
  else
    # progress_percent null (solo P1)
    if [[ "$p2p3" == false && -z "$progress" ]]; then
      output+=$(warn "progress_percent es null")$'\n'
      ((warnings++)) || true
    fi
    # last_update stale
    if [[ -n "$last_update" ]]; then
      update_ts=$(date -d "$last_update" +%s 2>/dev/null || echo "0")
      diff_days=$(( (TODAY - update_ts) / 86400 ))
      if [[ $diff_days -gt $STALE_DAYS ]]; then
        output+=$(warn "last_update hace ${diff_days}d (>${STALE_DAYS}d)")$'\n'
        ((warnings++)) || true
      fi
    fi
  fi

  # AGENTS.md o CLAUDE.md
  if [[ ! -f "$repo_path/AGENTS.md" && ! -f "$repo_path/CLAUDE.md" ]]; then
    output+=$(fail "sin AGENTS.md ni CLAUDE.md")$'\n'
    has_error=true; ((errors++)) || true
  fi

  # README.md
  if [[ ! -f "$repo_path/README.md" ]]; then
    output+=$(warn "README.md ausente")$'\n'
    ((warnings++)) || true
  fi

  # --- Imprimir resultado ---
  if [[ -n "$output" ]] || [[ "$ONLY_ERRORS" != "--only-errors" ]]; then
    local label="$repo_name"
    [[ "$p2p3" == true ]] && label="${label} ${DIM}(${priority})${NC}"
    if [[ "$has_error" == true ]]; then
      echo -e "${RED}▸${NC} $label"
    elif [[ -n "$output" ]]; then
      echo -e "${YEL}▸${NC} $label"
    else
      echo -e "${GRN}▸${NC} $label"
    fi
    echo -e "$output"
    [[ -z "$output" ]] && dim "OK"$'\n' || true
  fi

  ((total++)) || true
}

# --- Escanear subdirectorios ---
echo ""
echo "══════════════════════════════════════════"
echo "  Workspace Health — $(date '+%Y-%m-%d %H:%M')"
echo "══════════════════════════════════════════"

for group in clients core labs; do
  group_path="$WORKSPACE/$group"
  [[ ! -d "$group_path" ]] && continue

  echo ""
  echo -e "${DIM}── $group ──${NC}"
  echo ""

  for repo_path in "$group_path"/*/; do
    # Excluir portfolio-metrics (este mismo repo) y directorios de assets
    repo_name=$(basename "$repo_path")
    [[ "$repo_name" == "portfolio-metrics" ]] && continue
    [[ "$repo_name" == "COMUNIDAD VIRTUAL" ]] && continue
    [[ "$repo_name" == "cv-docs-productos-v0.1.0" ]] && continue
    [[ "$repo_name" == "infisical-local" ]] && continue

    check_repo "$repo_path"
  done
done

# --- Resumen ---
echo ""
echo "══════════════════════════════════════════"
echo -e "  Repos: ${total}  │  ${RED}Errores: ${errors}${NC}  │  ${YEL}Avisos: ${warnings}${NC}"
echo "══════════════════════════════════════════"
echo ""

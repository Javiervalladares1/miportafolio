#!/usr/bin/env bash
# Renderiza en lote. Uso:  bash scripts/renderizar.sh navidad-0      (todos los que empiezan así)
#                          bash scripts/renderizar.sh navidad-03-maquina-envuelve-todo
# Opcional: CHROME=/ruta/a/chrome bash scripts/renderizar.sh ...
set -euo pipefail
cd "$(dirname "$0")/.."
filtro="${1:-navidad-}"
extra=()
[[ -n "${CHROME:-}" ]] && extra+=(--browser-executable="$CHROME")
mkdir -p out
for f in videos/navidad/*.json videos/*.json; do
  id=$(basename "$f" .json)
  [[ "$id" == "$filtro"* ]] || continue
  echo "== $id"
  npx remotion render src/index.ts "$id" "out/$id.mp4" --crf=20 "${extra[@]}" 2>&1 | grep -E "^\+|Error" || true
done

#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

for dir in plugins/*/ bundles/*/; do
  [ -f "$dir/package.json" ] || continue
  echo "== publish $dir"
  (cd "$dir" && npm publish --access public)
done
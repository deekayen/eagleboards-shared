#!/bin/bash
# Measure how far the check-in pages have drifted between the three repos'
# local clones, in the format SPEC.md's "Shared files that have drifted"
# table uses (line counts matched against the existing table: `diff a b |
# grep -c '^[<>]'`). Run this before updating that table, and again after
# the pages move into this repo (issue: "Move check-in pages and
# rule/auto-select test cases into eagleboards-shared") to confirm the
# vendored copies haven't drifted from the canonical ones.
#
# Usage: scripts/check-drift.sh [checkout-root]
#   checkout-root defaults to this repo's parent directory, assuming sibling
#   checkouts named eagleboards-java, eagleboards-windows, eagleboards-macos
#   (true for ~/Sites on the owner's machine).

set -euo pipefail

ROOT="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
JAVA_DIR="$ROOT/eagleboards-java/src/main/resources/shkc/core/WEBROOT"
WIN_DIR="$ROOT/eagleboards-windows/src/EagleBoards.Web/wwwroot"
MAC_DIR="$ROOT/eagleboards-macos/Sources/CheckInServer/Resources/CheckIn"

FILES=(index.html youth_register.html adult_register.html)

compare() {
  local base="$1" other="$2" n
  if [ ! -f "$other" ]; then
    echo "missing ($other)"
    return
  fi
  if diff -q "$base" "$other" >/dev/null 2>&1; then
    echo "identical"
  else
    n=$(diff "$base" "$other" | grep -c '^[<>]')
    echo "differs, ${n} lines"
  fi
}

echo "Measured $(date +%Y-%m-%d) against the Java copies:"
echo
echo "| File | Windows | Mac |"
echo "|---|---|---|"
for f in "${FILES[@]}"; do
  base="$JAVA_DIR/$f"
  if [ ! -f "$base" ]; then
    echo "| \`$f\` | (java copy missing: $base) | |"
    continue
  fi
  w=$(compare "$base" "$WIN_DIR/$f")
  m=$(compare "$base" "$MAC_DIR/$f")
  echo "| \`$f\` | $w | $m |"
done

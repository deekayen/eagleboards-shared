#!/bin/bash
# Compare each version's copy of the check-in pages with checkin/ here
# (SPEC.md D-18): they must be byte-identical. Also says which commit of this
# repository each version's checkin-pages.lock pins, and checks that each
# version's status palette file (SPEC.md D-13) holds every color in the
# palette table, written as #rrggbb.
#
# Usage: scripts/check-drift.sh [checkout-root]
#   checkout-root defaults to this repo's parent directory, assuming sibling
#   checkouts named eagleboards-java, eagleboards-windows, eagleboards-macos
#   (true for ~/Sites on the owner's machine).
#
# Exit 1 if any copy differs or is missing.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT="${1:-$(cd "$HERE/.." && pwd)}"
FILES=(index.html youth_register.html adult_register.html checkin.css checkin.js)

VERSIONS=(
  "Java|$ROOT/eagleboards-java|src/main/resources/shkc/core/WEBROOT"
  "Windows|$ROOT/eagleboards-windows|src/EagleBoards.Web/wwwroot"
  "Mac|$ROOT/eagleboards-macos|Sources/CheckInServer/Resources/CheckIn"
)

status=0
for entry in "${VERSIONS[@]}"; do
  IFS='|' read -r name repo dir <<<"$entry"
  lock="$repo/checkin-pages.lock"
  pinned=$( [ -f "$lock" ] && tr -d '[:space:]' < "$lock" || echo "none" )
  echo "$name (checkin-pages.lock: $pinned)"
  for f in "${FILES[@]}"; do
    copy="$repo/$dir/$f"
    if [ ! -f "$copy" ]; then
      echo "  missing  $f"
      status=1
    elif cmp -s "$HERE/checkin/$f" "$copy"; then
      echo "  same     $f"
    else
      echo "  DIFFERS  $f ($(diff "$HERE/checkin/$f" "$copy" | grep -c '^[<>]') lines)"
      status=1
    fi
  done
done

# Each version's status palette file, and every light and dark value in the
# table under D-13 ("| `seated-bg` | ... | `#f3dfc4` | `#685b3e` |").
PALETTES=(
  "Java|$ROOT/eagleboards-java/src/main/resources/shkc/core/WEBROOT/eb-app.css"
  "Windows|$ROOT/eagleboards-windows/src/EagleBoards.App/StatusPalette.cs"
  "Mac|$ROOT/eagleboards-macos/Sources/EagleBoards/Support/StatusPalette.swift"
)
ROWS=$(grep -E '^\| `[a-z]+-(bg|fg)` \|' "$HERE/SPEC.md")
for entry in "${PALETTES[@]}"; do
  IFS='|' read -r name file <<<"$entry"
  echo "$name status palette ($(basename "$file"))"
  if [ ! -f "$file" ]; then
    echo "  missing  $file"
    status=1
    continue
  fi
  short=0
  while IFS= read -r row; do
    token=$(sed -E 's/^\| `([a-z]+-(bg|fg))`.*/\1/' <<<"$row")
    for hex in $(grep -oE '#[0-9a-f]{6}' <<<"$row"); do
      if ! grep -qi -- "$hex" "$file"; then
        echo "  MISSING  $token $hex"
        short=1
      fi
    done
  done <<<"$ROWS"
  if [ $short = 0 ]; then
    echo "  same     every value"
  else
    status=1
  fi
done
exit $status

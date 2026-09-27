#!/bin/bash
# Compare each version's copy of the check-in pages with checkin/ here
# (SPEC.md D-18): they must be byte-identical. Also says which commit of this
# repository each version's checkin-pages.lock pins.
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
exit $status

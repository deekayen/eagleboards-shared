#!/bin/bash
# Reusable helpers for the cross-version issue workflow in CLAUDE.md: one
# parent issue in eagleboards-shared, one sub-issue per platform repo that
# has work to do, all tracked on GitHub Project #4
# (https://github.com/users/deekayen/projects/4).
#
# Source this file, then call the functions — see the example at the bottom.
#
# Gotchas this works around:
# - `gh issue view --json id` returns the GraphQL node ID (a string like
#   "I_kwDO..."), but the REST `sub_issues` endpoint wants the issue's
#   numeric database ID instead. Fetch it with
#   `gh api repos/OWNER/REPO/issues/NUM -q .id`. gh_create_issue does this
#   for you.
# - `gh project item-add` / `item-edit` are GraphQL mutations and trip
#   GitHub's secondary rate limit under a rapid burst (more than roughly
#   15-20 in quick succession) even when `gh api rate_limit` shows plenty
#   of quota left. retry_gh backs off and retries on that specific error;
#   the sleeps in gh_add_to_project are deliberate, not padding — remove
#   them and the burst comes back.
#
# Project #4 fields, referenced by name so there are no field/option IDs to
# keep in sync:
#   Status:   Todo | In Progress | Done
#   Platform: Shared | Java | Windows | Mac
#   Kind:     Spec decision | Parity gap | Shared file | Bug

set -uo pipefail # not -e: callers loop over multiple issues and want to see each failure

GHC_SHARED="deekayen/eagleboards-shared"
GHC_JAVA="deekayen/eagleboards-java"
GHC_WINDOWS="deekayen/eagleboards-windows"
GHC_MACOS="deekayen/eagleboards-macos"
GHC_SITE="deekayen/eagleboards.page" # Project #4 has no Website platform; file site issues as Shared
GHC_PROJECT=4
GHC_PROJECT_OWNER=deekayen

# retry_gh CMD... — run a gh command, retrying with backoff if it fails with
# GitHub's secondary rate-limit error. Any other failure returns immediately.
retry_gh() {
  local attempt=1 max=6 delay=8 out
  while true; do
    if out=$("$@" 2>&1); then
      echo "$out"
      return 0
    fi
    if echo "$out" | grep -qi "rate limit"; then
      if [ "$attempt" -ge "$max" ]; then
        echo "$out" >&2
        return 1
      fi
      sleep "$delay"
      delay=$((delay * 2))
      attempt=$((attempt + 1))
      continue
    fi
    echo "$out" >&2
    return 1
  done
}

# gh_create_issue REPO TITLE BODY
# Prints "number|numeric_id|url" on success. Keep the numeric_id for
# gh_add_sub_issue — it is NOT what `gh issue view --json id` gives you.
gh_create_issue() {
  local repo="$1" title="$2" body="$3" url num nid
  url=$(retry_gh gh issue create --repo "$repo" --title "$title" --body "$body") || return 1
  num=$(basename "$url")
  sleep 2
  nid=$(retry_gh gh api "repos/${repo}/issues/${num}" -q .id) || return 1
  echo "${num}|${nid}|${url}"
}

# gh_add_sub_issue PARENT_REPO PARENT_NUM SUB_NUMERIC_ID
gh_add_sub_issue() {
  local parent_repo="$1" parent_num="$2" sub_nid="$3"
  retry_gh gh api "repos/${parent_repo}/issues/${parent_num}/sub_issues" -F sub_issue_id="$sub_nid" >/dev/null
  sleep 2
}

# gh_add_to_project URL PLATFORM KIND [STATUS]
gh_add_to_project() {
  local url="$1" plat="$2" kind="$3" item_status="${4:-Todo}"
  retry_gh gh project item-add "$GHC_PROJECT" --owner "$GHC_PROJECT_OWNER" --url "$url" >/dev/null
  sleep 3
  retry_gh gh project item-edit "$GHC_PROJECT" --owner "$GHC_PROJECT_OWNER" --url "$url" --field "Status" --value "$item_status" >/dev/null
  sleep 3
  retry_gh gh project item-edit "$GHC_PROJECT" --owner "$GHC_PROJECT_OWNER" --url "$url" --field "Platform" --value "$plat" >/dev/null
  sleep 3
  retry_gh gh project item-edit "$GHC_PROJECT" --owner "$GHC_PROJECT_OWNER" --url "$url" --field "Kind" --value "$kind" >/dev/null
  sleep 3
}

# --- Example: a new spec decision needing Java + Windows work ---------------
#
# source scripts/gh-coordination.sh
#
# r=$(gh_create_issue "$GHC_SHARED" "O-9 decided: ..." "Decided YYYY-MM-DD ...")
# IFS='|' read -r p_num p_nid p_url <<< "$r"
# gh_add_to_project "$p_url" Shared "Spec decision"
#
# r=$(gh_create_issue "$GHC_JAVA" "O-9: ..." "Parent: ${GHC_SHARED}#${p_num}. ...")
# IFS='|' read -r s_num s_nid s_url <<< "$r"
# gh_add_sub_issue "$GHC_SHARED" "$p_num" "$s_nid"
# gh_add_to_project "$s_url" Java "Spec decision"

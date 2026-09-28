#!/bin/bash
# Reusable helpers for the cross-version issue workflow in CLAUDE.md: one
# parent issue in eagleboards-shared, one sub-issue per platform repo that
# has work to do, all tracked on GitHub Project #4
# (https://github.com/users/deekayen/projects/4).
#
# Source this file, then call the functions — see the example at the bottom.
#
# The gh token needs the `project` scope for gh_add_to_project; without it
# the project calls fail. Add it with `gh auth refresh -s project` (check
# with `gh auth status`).
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
# - `gh project item-edit` takes no project number, --owner, --url, --field
#   or --value. It sets one field per call, and only by IDs: the item's
#   (from `gh project item-add ... --format json -q .id`), the project's
#   (`gh project view`), the field's and the option's (`gh project
#   field-list`). gh_add_to_project looks all of these up for you.
# - `gh project item-add` on an issue already on the project returns the
#   existing item, so re-running gh_add_to_project on it just re-sets its
#   fields.
#
# Project #4 fields, referenced by name so there are no field/option IDs to
# keep in sync: gh_add_to_project reads the IDs from `gh project field-list`
# on first use and keeps them for the rest of the shell. Re-source this file
# after renaming or adding an option.
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
GHC_PROJECT_ID=""      # filled by _ghc_load_project
GHC_PROJECT_OPTIONS="" # one line per option: field<TAB>option<TAB>field_id<TAB>option_id

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

# _ghc_load_project — look up the project's node ID and its single-select
# fields' and options' IDs, once per shell.
_ghc_load_project() {
  [ -n "$GHC_PROJECT_ID" ] && [ -n "$GHC_PROJECT_OPTIONS" ] && return 0
  GHC_PROJECT_ID=$(retry_gh gh project view "$GHC_PROJECT" --owner "$GHC_PROJECT_OWNER" --format json -q .id) || return 1
  GHC_PROJECT_OPTIONS=$(retry_gh gh project field-list "$GHC_PROJECT" --owner "$GHC_PROJECT_OWNER" -L 100 --format json \
    -q '.fields[] | select(.options) | .name as $f | .id as $fid | .options[] | [$f, .name, $fid, .id] | @tsv') || return 1
}

# _ghc_option_ids FIELD OPTION — print "FIELD_ID OPTION_ID" for an option
# named in the cache _ghc_load_project fills.
_ghc_option_ids() {
  local field="$1" option="$2" ids
  ids=$(printf '%s\n' "$GHC_PROJECT_OPTIONS" |
    awk -v f="$field" -v o="$option" 'BEGIN { FS = "\t" } $1 == f && $2 == o { print $3 " " $4; exit }')
  if [ -z "$ids" ]; then
    echo "Project #${GHC_PROJECT} has no ${field} option \"${option}\"" >&2
    return 1
  fi
  echo "$ids"
}

# _ghc_set_option ITEM_ID "FIELD_ID OPTION_ID"
_ghc_set_option() {
  local item_id="$1" ids="$2"
  retry_gh gh project item-edit --id "$item_id" --project-id "$GHC_PROJECT_ID" \
    --field-id "${ids%% *}" --single-select-option-id "${ids##* }" >/dev/null
}

# gh_add_to_project URL PLATFORM KIND [STATUS]
# Checks all three names before touching the project, so a typo adds nothing.
gh_add_to_project() {
  local url="$1" plat="$2" kind="$3" item_status="${4:-Todo}"
  local status_ids plat_ids kind_ids item_id rc=0
  _ghc_load_project || return 1
  status_ids=$(_ghc_option_ids Status "$item_status") || return 1
  plat_ids=$(_ghc_option_ids Platform "$plat") || return 1
  kind_ids=$(_ghc_option_ids Kind "$kind") || return 1
  item_id=$(retry_gh gh project item-add "$GHC_PROJECT" --owner "$GHC_PROJECT_OWNER" --url "$url" --format json -q .id) || return 1
  sleep 3
  _ghc_set_option "$item_id" "$status_ids" || rc=1
  sleep 3
  _ghc_set_option "$item_id" "$plat_ids" || rc=1
  sleep 3
  _ghc_set_option "$item_id" "$kind_ids" || rc=1
  sleep 3
  return "$rc"
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

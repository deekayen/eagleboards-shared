# CLAUDE.md: working notes for this repo

This is the coordination repository for the three versions of Eagle Boards
(`eagleboards-java`, `eagleboards-windows`, `eagleboards-macos`). It holds
no application code: the shared spec, shared artwork, the shared check-in
pages, and the shared test cases. It also tracks what the website,
`eagleboards.page`, shows of each version.

## What an agent needs to know

- **`SPEC.md` is the source of truth** for anything more than one version
  does: the data files, the endpoints, the board rules, auto-select, and the
  operator screen. Platform repos follow it; they do not decide shared
  behavior alone.
- **Change the spec before the code.** Open an issue here, settle it, update
  `SPEC.md` (and its parity table), then open one sub-issue per version that
  has work to do. Items are numbered (`D-`, `P-`, `O-`); cite them in issues
  and commits, and never renumber one.
- **Open questions (`O-`) are the owner's to decide.** Record the options and
  a recommendation; do not settle them by editing the spec.
- **Keep the parity table true.** When a version gains or loses a feature,
  update the row in the same change.
- **Keep `WEBSITE.md` true.** eagleboards.page walks through each version
  with screenshots. When a change alters what the operator or the tablet
  sees, add it to the Stale list in `WEBSITE.md` in the same change as the
  parity row. Re-shoot a version once its work has landed, not per commit.
- **Platform-specific (`P-`) items are deliberate.** Do not "fix" the Mac
  toward Windows or the reverse where the spec says they differ.

## Standing rules

- **No AI attribution** in commits, issues, PRs, or anywhere in history.
- **Push to `main`.** No pull requests (GitHub keeps `refs/pull/*` forever,
  beyond the reach of a history rewrite).
- **Never commit participant data or secrets.** Synthetic people only.
  Install the hook: `git config core.hooksPath scripts/hooks`.
- **District-neutral branding**, settled: never add a district or council name.

## Writing style

Docs, comments, commit messages, and release notes follow the owner's
technical writing rules. Not every workstation has the full guide or its
Vale linter, so the rules that matter most here are:

<!-- vale off -->
- No em dashes, and no `--` standing in for one. Use a comma, parentheses,
  a colon, or a new sentence.
- Oxford commas in every list of three or more.
- A colon introduces a list or an explanation, never a second independent
  clause. No sentence starts with "But."
- No sales or corporate words (robust, seamless, leverage, utilize,
  comprehensive, streamline) and no minimizers (simply, just, easily).
- No `-ing` tail that restates the sentence ("..., ensuring X"), no
  "serves as" or "acts as" for "is," and no "rather than" by reflex.
- US spelling. Name who acts. Vary sentence length and openings.
<!-- vale on -->

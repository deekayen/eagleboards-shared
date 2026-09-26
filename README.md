# Eagle Boards: shared

What the three versions of Eagle Boards, an Eagle Scout board of review
check-in and room scheduler, have in common:

- [Java](https://github.com/deekayen/eagleboards-java): runs anywhere with a JDK; the operator uses browser pages.
- [Windows](https://github.com/deekayen/eagleboards-windows): a native WPF app.
- [Mac](https://github.com/deekayen/eagleboards-macos): a native SwiftUI app.

This repository holds no application code. It holds:

| Path | What |
|---|---|
| [`SPEC.md`](SPEC.md) | What every version must agree on, what each does its own way, what is undecided, and where each version stands |
| [`artwork/`](artwork/) | The app icon, drawn once for all versions |

Still to come: the check-in pages the tablets load, and the board-rule and
auto-select test cases as data every version's tests read.

## Working across versions

Cross-version work is tracked on the **Eagle Boards** GitHub Project. A change
that more than one version needs starts as an issue here; each version that
has to do something gets a sub-issue in its own repository.

Each platform repository keeps its own copy of any shared file it builds
with, so its build needs nothing outside its own tree.

## Rules

- **No participant data.** Test cases here use synthetic people only.
  Install the guard hook once per clone: `git config core.hooksPath scripts/hooks`.
- **District-neutral.** No district or council name anywhere.

Licensed under the [Apache License 2.0](LICENSE).

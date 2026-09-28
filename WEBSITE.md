# Eagle Boards: the website

[eagleboards.page](https://eagleboards.page/)
([`deekayen/eagleboards.page`](https://github.com/deekayen/eagleboards.page))
is the public guide to running an Eagle board of review. Its Scheduler
section walks through each version with screenshots and GIFs. It is Hugo
with the Docsy theme, and Cloudflare publishes it on every push to `main`.

The site describes what the versions do; it never decides it. `SPEC.md`
leads, the apps follow, and the site catches up.

## Keeping it true

- **A change to what people see makes the site stale.** A new layout, a
  command renamed or moved, new wording, a new window, or a change to the
  check-in pages leaves that version's walkthrough and pictures out of date.
  Add a line under [Stale](#stale) in the same commit that updates the
  parity table in `SPEC.md`.
- **So does a change to what a version needs or how it installs.** Each
  version's page lists its system requirements and install steps, and the
  overview's feature list and version table sum them up. A new minimum OS,
  Java or .NET version, or processor; a release packaged, named or signed
  differently; or a feature every version gains, belongs under
  [Stale](#stale) too.
- **Re-shoot a version in one pass, after its work lands.** Not after every
  commit: wait until nothing that changes its screens is still in progress,
  then redo all of its images together so they agree with each other. Fix
  the page text and alt text in the same site commit.
- **Remove a Stale line** once the site commit that fixes it is pushed.

## Pages and images

Images are under `static/images/scheduler/` in the site repository. The alt
text on each one says exactly what it shows, so it changes with the image.

| Page | Version | Images | Taken |
|---|---|---|---|
| `content/docs/scheduler/java.md` | Java | `checkin.png`, `youth.png`, `adult.png` (the shared check-in pages), `java/evening.png`, `java/seat-board.gif`, `java/complete-board.gif`, `java/results.png`, `java/settings.png` | 2026-09-27 |
| `content/docs/scheduler/mac.md` | Mac | `mac/evening.png`, `mac/seat-board.gif`, `mac/complete-board.gif`, `mac/checkin.png` | 2026-09-27 |
| `content/docs/scheduler/windows.md` | Windows | `windows/evening.png`, `windows/seat-board.gif`, `windows/complete-board.gif`, `windows/checkin.png` | 2026-09-27 |
| `content/docs/scheduler/_index.md` | All | `java/evening.png`, with the same alt text as on `java.md`; the rest lists the features and compares the three versions | 2026-09-27 |

## Stale

What has changed since each version's pictures were taken.

### Java: O-3 amended, P-6, D-20 (cdf13f5)

- The top bar has one **Admin tables** link where Results and People were.
  `java/evening.png`, `java/seat-board.gif` and `java/complete-board.gif`
  show the old links. In `java.md`, the top-bar table and the "Results and
  settings" section name them, and `java/results.png`'s alt text calls the
  Boards tab "the Results page".
- The Youth list has no Show menu and always shows Finished. The same three
  pictures show the menu, and Finished missing; `java.md` says the list
  shows the Active youth and a menu switches it.
- Wood Badge adults have the pentagon after their name, and a same-unit
  adult a warning triangle, where the details pane said "Wood Badge" and
  "Same unit" in words. `java/seat-board.gif` (Guion Bluford and Steve
  Fossett) shows the words.
- The overview (`_index.md`) shows `java/evening.png` too, with the same
  alt text; it changes with `java.md`.
- eagleboards-java's README uses the same shots (`docs/images/`); refresh
  them together. Its text is already current.

### Mac: P-1 and P-6 amended, O-3 amended, D-17 (b99be53, ef4b34d)

- No sidebar: **View › Event**, **Results** and **People** (⌥⌘1 to ⌥⌘3)
  choose the page, and the Event page takes the whole width, every youth in
  one list stacked Waiting, On a Board, Finished, beside the room cards.
  `mac/evening.png` (which shows only the Scouts on boards),
  `mac/seat-board.gif` and `mac/complete-board.gif` show the old sidebar and
  one group at a time, and `evening.png`'s alt text ends "Add Room and Donate
  sit at the foot of the sidebar".
- `mac.md`: "**The sidebar** chooses who the list shows", with Add Room and
  Donate at its foot; View › Waiting to Adults (⌥⌘1 to ⌥⌘4, now Event,
  Results and People, ⌥⌘1 to ⌥⌘3); "select several adults in the Adults
  list" (now People); "Click **Add Room** at the bottom of the sidebar" (now
  **Room › Add Room…**, ⇧⌘N); and "**Donate**, at the foot of the sidebar"
  (now **Help › Donate…**, a window with the links and the Venmo QR code).
- The overview (`_index.md`) says "One *Donate* link sits at the edge of the
  window"; on Windows and the Mac it is in the Help menu now.

### Windows: P-1 and P-6 amended, O-3 amended, D-17, D-20 (f28f8b6)

- No sidebar: a menu bar (File, Edit, View, Help) across the top, and the
  Event page takes the whole width. `windows/evening.png`,
  `windows/seat-board.gif` and `windows/complete-board.gif` show the
  sidebar, and `evening.png`'s alt text ends "Donate, Help and Settings sit
  at the foot of the sidebar". In `windows.md`, "**Donate**, at the foot of
  the sidebar" is now **Help › Donate**, and **Help** in the app is **Help ›
  Eagle Boards help** (F1). Settings is **File › Settings**, a window of its
  own.
- The Youth list has no Show menu and always holds Waiting, On a board and
  Finished, and Find looks through all three. The same three pictures show
  the menu set to Active and Finished missing, and the alt text says the
  list "shows the active youth"; `windows.md` says the list shows the
  **Active** youth and the menu narrows it.
- Wood Badge adults have the pentagon after their name, and a same-unit
  adult a warning triangle: in the details pane, its Replace, Add member
  and Change chair choices, and People's Wood Badge column.
  `windows/seat-board.gif` (Guion Bluford and Steve Fossett) shows neither.
- The overview (`_index.md`, "Getting help") says Help is "at the foot of
  the sidebar on Windows"; it's **Help › Eagle Boards help** now.
- No Undo button in the bottom bar (7685c7b): **Edit › Undo** and Ctrl+Z
  undo. `windows.md` says "**Undo** (Ctrl+Z) at the bottom right", and the
  three pictures show the button.
- D-21 (87fba78): the Youth list has no Find a youth box, and **Find a
  person** under the Rooms heading narrows the rooms to someone's, youth or
  adult, or says where they are. The three pictures show Find a youth over
  the Youth list and nothing over the rooms; `windows.md` doesn't mention
  finding anyone, and "which room someone is in" is worth a sentence in
  section 2 or 3.
- The details pane's step buttons (Seat board, Start review, Complete,
  Reset) sit in a bar pinned to its foot, and in review Result and Notes
  come before the members (58f3170). `windows/complete-board.gif` shows the
  members above the result, and `windows/evening.png` Complete below them.
  Ctrl+Enter runs the step; section 3 of `windows.md` could say so.
- The Windows README's pictures (`docs/images/`) are already current.

## Re-shooting

- **Synthetic people only, in a scratch data folder.** Each platform
  repository's `CLAUDE.md` says how to keep its app away from real data
  (Mac: `EAGLEBOARDS_DATA_FOLDER` and a spare `EAGLEBOARDS_PORT`; Java: a
  scratch `-d` folder on a spare port; Windows: an explicit data folder).
  Never let a real `Master_AdultHistory.csv` or a SignUpGenius key near a
  screenshot run.
- **Keep the demo cast and scenes** so the three walkthroughs match. The cast
  is famous Eagle Scouts. Room 101: Arthur Eldred's final board, chaired by
  Neil Armstrong with Jim Lovell and Charles Duke, overdue at 49 minutes.
  Room 102: Gerald Ford chairing. Room 200A: a proposal review chaired by
  Steven Spielberg, running long at 28 minutes. Bill Amend, waiting 53 minutes,
  gets Guion Bluford as chair and Steve Fossett in 200B. `evening.png` and
  `seat-board.gif` are in dark mode and `complete-board.gif` in light.
- **The demo event lives in code on Windows.** `--site` in the Windows
  repository's snapshot tool builds it on a simulated clock, and
  `--site-event <dir>` writes it to a folder for another version to open,
  with its times moved so the scene's 20:00 is the current minute. The Java
  pictures are taken from it with [`scripts/shoot-java.mjs`](scripts/shoot-java.mjs),
  whose header gives every step; `--gif` in the same tool animates its frames.
  eagleboards-java's README uses the same shots (`docs/images/`), so refresh
  them together.
  The Mac app opens the same event through `java-scene.mjs --event`.
- **The Java pictures don't need Windows.**
  [`scripts/java-scene.mjs`](scripts/java-scene.mjs) builds the same event
  in the jar itself: it seeds the scene over HTTP into a scratch folder,
  moves the times so 20:00 is this minute, runs `shoot-java.mjs`, and
  animates the GIFs with ffmpeg:
  `node scripts/java-scene.mjs <eagleboards-java clone> <out-dir>`, after
  `./mvnw package` in the clone (`BROWSER=` to pick a Chromium browser, such
  as Brave). Its cast and times copy `Site.SeedEvening` in the Windows
  snapshot tool: change one, change the other.
- **The Mac pictures start from the same event.**
  `node scripts/java-scene.mjs <eagleboards-java clone> --event <dir>`
  builds it in the jar and writes it as a data folder instead of shooting
  it, with 20:00 at the minute it finishes. Within that minute, start the
  Mac app on it (`EAGLEBOARDS_DATA_FOLDER=<dir>`, a spare
  `EAGLEBOARDS_PORT`) so the timers read 49, 28, 24 and 12. Run it again
  before each picture: the Mac timers follow the real clock. The shots are
  by hand: a 1280x738 window (launch with
  `-"NSWindow Frame scheduler" "<x> <y> 1280 738 …"`), captured with
  `screencapture -o -l <window>` so a sheet comes with its window, scaled
  to 1600 wide for `evening.png` and 1100 for the GIFs. The app follows the
  system's appearance, not a launch argument.
- **Windows images need Windows.** On a Windows machine,
  `dotnet run --project tests/EagleBoards.UiSnapshots -c Release -- --site <dir>`
  in the Windows repository renders `evening.png`, `seat-board.gif` and
  `complete-board.gif` with this cast, and photographs the shared check-in
  pages (`checkin.png`, `youth.png`, `adult.png`) as a 1180x820 tablet shows
  them, through Edge headless. Those three serve every version's page.
- Push to the site's `main`; Cloudflare publishes it.

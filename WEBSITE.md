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
| `content/docs/scheduler/java.md` | Java | `checkin.png`, `youth.png`, `adult.png` (the shared check-in pages), `java/event.png`, `java/seat-board.gif`, `java/complete-board.gif`, `java/results.png`, `java/settings.png` | 2026-09-28 |
| `content/docs/scheduler/mac.md` | Mac | `mac/event.png`, `mac/seat-board.gif`, `mac/complete-board.gif`, `mac/checkin.png` | 2026-09-28 |
| `content/docs/scheduler/windows.md` | Windows | `windows/event.png`, `windows/seat-board.gif`, `windows/complete-board.gif`, `windows/checkin.png` | 2026-09-28 |
| `content/docs/scheduler/_index.md` | All | `java/event.png`, with the same alt text as on `java.md`; the rest lists the features and compares the three versions | 2026-09-28 |
| `README.md` in this repository | All | `java/event.png`, `mac/event.png` and `windows/event.png`, linked by their site URLs, so a re-shoot reaches it with the site. Its alt text names only the version, so it doesn't change with the image | follows the site |

## Stale

What has changed since each version's pictures were taken.

- All versions, `checkin.png`: the two sign-in tiles are drawn alike; *I am
  a youth* is no longer filled (#18, D-18). The page text should no longer
  mention a confirmation page after signing in, if it does.
- All versions, `adult.png`: the youth list is *Introducing a youth*, for the
  adult who will introduce one (#18, D-23).
- Windows `event.png`, `seat-board.gif`: the details pane's link reads
  *Introduces them* (#19, D-23); Start review on a board of review asks first
  (#19). Java and the Mac: wherever a shot shows a linked adult or the Start
  review confirmation, it reads *Introduces them* and names only whoever
  introduces the youth (#19). A proposed board now follows sign-ins (#20),
  which the demo event's shots don't show.

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
  gets Guion Bluford as chair and Steve Fossett in 200B. `event.png` and
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
  as Brave). Its cast and times copy `Site.SeedEvent` in the Windows
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
  to 1600 wide for `event.png` and 1100 for the GIFs. Add
  `-youthListWidth 320` for the list's default width, and
  `EAGLEBOARDS_APPEARANCE=dark` (or `light`) for the appearance, instead of
  changing the system's. eagleboards-macos's README uses the same shots
  (`docs/images/`, with `event-dark.png` beside a light `event.png`), so
  refresh them together.
- **Windows images need Windows.** On a Windows machine,
  `dotnet run --project tests/EagleBoards.UiSnapshots -c Release -- --site <dir>`
  in the Windows repository renders `event.png`, `seat-board.gif` and
  `complete-board.gif` with this cast, and photographs the shared check-in
  pages (`checkin.png`, `youth.png`, `adult.png`) as a 1180x820 tablet shows
  them, through Edge headless. Those three serve every version's page.
  It also renders `event-light.png`, the same window in light:
  eagleboards-windows's README uses the same shots (`docs/images/`, with
  `event-light.png` as its `event.png` and the site's `event.png` as
  `event-dark.png`), so refresh them together.
- Push to the site's `main`; Cloudflare publishes it.

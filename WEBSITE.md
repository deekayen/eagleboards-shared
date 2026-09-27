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
| `content/docs/scheduler/mac.md` | Mac | `mac/evening.png`, `mac/seat-board.gif`, `mac/complete-board.gif`, `mac/checkin.png` | `checkin.png` 2026-09-27; the rest 2026-09-25 |
| `content/docs/scheduler/windows.md` | Windows | `windows/evening.png`, `windows/seat-board.gif`, `windows/complete-board.gif`, `windows/checkin.png` | 2026-09-27 |
| `content/docs/scheduler/_index.md` | All | None; compares the three versions | |

## Stale

What has changed since each version's pictures were taken. As of
2026-09-27 the Windows and Java walkthroughs (re-shot for the status
palette), the overview's wording, and the check-in pictures on all three
pages are current; the Mac app pictures are stale.

### Mac: the status palette and the timer clocks

- D-13: status pills in the shared palette (Seated yellow, In review cyan,
  Completed purple), and room timers with a clock per state: ⏱ on time,
  ⏲ running long on an orange tint, ⏰ overdue on a solid pink-red fill.
  `evening.png` and both GIFs show the old colors and one warning icon for
  both late states. The D-13 work has landed, so re-shoot them.
- The page text says it too: `mac.md` (the alt text, "passes its red
  time", and the timers turning yellow and red). Running long and overdue,
  with their clocks, is the wording now.
- D-13: the pills say what the table under D-13 says (Mac 99afe14):
  *Waiting* and *In review*, not the stored Registered and In Progress.
  `evening.png`, `seat-board.gif` and `complete-board.gif` show the old
  words.

### Mac: the app pictures, and "The window"

- O-3: Waiting, On Boards and Finished are now filters in one live view,
  not sidebar destinations. `evening.png` and both GIFs show the old
  sidebar, and the page's "The window" section describes it.
- O-4: the generic Next Step label is gone.
- D-17: Donate button at the foot of the sidebar.
- Change members of a seated board.

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
  gets Guion Bluford as chair and Steve Fossett in 200B. `evening.png` is
  in dark mode and `complete-board.gif` in light.
- **The demo event lives in code on Windows.** `--site` in the Windows
  repository's snapshot tool builds it on a simulated clock, and
  `--site-event <dir>` writes it to a folder for another version to open,
  with its times moved so the scene's 20:00 is the current minute. The Java
  pictures are taken from it with [`scripts/shoot-java.mjs`](scripts/shoot-java.mjs),
  whose header gives every step; `--gif` in the same tool animates its frames.
  eagleboards-java's README uses the same shots (`docs/images/`), so refresh
  them together.
  The Mac app can open that folder too, but its re-shoot is still by hand.
- **The Java pictures don't need Windows.**
  [`scripts/java-scene.mjs`](scripts/java-scene.mjs) builds the same event
  in the jar itself: it seeds the scene over HTTP into a scratch folder,
  moves the times so 20:00 is this minute, runs `shoot-java.mjs`, and
  animates the GIFs with ffmpeg:
  `node scripts/java-scene.mjs <eagleboards-java clone> <out-dir>`, after
  `./mvnw package` in the clone (`BROWSER=` to pick a Chromium browser, such
  as Brave). Its cast and times copy `Site.SeedEvening` in the Windows
  snapshot tool: change one, change the other.
- **Windows images need Windows.** On a Windows machine,
  `dotnet run --project tests/EagleBoards.UiSnapshots -c Release -- --site <dir>`
  in the Windows repository renders `evening.png`, `seat-board.gif` and
  `complete-board.gif` with this cast, and photographs the shared check-in
  pages (`checkin.png`, `youth.png`, `adult.png`) as a 1180x820 tablet shows
  them, through Edge headless. Those three serve every version's page.
- Push to the site's `main`; Cloudflare publishes it.

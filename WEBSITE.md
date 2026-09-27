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
| `content/docs/scheduler/java.md` | Java | `checkin.png`, `youth.png`, `adult.png`, `scheduler.png`, `admin.png`, `configure.png` | The check-in pages 2026-09-27; the rest before 2026-09-19, carried over from the Jekyll site |
| `content/docs/scheduler/mac.md` | Mac | `mac/evening.png`, `mac/seat-board.gif`, `mac/complete-board.gif`, `mac/checkin.png` | `checkin.png` 2026-09-27; the rest 2026-09-25 |
| `content/docs/scheduler/windows.md` | Windows | `windows/evening.png`, `windows/seat-board.gif`, `windows/complete-board.gif`, `windows/checkin.png` | 2026-09-27 |
| `content/docs/scheduler/_index.md` | All | None; compares the three versions | |

## Stale

What has changed since each version's pictures were taken. As of
2026-09-27 the Windows walkthrough and the check-in pictures on all three
pages are current; the Java and Mac app pictures are stale.

### Java: the app pictures, and most of the page text

The page needs rewriting, not only new pictures.

- O-3, D-10: the Event page was rebuilt to the Windows layout.
  `scheduler.png` shows the old grid where adults are ticked, and the text
  says "The program ticks a chair".
- D-13: status is text plus an icon. The page's row-color table goes, and
  `configure.png` and its caption still show row colors as a setting.
- D-15: no Refresh button; a sign-in appears at once.
- D-16, D-17: follows dark mode; Donate link in the app bar.
- O-1, O-2: youth / event wording; Undo.
- Rename a room from its card, switch its type, sign-in QR code window,
  change members of a seated board.

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
  Neil Armstrong with Jim Lovell and Charles Duke, red at 49 minutes.
  Room 102: Gerald Ford chairing. Room 200A: a proposal review chaired by
  Steven Spielberg, yellow at 28 minutes. Bill Amend, waiting 53 minutes,
  gets Guion Bluford as chair and Steve Fossett in 200B. `evening.png` is
  in dark mode and `complete-board.gif` in light.
- **The demo event lives in code on Windows.** `--site` in the Windows
  repository's snapshot tool builds it on a simulated clock. The Mac and
  Java re-shoots still rebuild it by hand; saving it here as a synthetic
  event folder would make theirs repeatable too.
- **Windows images need Windows.** On a Windows machine,
  `dotnet run --project tests/EagleBoards.UiSnapshots -c Release -- --site <dir>`
  in the Windows repository renders `evening.png`, `seat-board.gif` and
  `complete-board.gif` with this cast, and photographs the shared check-in
  pages (`checkin.png`, `youth.png`, `adult.png`) as a 1180x820 tablet shows
  them, through Edge headless. Those three serve every version's page.
- Push to the site's `main`; Cloudflare publishes it.

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
| `content/docs/scheduler/java.md` | Java | `checkin.png`, `youth.png`, `adult.png`, `scheduler.png`, `admin.png`, `configure.png` | Before 2026-09-19, carried over from the Jekyll site |
| `content/docs/scheduler/mac.md` | Mac | `mac/evening.png`, `mac/seat-board.gif`, `mac/complete-board.gif`, `mac/checkin.png` | 2026-09-25 |
| `content/docs/scheduler/windows.md` | Windows | `windows/evening.png`, `windows/seat-board.gif`, `windows/complete-board.gif`, `windows/checkin.png` | 2026-09-25 |
| `content/docs/scheduler/_index.md` | All | None; compares the three versions | |

## Stale

What has changed since each version's pictures were taken. As of
2026-09-27, every image on the site is stale.

### Java: every image, and most of the page text

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
- D-7, D-18: `checkin.png`, `youth.png` and `adult.png` show the old
  Scouting-colored check-in pages, and `youth.png` the Birthdate field. The
  shared pages replace them.

### Mac: every image, and "The window"

- O-3: Waiting, On Boards and Finished are now filters in one live view,
  not sidebar destinations. `evening.png` and both GIFs show the old
  sidebar, and the page's "The window" section describes it.
- O-4: the generic Next Step label is gone.
- D-17: Donate button at the foot of the sidebar.
- Change members of a seated board.
- D-7, D-18: `checkin.png` shows the old check-in pages; the shared pages,
  without the Birthdate field, replace them.

### Windows: every image, and "1. People sign in"

- O-3: the Youth list's groups became a filter (Waiting, On boards,
  Finished, Active). The page still says finished youth appear "once
  **Show finished** is ticked".
- O-2: Undo everywhere.
- D-17: Donate link at the foot of the sidebar.
- Sign-in QR code window, rename a room, click to switch a room's type,
  change members of a seated board.

### All three

- D-18: the check-in pages are one shared design now (`checkin/`). Each
  version's `checkin.png` is stale until re-shot, and the three should show
  the same page. Shoot it on a tablet-sized window, in light.
- D-8: the youth sign-in form has no Phone field; Email sits alone on its
  row. Java's `youth.png` shows the old form, and any picture of the youth
  form or of a Records or admin table with youth in it should be taken
  after D-8 lands, so no Phone column shows.

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
- **The demo event is not saved anywhere yet.** Each re-shoot has rebuilt it
  by hand. Saving it here as a synthetic event folder would make the next
  one repeatable and the three versions' pictures identical.
- **Windows images need Windows.** `tests/EagleBoards.UiSnapshots` in the
  Windows repository renders every window off-screen, and CI uploads the
  results as the `ui-snapshots` artifact, but its `--demo` uses its own cast,
  not this one.
- Push to the site's `main`; Cloudflare publishes it.

# Eagle Boards: shared specification

What every version of Eagle Boards must agree on, what each may do its own
way, and what is still undecided. There are three versions:

| Version | Repository | Operator screen | Check-in server |
|---|---|---|---|
| Java | [`eagleboards-java`](https://github.com/deekayen/eagleboards-java) | Browser pages served by the jar | Jetty |
| Windows | [`eagleboards-windows`](https://github.com/deekayen/eagleboards-windows) | WPF app (Fluent) | Kestrel |
| Mac | [`eagleboards-macos`](https://github.com/deekayen/eagleboards-macos) | SwiftUI app | Hummingbird |

All three serve the same check-in website to the tablets at the door, and all
three read and write the same data files, so an event can move from one to
another mid-evening.

## How to change this

1. **Change this file first.** If a version needs to behave differently from
   what is written here, open an issue in this repository, settle it, and
   update the spec. Then implement it in each version.
2. **One parent issue here, one sub-issue per version** that has to do work.
   The parent closes when every sub-issue has.
3. **Platform repos do not decide shared behavior on their own.** An agent
   working in one version reads this file before changing the operator
   screen, the check-in pages, the board rules or the data files.

Numbered items (`D-`, `P-`, `O-`) are stable, so issues and commits can cite
them.

---

## Decided: every version does this

### Data and rules (the contract)

- **D-1 Data files.** The CSV and `config.properties` formats are the contract
  between versions: no quoting, `,` stored as `~` and a newline as `+` in
  values, `yyyy-MM-dd_HH:mm±hhmm` times, column orders as the Java records
  define them. Every version shows values unescaped (`~` back to `,`).
  A format change needs a parent issue here.
- **D-2 Endpoints.** The Java server's endpoints and wire formats are frozen;
  the check-in pages and `test-board-event.sh` depend on them. A new
  endpoint gets a case in the event test, and that case is copied into
  every version's test suite.
- **D-3 Board lifecycle.** Registered → Seated → InProgress → Completed, or
  Registered → Postponed. Seat convenes the board (the youth waits outside);
  Start Review brings the youth in; only then may it be completed. Results
  are Approved, Adjourned, NotApproved. Postponed is a status, never a result.
- **D-4 Composition.** Board of review 3–6 (4–6 confirms), project review
  2–6; the chair is qualified as Chair for that board type and sits on the
  board; no adult on two boards, gone home (`Room = N/A`), or Unavailable for
  that type; same-unit adults warn with an override down to the national
  floor of one member from outside the unit. Every absolute rule is refused
  by the server, not only by the screen.
- **D-5 Auto-select.** The proposed board weighs the whole waiting line, with
  the tie-breaks in the order the Java `proposeBoard` documents. Same
  algorithm, same test cases in all three: the cases for the D-4 rules,
  auto-select and fill the rest (D-12) are data in [`cases/`](cases/), and
  every version runs every one of them through its own code, from a copy
  pinned by `test-cases.lock` (see [`cases/README.md`](cases/README.md)). A
  case is added there, never only in one version.
- **D-6 Branding** is district-neutral. No district or council name anywhere.
- **D-7 No birthdate.** Nothing uses a youth's date of birth, so no version
  asks for it, stores it, shows it, pre-fills it or exports it. The `DOB`
  column stays in the youth CSV so files still move between versions and
  older builds (D-1), but it is written empty. `/register-youth` still
  accepts a `DOB` field from an older cached page and discards it (D-2).
- **D-8 No youth phone number.** Nothing uses a youth's phone number either:
  no rule, screen or step reads it; it is only asked for, imported from a
  pre-registration, pre-filled, shown and exported. So no version asks for
  it, imports it, pre-fills it, shows it or exports it. The `Phone` column
  stays in the youth CSV (D-1), written empty for a new youth.
  `/register-youth` still accepts a `Phone` field from an older cached page
  and discards it (D-2). A number already on file is left alone, as O-5 left
  birthdates: never blanked or purged, carried through a rewrite and a
  repeat sign-in unchanged, and never shown, pre-filled or exported. Adults'
  phone numbers are not affected.
- **D-9 A new install starts an empty adult history.** A new install has no
  `Master_AdultHistory.csv`, and no release ships one (it would hold
  participant data). When the adult history a version is told to use (its
  default, or the file named with `-a`) does not exist, the version creates
  it, holding only the header row, and says so, naming the full path, rather
  than refusing to start. Where the operator types or picks that path
  (Windows' startup window), the version may ask first, so a mistyped path is
  not taken for a new history. Tonight's files in the dated folder are
  created as before. A start from the command line that fails for any
  reason ends with a non-zero exit code, and leaves no window up that
  suggests the server is running.
- **D-19 No color settings.** The twelve status-color keys
  (`RegisteredColor` through `PostponedHiColor`) are retired from
  `config.properties`. No version lists them as columns, defaults them,
  writes them or offers them as a setting; the D-13 palette is the only
  status coloring. A file that still has them loads, because every version
  reads only the keys it knows, and the next save leaves them out. An older
  build that still colors rows by them draws those rows uncolored. The Java
  parity check still hands the original 2019 binary a config with the color
  columns, because that binary needs them.

### Operator screen

- **D-10 Layout.** The selected youth's board is built in a details pane
  (inspector) beside the queue: the room, the members with the chair marked,
  the rules checked as members are added, and the free adults to add from.
  The operator is never asked to tick adults in a separate grid.
- **D-11 One status-driven primary action.** The details pane's primary
  action follows the youth's status: Seat board, then Start review, then
  Complete. The label names the step; the keyboard shortcut is the same for
  all three steps (see P-3).
- **D-12 Pick by hand, or let the app fill in.** The operator can remove and
  add members freely, then have the app complete the board around the
  people they chose.
- **D-13 Status is text plus an icon, in one palette.** Every status pill and
  room timer shows a word or a number with an icon, so color is never the
  only cue, and all three versions color them alike, from the
  [status palette](#status-palette-d-13) below, in light and dark. The
  palette is measured by `scripts/check-palette.js`: every text pair meets
  WCAG 2.2 AA, and the pills and timers that sit side by side stay apart for
  red-green and blue-yellow color blindness. Platform status colors can't
  promise that: Windows' own caution and critical colors turn the same olive
  for deuteranopia, the most common kind. In a high-contrast mode (a Windows
  contrast theme, CSS `forced-colors`) the pills and timers take the system's
  colors with a border, and Overdue the system highlight; the Mac's Increase
  Contrast keeps the palette and adds the border. Nothing about status color
  is configurable (D-19).
- **D-14 No self-dismissing messages.** A problem stays on screen until it is
  fixed or dismissed, next to what it is about. Success needs no message when
  the screen already shows the result.
- **D-15 Nothing polls.** A change at the door appears at once; timers tick on
  the minute. Room timers run on minutes since the last status change, so the
  convening and the interview are timed separately.
- **D-16 Follows the system appearance**: light/dark, accent color, and the
  system font. Three things keep fixed colors instead of the accent: the
  check-in pages (D-18), the status palette (D-13) and the Wood Badge mark
  (D-20).
- **D-17 A Donate link in the main window.** One Donate link, with a heart,
  sits in the main window's frame, outside the working area: in the menu
  bar's Help menu on Windows and the Mac (Help › Donate…), and in the app bar
  of every Java operator page. It opens the list of ways to support the
  project (the links in `.github/FUNDING.yml`): the Support card in Settings
  on Windows and Java, a Donate window of its own on the Mac. It never goes
  on the check-in pages or inside the queue, the rooms or the details pane,
  and it never becomes a prompt, badge or reminder that interrupts the
  operator. The list shows a QR code for
  Venmo, so a phone can pay straight from the screen:
  `https://venmo.com/u/drdnorman?txn=pay&note=Eagle%20Boards` (Pay, with the
  note filled in), dark on white in both appearances.
- **D-20 Marks beside an adult's name.** Wherever the operator screen lists
  adults by name (the details pane's members and free adults, seating a
  board, changing a seated board's members, and the People page on Windows
  and the Mac), up to two marks follow the name. Each is an icon, with its
  meaning in a tooltip and said to a screen reader:
  - **Wood Badge**, for an adult counting today toward a Wood Badge ticket
    item (`WoodBadge` is `Y`): the pentagon in
    [`artwork/wood-badge.svg`](artwork/wood-badge.svg), the Mac's drawing,
    at text size and in its fixed colors in both appearances. Tooltip:
    *Counting today toward a Wood Badge ticket item*; a screen reader says
    *Wood Badge*. It replaces the words "Wood Badge" in Java's adult lines
    and the ✓ in Windows' Wood Badge column (the column stays, holding the
    mark, so People still sorts on it).
  - **Same unit**, for an adult in the selected youth's unit (the D-4
    warning): the platform's warning triangle in its caution color. Tooltip:
    *Same unit as* the youth's name; a screen reader says *Same unit*. A
    version that also says "same unit" in the adult's line may keep the
    words.

  Where Wood Badge is edited in a table (People on Windows and the Mac,
  Java's admin page), it is a Yes/No choice while the cell is being changed;
  a table the operator reads shows the mark.
- **D-21 Find a person's room.** Decided 2026-09-27 by the owner. The
  question the find answers is "which room is this person in?", for a youth
  or an adult alike, so it belongs to the rooms, not the youth list. Typing
  part of a name narrows the room cards to the rooms holding a match (the
  youth, or a member of the board), and to a room by that name. Anyone it
  matches who is in no room is said in words beside it: *is waiting*,
  *isn't on a board*, *has gone home*, *has finished*, *was postponed*; and
  if it matches no one, *No one by that name has signed in.* Clearing it
  shows every room again. The youth list has no find of its own (O-3): it is
  stacked by group and short enough to read.
  - Windows and Java: a *Find a person* box under the Rooms heading. Enter
    opens the first room found (or the youth found, if in no room); Esc
    clears; Ctrl+F goes to it.
  - Mac: the toolbar's search field, which already narrows the rooms by a
    youth's or a member's name, says where a match in no room is.
- **D-22 Approved proposals from earlier events.** Asked for by the owner
  2026-09-27. A youth sometimes comes to a board of review without the
  signed page of their project proposal, so the operator can look up whose
  proposal was approved in the year before this event, when, and by whom.
  - What it reads: the dated folders (`YYYY-MM-DD`) beside the event's own
    in the data folder, dated from one year before the event's date to the
    day before it. The event's date is its folder's name, or today if the
    folder isn't named by a date. From each, the `scouts.csv` rows whose
    `BoardType` is `Project` and `Result` is `Approved`. They are read each
    time the page is shown; nothing polls (D-15), since an earlier event
    doesn't change during this one. Nothing in an earlier folder is written.
  - What it shows: one row per approval, with the youth's name, their unit,
    the date of the event that approved it, the chair, the other members and
    the notes, sorted by last name, with Find over the name and unit.
    Nothing else from the row, so never a birthdate, phone number or email
    (D-7, D-8). A line above the list says how many earlier events were
    read, and from which date to which; with none, it says *No earlier
    events in the last year in this data folder.* A folder that can't be
    read is named there and stays (D-14), and the others are still listed.
  - Read only: no cell is edited, and there is no Export or Delete. A
    mistake is corrected in the earlier event itself.
  - Windows and the Mac: a page on the View menu, after Rooms: *Approved
    proposals* (the Mac's *Approved Proposals*, P-2), Ctrl+8 and ⌥⌘8 (P-6).
  - Java: an *Approved proposals* tab on the admin page, filled from a new
    endpoint, `/approved-proposals-cells`, which answers as `/youth-cells`
    does with only the columns above, the event's date as `Event`. A new
    section of the event test covers it, copied to Windows and mirrored in
    the Mac's `BoardEventTests` (D-2).

#### Status palette (D-13)

The hues are Monokai Pro's: its yellow, cyan, purple, orange and pink-red,
deepened for light mode until the text on each tint passes AA. Green is left
out on purpose. For red-green color blindness it is the color that yellow and
orange also become, so a green Completed pill looked like the yellow Seated
one. Completed is purple instead, the way GitHub marks merged work done, and
it keeps its check mark.

A status pill is its `-fg` color (the word and the icon) on its `-bg` tint.

| Status (stored) | Pill says | Colors |
|---|---|---|
| Registered, Verified | Waiting | `neutral` |
| Seated | Seated | `seated` |
| InProgress | In review | `review` |
| Completed | Completed | `completed` |
| Postponed | Postponed | `neutral` |

Each status keeps its own icon shape (the platform's own icon set, one
distinct shape per status); only the colors are shared.

A room timer is the minutes since the board's last step, with a clock that
changes with its state. The three clocks differ in outline, so the state
reads without color. The tooltip and the screen reader say *running long* or
*overdue* in words.

| Timer state | When | Clock | Colors |
|---|---|---|---|
| On time | Before the yellow time; convening, before `ConveneRedMins` | ⏱ stopwatch | The platform's secondary text, no fill |
| Running long | In review, past the yellow time | ⏲ timer clock | `long` tint |
| Overdue | Past the red time; convening, past `ConveneRedMins` | ⏰ alarm clock | `overdue`, a solid fill |

The clocks are each platform's own drawing of those three: SF Symbols
`stopwatch`, `timer` and `alarm` on the Mac; the monochrome Segoe UI Symbol
glyphs U+23F1, U+23F2 and U+23F0 on Windows (present on Windows 10 and 11;
Segoe Fluent Icons has no timer or alarm clock); matching inline SVGs in the
Java pages. Never the color emoji, which would ignore the palette.

`scripts/check-palette.js` reads this table; `scripts/check-drift.sh` checks
that each version's palette file still holds every value.

| Token | Used for | Light | Dark |
|---|---|---|---|
| `neutral-bg` | Waiting and Postponed pill | `#dddddd` | `#565457` |
| `neutral-fg` | Its word and icon | `#5b5a5b` | `#d4d3d3` |
| `seated-bg` | Seated pill (yellow) | `#f3dfc4` | `#685b3e` |
| `seated-fg` | Its word and icon | `#875107` | `#ffdd78` |
| `review-bg` | In review pill (cyan) | `#c9e3ea` | `#425c62` |
| `review-fg` | Its word and icon | `#146377` | `#9ae5ee` |
| `completed-bg` | Completed pill (purple) | `#ddd7ef` | `#504a65` |
| `completed-fg` | Its word and icon | `#5e4aa0` | `#cbc2f7` |
| `long-bg` | Running long timer (orange) | `#f8d9ce` | `#67493e` |
| `long-fg` | Its minutes and clock | `#994122` | `#fdbe9f` |
| `overdue-bg` | Overdue timer, a solid fill (pink-red) | `#c23d65` | `#ff6188` |
| `overdue-fg` | Its minutes and clock | `#ffffff` | `#221f22` |

### Check-in pages

- **D-18 One set of check-in pages.** The pages the tablets load (welcome,
  youth sign-in, adult sign-in, `checkin.css`, `checkin.js`) live in
  [`checkin/`](checkin/) here. Every version serves byte-identical copies,
  pinned by a `checkin-pages.lock` holding this repository's commit, and its
  CI fails if a copy differs. They speak one API, the Mac version's
  (`/api/checked-in`, `/api/scout-choices`, `/api/youth-lookup`,
  `/api/adult-lookup`, `/register-youth`, `/register-adult`; see
  [`checkin/README.md`](checkin/README.md)), which answers with only what each
  page shows. They meet **WCAG 2.2 AA**: fixed colors measured by
  `scripts/check-contrast.js` rather than the system accent (the one exception
  to D-16: a tablet's accent could be yellow on white), light or dark
  following the device, and an axe-core scan of every page, fresh and with
  errors, in both appearances before a change lands. Many people sign in on
  a shared laptop and can't scroll with a trackpad, so each form fits a
  laptop window without scrolling (columns on a wide screen) and Sign in is
  pinned to the bottom of the window.

### Resolved open questions

Decided 2026-09-26 by the owner; kept as `O-` so issues and commits can still
cite them.

- **O-1 Wording: youth / event.** All three say *youth* and *event*, on
  screen and in the check-in pages ("boards happen in the daytime too").
  Data files and code names do not change either way.
- **O-2 Undo everywhere.** Confirm only what Undo cannot take back (Reset,
  Postpone). Every board step, room change, Disable/Enable and Link/Unlink
  gets Undo. Java and Windows both answer `/restore-board` (event test
  section 20). Mac already had this.
- **O-3 One live-operations view.** Windows' Event page (queue, room cards
  and details pane always visible together) is the reference layout for all
  three, so a room's timer is never out of sight while working the queue.
  *Amended 2026-09-27:* the queue is one column holding every youth, in
  three stacked groups: Waiting (in sign-in order), On a board (by room) and
  Finished (the most recent first), each headed with its count. Nothing is
  picked to see a group: no Show menu, and no sidebar entry or tab per group.
  This replaces "Mac's Waiting / On Boards / Finished lists become filters
  within that one view", which let the Mac keep a sidebar list per group
  that had to be picked before a youth could be found, and let Java and
  Windows hide Finished behind a Show menu that Find could not see past.
  What sits beside the Event page is P-6. *Amended again the same day:* the
  list has no find of its own, where it said "Find searches every youth";
  D-21's find, over the rooms, finds anyone, youth or adult, and says which
  room they're in.
- **O-4 No "Next step" label.** The primary action always names the
  concrete step (Seat board, Start review, Complete), never a generic
  label. Confirms D-11; Mac's menu command drops "Next Step" as its wording.
- **O-5 Birthdates already on file are left alone.** D-7 stops new ones;
  no version blanks or purges the `DOB` values already in earlier events'
  folders or the returning-youth history, and a rewrite carries them through
  unchanged. They are still never shown, pre-filled or exported (D-7).

---

## Platform-specific by design

These differ on purpose. Each follows its platform's own guidelines, so
the same app feels native on each system rather than identical everywhere.

- **P-1 Where commands live.**
  - Mac: the menu bar (Board, Adult, Room menus), context menus, and the
    inspector. No sidebar. *Amended 2026-09-27 by the owner*, as on Windows:
    the View menu chooses the page (P-6), Room › Add Room… adds a room, and
    Help › Donate… is the Donate link (D-17).
  - Windows: a menu bar across the top of the main window (File, Edit, View,
    Help), command buttons in the page and details pane, and context menus.
    No sidebar. *Amended 2026-09-27 by the owner:* this replaces "No menu bar
    (Fluent guidance)" and the NavigationView sidebar that went with it;
    Settings, Help and the pages belong in a native menu bar, as on the Mac.
    File: Save report, the check-in QR code, Settings (a window of its
    own), Exit. Edit: Undo, naming the step. View: Event, Results, People,
    then Youth, Pre-registered, Adult history and Rooms, then Approved
    proposals (Ctrl+1 to 8; P-6, D-22). Help: Help (F1), Donate (D-17).
  - Java (browser): buttons in the page and details pane, and context menus
    built on the Popover API. No imitation of a menu bar.
- **P-2 Capitalization.** Mac: Title Case for buttons and menus (Apple HIG).
  Windows and Java: sentence case (Microsoft guidance).
- **P-3 Shortcuts.** Same keys, platform modifier: primary action is
  ⌘↩ on the Mac and Ctrl+Enter elsewhere; Undo is ⌘Z / Ctrl+Z.
- **P-4 Dialogs.** Mac sheets; Windows `ContentDialog`-style; Java native
  `<dialog>` with `showModal()`. Buttons are verbs that answer the title.
- **P-5 Background attention.** Mac: Dock badge and a notification when a
  room passes its red time. Windows: taskbar equivalents are allowed but not
  required. Java: none.
- **P-6 Pages beside the Event page.** Decided 2026-09-27.
  - Windows and Mac: an Event page, and a page for each table the event
    keeps: Results, People, Youth, Pre-registered, Adult history and Rooms.
    *Amended 2026-09-27 by the owner:* every table is corrected where it is
    shown, so there is no separate admin tables window (Windows' Admin
    tables, the Mac's Records). Results is the boards table: every board and
    its result, where a result or its notes is corrected, with Find, Save
    report and a way to open a board on the Event page. People is the adults
    table: roles, unit, contact and Wood Badge are changed there, beside Gone
    home and Back and the D-20 marks. The other pages have Find, Export and
    Delete (Rooms: Add and Remove room). A changed cell is saved as it is
    left (a choice as soon as it is picked; leaving the page saves a cell
    still open), and stays off the Undo stack. An adult's name, unit,
    contact and roles are one set of facts on People and Adult history, as a
    sign-in carries them between the two: a change on either page is made on
    both, so a chair promoted in the history is seated as a chair at this
    event. Wood Badge and whom they came to support belong to this event
    alone. Who sits on a board, and which room a youth or an adult is in,
    are never typed into a table: they change through the Event page's
    steps, under the D-4 rules. *Amended 2026-09-27 by the owner:* nor is a
    youth's status: Status is read-only in every table (Results, Youth). It
    changes only through the Event page's steps (Seat, Start review,
    Complete, Postpone, Reset, and Undo), which take and free a room and its
    members as they go; a status typed into a table left a finished youth
    holding their room. This replaces a Status cell that offered Waiting,
    Completed and Postponed. Neither version has
    a sidebar: both choose the page from the View menu (P-1), Ctrl+1 to 8 on
    Windows and ⌥⌘1 to 8 on the Mac, with a check on the page shown, so the
    Event page has the window's whole width. *Amended 2026-09-27 by the
    owner:* an eighth page, Approved proposals (D-22), follows Rooms. It
    reads earlier events, not a table this one keeps, and is read only.
  - Java: no Results or People page. The top bar has Event, Admin tables,
    Settings and Help; Admin tables is the admin page, whose Boards tab
    corrects a result, whose Adults tab changes roles, and whose Approved
    proposals tab lists D-22's approvals. Results are read
    from the Finished group, and an adult is marked gone home from the
    details pane's context menu. Two links to the one admin page (the old
    Results and People) do not come back.

---

## Open questions

Each gets a parent issue here. Until one is decided, versions keep what they
have and do not change it further.

None open right now. O-1 through O-5 were decided 2026-09-26; see "Resolved
open questions" under Decided, above.

---

## Parity

Where the versions stand. ✅ has it, ➖ does not, ◐ partly.

| Feature | Java | Windows | Mac | Notes |
|---|---|---|---|---|
| Details pane builds the board (D-10) | ✅ | ✅ | ✅ | |
| No self-dismissing messages (D-14) | ✅ | ✅ | ✅ | |
| Status as text plus icon (D-13) | ✅ | ✅ | ✅ | |
| Status palette, light and dark (D-13) | ✅ | ✅ | ✅ | Java 6c8ab6c, Windows 38c268e, Mac b45cedd. The table under D-13, measured by `check-palette.js`; `check-drift.sh` finds each version's copy the same |
| Timer clocks ⏱ ⏲ ⏰ (D-13) | ✅ | ✅ | ✅ | Running long and overdue used to share one warning icon in all three. Java: inline SVGs; Windows: Segoe UI Symbol glyphs; Mac: SF Symbols. The state is also said in words to a screen reader |
| No color keys in `config.properties` (D-19) | ✅ | ✅ | ✅ | An older file loads and the next save drops them; the Windows–Java hand-off test passes both ways |
| Follows system dark mode (D-16) | ✅ | ✅ | ✅ | Java: system accent where the browser exposes it (Safari, Firefox); Chrome falls back to blue |
| Fill the rest / Suggest a board (D-12) | ✅ | ✅ | ✅ | |
| No birthdate collected (D-7) | ✅ | ✅ | ✅ | Not asked, kept, pre-filled, shown or exported; one already on file is left alone (O-5) and blanked wherever it would be served |
| No youth phone number (D-8) | ✅ | ✅ | ✅ | Java d355a10, Windows f0e582a, Mac 55ba04b. Not asked, imported, pre-filled, shown or exported; a number on file is left alone and withheld wherever a youth table is served (`/youth-autofill` included) or saved (the Mac's Export List), and a `-cells` filter on it matches nothing (Java, Windows; the Mac has no such endpoint). The event test's section 24 covers it: Java's script, copied byte for byte to Windows, mirrored in Mac's `BoardEventTests` |
| New install: empty adult history (D-9) | ✅ | ✅ | ✅ | Java 1a35a9e, Windows fdfb449; the Mac already did. A missing history is started with its header row and its full path said (Java's console; Windows' log, or the console for `EagleBoards.Server`; Windows' startup window asks first). A failed command-line start exits 1, and Java's URL window goes with it. Java's `scripts/test-first-run.sh` covers it |
| Shared check-in pages (D-18) | ✅ | ✅ | ✅ | All three serve `checkin/` at f8200cb, checked in CI; all three serve the `/api/*` calls |
| Shared rule and auto-select cases (D-5) | ➖ | ➖ | ➖ | The format is set (`cases/README.md`); the cases are not written yet. Each version still runs its own hand-ported copy, and they have drifted: the Mac has no fill-the-rest (D-12) cases, and Windows' fill tests list roles in the opposite order to its auto-select tests |
| Wording: youth / event (O-1) | ✅ | ✅ | ✅ | |
| Undo (O-2) | ✅ | ✅ | ✅ | Java and Windows: `/restore-board` takes back the last action once, refused if anything changed it since; Windows and Mac keep a deeper stack in the app |
| Nothing polls (D-15) | ✅ | ✅ | ✅ | Java: `/events` stream. The check-in pages don't refresh on their own either: their lists load when the welcome page opens |
| Queue, rooms and details pane on one page (O-3) | ✅ | ✅ | ✅ | |
| One stacked youth column (O-3, amended) | ✅ | ✅ | ✅ | Java cdf13f5, Windows f28f8b6 (groups that stay, headed at a count of none; `SchedulerLogic.QueueSortKey` orders them, with a unit test), Mac b99be53 (a list with sections; its rows drag onto a room through the list's item provider) |
| Pages beside the Event page (P-6) | ✅ | ✅ | ✅ | Java cdf13f5: one Admin tables link in every page's top bar, where Results and People both opened the admin page. Windows f28f8b6, 7f20371: every table a page in the View menu (Ctrl+1 to 7), edited in place (`TablePage`); no sidebar and no Admin tables window. Mac ef4b34d, b7cb31b, 88e0894: every table a page in the View menu (⌥⌘1 to 7), edited in place (`EditableText`, `EditableChoice`), the inspector beside each; no sidebar and no Records window. Chair, members and rooms read-only; cells off the Undo stack; File › Export List. b396ad8: People and Adult history share an adult's facts (`EventNight.updateAdult`), and a cell still open saves when the page is left |
| A table never seats, starts or ends a board (P-6) | ➖ | ➖ | ✅ | Asked for by the owner 2026-09-27. Mac 2f17665: Status offers Waiting, Completed and Postponed (`BoardStatus.recordsChoices`), a sitting board's status is read-only, and `EventNight.updateYouth` refuses either change whoever makes it (`BoardEventTests.aTableCannotSeatStartOrEndABoard`). Java's admin page offers InProgress (`STATUSES` in `admin.html`); Windows' Status cell offers every status (`TableSpecs.StatusChoices`) |
| Sign an adult in by hand, filled in from the adult history | ➖ | ➖ | ✅ | Asked for by the owner 2026-09-27 for an adult who won't use the tablet. Mac b7cb31b, 88e0894: Adult › Add Adult…, Add Adult at the foot of People, or a double-click below its last row; a search of the adult history (`EventNight.historyMatches`) fills the form in and carries the record's ID, as the tablet's email lookup does; a role left at As Last Time keeps the history's. It goes through `registerAdult`, as the tablet's sign-in does. Adult History ticks those signed in today, and a double-click there signs someone in (`SignInTests`) |
| Marks beside an adult's name (D-20) | ✅ | ✅ | ✅ | Java cdf13f5: inline SVGs after the name, in place of the words. Windows f28f8b6: the pentagon as a `DrawingImage` and Segoe Fluent Icons' warning glyph (`AdultMarks`), in place of the words and People's ✓; Replace, Add member and Change chair show them in their choices too. The Mac draws the pentagon and a warning triangle (`AdultMarks`), which `artwork/wood-badge.svg` copies |
| Find a person's room (D-21) | ➖ | ✅ | ◐ | Windows 87fba78: *Find a person* under the Rooms heading, `SchedulerLogic.FindPeople` with a unit test. Java has *Find a youth* in the Youth list, which D-21 takes out. The Mac's toolbar search already narrows the rooms by a youth's or member's name (`Rooms.visibleRooms`), but doesn't say where a match in no room is |
| Approved proposals from earlier events (D-22) | ➖ | ➖ | ➖ | Asked for by the owner 2026-09-27, for a youth who comes without the signed proposal page. Read only. The Mac already lists the earlier events in its data folder (`DataFolder.nights()`); none of the three reads their youth yet |
| Change members of a seated board | ✅ | ✅ | ✅ | Java: `/change-board-members` (Windows serves it too); timer keeps running in all three |
| Rename room | ✅ | ✅ | ✅ | The board in it moves with it; N/A and commas refused in all three |
| Switch a room between final and project | ✅ | ✅ | ✅ | A board already in it is not disturbed |
| Move or swap a board between rooms | ✅ | ✅ | ✅ | |
| Sign-in QR code window | ✅ | ✅ | ✅ | |
| Drag a youth onto a room to seat | ➖ | ➖ | ✅ | Mac only is fine (pointer-heavy) |
| Link adult to youth after sign-in | ✅ | ✅ | ✅ | |
| Wood Badge and "No thanks" at sign-in | ✅ | ✅ | ✅ | |
| Ways to support the project (donate links) | ✅ | ✅ | ✅ | Same six links as `.github/FUNDING.yml`. Java: Settings and Help pages; Windows: Settings; Mac: Help › Donate… (a Donate window) and About. Never on the check-in pages |
| Donate link in the main window (D-17) | ✅ | ✅ | ✅ | Java: app bar, to Settings' Support section; Windows: Help › Donate in the menu bar (f28f8b6), to the Settings window's Support card; Mac: Help › Donate… in the menu bar (ef4b34d), a window with the links |
| Venmo QR code on the list (D-17) | ✅ | ✅ | ✅ | Java: a static `images/venmo-qr.svg` in Settings' Support section; Windows: drawn with QRCoder in Settings' Support card; Mac: drawn with Core Image in the Donate window |

### Shared files

The check-in pages are in [`checkin/`](checkin/) (D-18); each version pins
them with `checkin-pages.lock` and its CI compares its copies byte for byte.
`scripts/check-drift.sh` compares all three local clones against them, and
checks each version's copy of the status palette (D-13) against the table
here. The icon is in [`artwork/`](artwork/), with the Wood Badge mark
(D-20).

The rule and auto-select test cases are in [`cases/`](cases/) (D-5), one JSON
file per operation, being transcribed from Java's `test-seat-conflicts.js`
(#9). Each version will pin them with `test-cases.lock` and run them all;
until then each keeps its own hand-ported copy.

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
  algorithm, same test cases in all three.
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
  system font. Two things keep fixed colors instead of the accent: the
  check-in pages (D-18) and the status palette (D-13).
- **D-17 A Donate link in the main window.** One Donate link, with a heart,
  sits in the main window's frame, outside the working area: at the foot of
  the sidebar on Windows and Mac, and in the app bar of every Java operator
  page. It opens the list of ways to support the project (the links in
  `.github/FUNDING.yml`): the Support card in Settings on Windows and Java,
  a popover on the Mac. It never goes on the check-in pages or inside the
  queue, the rooms or the details pane, and it never becomes a prompt, badge
  or reminder that interrupts the operator. The list shows a QR code for
  Venmo, so a phone can pay straight from the screen:
  `https://venmo.com/u/drdnorman?txn=pay&note=Eagle%20Boards` (Pay, with the
  note filled in), dark on white in both appearances.

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
  Mac's Waiting / On Boards / Finished lists become filters within that one
  view, not separate destinations. Results, People and Settings stay
  separate pages in all three.
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
    inspector.
  - Windows: command buttons in the page and details pane, and context menus.
    No menu bar (Fluent guidance).
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
| No youth phone number (D-8) | ✅ | ✅ | ✅ | Java d355a10, Windows f0e582a, Mac 55ba04b. Not asked, imported, pre-filled, shown or exported; a number on file is left alone and withheld wherever a youth table is served (`/youth-autofill` included) or saved (Mac's Records export), and a `-cells` filter on it matches nothing (Java, Windows; the Mac has no such endpoint). The event test's section 24 covers it: Java's script, copied byte for byte to Windows, mirrored in Mac's `BoardEventTests` |
| New install: empty adult history (D-9) | ✅ | ✅ | ✅ | Java 1a35a9e, Windows fdfb449; the Mac already did. A missing history is started with its header row and its full path said (Java's console; Windows' log, or the console for `EagleBoards.Server`; Windows' startup window asks first). A failed command-line start exits 1, and Java's URL window goes with it. Java's `scripts/test-first-run.sh` covers it |
| Shared check-in pages (D-18) | ✅ | ✅ | ✅ | All three serve `checkin/` at f8200cb, checked in CI; all three serve the `/api/*` calls |
| Wording: youth / event (O-1) | ✅ | ✅ | ✅ | |
| Undo (O-2) | ✅ | ✅ | ✅ | Java and Windows: `/restore-board` takes back the last action once, refused if anything changed it since; Windows and Mac keep a deeper stack in the app |
| Nothing polls (D-15) | ✅ | ✅ | ✅ | Java: `/events` stream. The check-in pages don't refresh on their own either: their lists load when the welcome page opens |
| Single live-operations view (O-3) | ✅ | ✅ | ✅ | |
| Change members of a seated board | ✅ | ✅ | ✅ | Java: `/change-board-members` (Windows serves it too); timer keeps running in all three |
| Rename room | ✅ | ✅ | ✅ | The board in it moves with it; N/A and commas refused in all three |
| Switch a room between final and project | ✅ | ✅ | ✅ | A board already in it is not disturbed |
| Move or swap a board between rooms | ✅ | ✅ | ✅ | |
| Sign-in QR code window | ✅ | ✅ | ✅ | |
| Drag a youth onto a room to seat | ➖ | ➖ | ✅ | Mac only is fine (pointer-heavy) |
| Link adult to youth after sign-in | ✅ | ✅ | ✅ | |
| Wood Badge and "No thanks" at sign-in | ✅ | ✅ | ✅ | |
| Ways to support the project (donate links) | ✅ | ✅ | ✅ | Same six links as `.github/FUNDING.yml`. Java: Settings and Help pages; Windows: Settings; Mac: Help › Donate, About, and the sidebar's Donate popover. Never on the check-in pages |
| Donate link in the main window (D-17) | ✅ | ✅ | ✅ | Java: app bar, to Settings' Support section; Windows: sidebar foot, to Settings' Support card; Mac: sidebar foot, a popover with the links |
| Venmo QR code on the list (D-17) | ✅ | ✅ | ✅ | Java: a static `images/venmo-qr.svg` in Settings' Support section; Windows: drawn with QRCoder in Settings' Support card; Mac: drawn with Core Image in the Donate popover |

### Shared files

The check-in pages are in [`checkin/`](checkin/) (D-18); each version pins
them with `checkin-pages.lock` and its CI compares its copies byte for byte.
`scripts/check-drift.sh` compares all three local clones against them, and
checks each version's copy of the status palette (D-13) against the table
here. The icon is in [`artwork/`](artwork/). The rule and auto-select test
cases are to follow.

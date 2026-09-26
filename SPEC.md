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
  the check-in pages and `test-board-evening.sh` depend on them. A new
  endpoint gets a case in the evening test, and that case is copied into
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
- **D-13 Status is text plus an icon**, never color alone, and readable in
  light, dark and high-contrast modes. Colors come from the platform's theme.
  The status-color keys stay in `config.properties` for older Java builds;
  no version offers them as a setting.
- **D-14 No self-dismissing messages.** A problem stays on screen until it is
  fixed or dismissed, next to what it is about. Success needs no message when
  the screen already shows the result.
- **D-15 Nothing polls.** A change at the door appears at once; timers tick on
  the minute. Room timers run on minutes since the last status change, so the
  convening and the interview are timed separately.
- **D-16 Follows the system appearance**: light/dark, accent color, and the
  system font.

### Resolved open questions

Decided 2026-09-26 by the owner; kept as `O-` so issues and commits can still
cite them.

- **O-1 Wording: youth / event.** All three say *youth* and *event*, on
  screen and in the check-in pages ("boards happen in the daytime too").
  Data files and code names do not change either way.
- **O-2 Undo everywhere.** Confirm only what Undo cannot take back (Reset,
  Postpone). Every board step, room change, Disable/Enable and Link/Unlink
  gets Undo. Needs a server-side "restore board" op in Java and Windows;
  Mac already has this.
- **O-3 One live-operations view.** Windows' Event page (queue, room cards
  and details pane always visible together) is the reference layout for all
  three, so a room's timer is never out of sight while working the queue.
  Mac's Waiting / On Boards / Finished lists become filters within that one
  view, not separate destinations. Results, People and Settings stay
  separate pages in all three.
- **O-4 No "Next step" label.** The primary action always names the
  concrete step (Seat board, Start review, Complete), never a generic
  label. Confirms D-11; Mac's menu command drops "Next Step" as its wording.

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

None open right now. O-1 through O-4 were decided 2026-09-26; see "Resolved
open questions" under Decided, above.

---

## Parity

Where the versions stand. ✅ has it, ➖ does not, ◐ partly.

| Feature | Java | Windows | Mac | Notes |
|---|---|---|---|---|
| Details pane builds the board (D-10) | ➖ | ✅ | ✅ | Java still ticks adults in a grid |
| No self-dismissing messages (D-14) | ➖ | ✅ | ✅ | Java uses toasts |
| Status as text plus icon (D-13) | ➖ | ✅ | ✅ | |
| Follows system dark mode (D-16) | ➖ | ✅ | ✅ | |
| Fill the rest / Suggest a board (D-12) | ◐ | ✅ | ✅ | Java auto-selects only |
| Wording: youth / event (O-1) | ➖ | ✅ | ✅ | Java still says scout / night |
| Undo (O-2) | ➖ | ➖ | ✅ | Decided: everywhere; needs a restore-board op in Java and Windows |
| Single live-operations view (O-3) | ◐ | ✅ | ➖ | Java: scheduler.html to rebuild to this layout; Mac: lists are separate destinations today |
| Change members of a seated board | ➖ | ✅ | ➖ | Windows: `ChangeBoardMembers`, timer keeps running |
| Rename room | ◐ | ➖ | ✅ | Java: admin tables only |
| Move or swap a board between rooms | ✅ | ✅ | ✅ | |
| Sign-in QR code window | ➖ | ➖ | ✅ | |
| Drag a youth onto a room to seat | ➖ | ➖ | ✅ | Mac only is fine (pointer-heavy) |
| Link adult to youth after sign-in | ✅ | ✅ | ✅ | |
| Wood Badge and "No thanks" at sign-in | ✅ | ✅ | ✅ | |

### Shared files that have drifted

These exist in more than one repository and should live here once. Measured
2026-09-26 against the Java copies:

| File | Windows | Mac |
|---|---|---|
| `index.html` (check-in) | identical | differs, 114 lines |
| `youth_register.html` | identical | differs, 147 lines |
| `adult_register.html` | differs, 30 lines | differs, 210 lines |
| App icon SVG | identical to Mac | identical to Windows |

The icon is now in [`artwork/`](artwork/). The check-in pages and the rule
and auto-select test cases are to follow.

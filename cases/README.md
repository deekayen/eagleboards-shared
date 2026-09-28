# Shared test cases

The board rules and auto-select, written down once as data. Every version
runs every case here through its own code (SPEC.md D-5), so the three cannot
drift apart without a test failing. Until now each version kept a hand-ported
copy of the same cases (Java's `scripts/test-seat-conflicts.js`, Windows'
`BoardRulesTests` and `SchedulerLogicTests`, the Mac's `BoardRulesTests`),
with a comment asking the others to keep in step and nothing to check that
they did.

The cases began as a transcription of Java's `test-seat-conflicts.js`, which
the other two were ported from, names unchanged. Where Java checked one call
more than once, the case joins those checks' names. Two names Java used for
both kinds of board say which kind (`board-size`), and Java's two checks
that set a board of three and two beside a project review of three and two
are left out, since the four cases they restate are here. Five cases came
from Windows' and the Mac's own tests, where Java had none like them: a
project review of two, a spare chair filling a member's seat, a chair short
with members short, and only chairs free (`suggest`), and nobody free to add
(`fill`). A case is added here, never only in one version.

## Files

One file per operation. Each is JSON, which every version reads with its
standard library.

| File | Operation | Checks |
|---|---|---|
| `unit-conflicts.json` | `unit-conflicts` | Which members share the youth's unit (D-4), all of them, in order |
| `outside-member.json` | `outside-member` | Whether at least one member is from outside the unit (the national floor, D-4) |
| `board-size.json` | `board-size` | A member count's verdict for each kind of board (D-4) |
| `suggest.json` | `suggest` | The board auto-select proposes, weighing the waiting line (D-5) |
| `fill.json` | `fill` | Fill the rest around the operator's picks (D-12) |
| `free-since.json` | `free-since` | When each adult has been free since, the tie-break for who goes first (D-5) |
| `seat-down-the-queue.json` | `seat-down-the-queue` | Proposing boards down a whole queue reaches the chair cap (D-5) |
| `support-link.json` | `support-link` | Link and Unlink editing an adult's Supporting list |

## Shape

```json
{
  "format": 1,
  "op": "suggest",
  "cases": [
    {
      "name": "member-only adults fill the member seats, not a project chair",
      "youth": { "id": "S", "unit": "Troop1001", "boardType": "Final" },
      "adults": [
        { "id": "FC", "unit": "Troop9001", "final": "Chair",  "project": "Member" },
        { "id": "PC", "unit": "Troop9002", "final": "Member", "project": "Chair" },
        { "id": "M1", "unit": "Troop9003", "final": "Member", "project": "Member" },
        { "id": "M2", "unit": "Troop9004", "final": "Member", "project": "Member" }
      ],
      "waiting": [],
      "expect": { "chair": "FC", "members": ["M1", "M2"], "problems": [] }
    }
  ]
}
```

- **`format`** is 1. A runner that meets a higher number fails; it never
  guesses.
- **`name`** is unique within the file and names the test in every version, so
  a failure reads the same everywhere.
- **`expect`** holds only what the case checks. A key left out is not
  compared: a case that is about the chair can leave out `members`.

## Vocabulary

Field names are the spec's, not any one version's (O-1: *youth*). Values are
what the data files hold (D-1).

**A youth:** `{ "id", "unit", "boardType" }`. `unit` is the stored `UnitName`
(`"Troop1234"`), compared exactly: no trimming, no case folding. A blank
`unit` is unknown, never "the same" as another blank. `boardType` is `"Final"`
or `"Project"`. Any field left out is blank: `unit-conflicts` and
`outside-member` give only the `unit`.

**An adult:** `{ "id", "unit", "final", "project", "room", "freeSince",
"supporting", "woodBadge" }`. `final` and `project` are `"Chair"`,
`"Member"` or `"Unavailable"`. `room` is blank when free, a room name when on
a board, `"N/A"` when gone home. `freeSince` is a data-file time
(`yyyy-MM-dd_HH:mm±hhmm`). `supporting` is youth IDs joined by `|`.
`woodBadge` is `"Y"` or blank. Any field left out is blank.

**A proposal** (`suggest`, `fill`): `{ "chair", "members", "problems" }`.
`chair` is an adult ID or `null`, and is never repeated in `members`.
`members` is in the order proposed; order matters. `problems` is in the order
reported, each one structured rather than worded, because each version words
it its own way (Java and Windows: "No Final Chairs Available."; the Mac: "No
Final Board chairs are available."):

| Problem | Meaning |
|---|---|
| `{ "kind": "no-chair" }` | No qualified chair was free |
| `{ "kind": "too-few-members", "available": 1 }` | Only this many members were free |

## Operations

| Operation | Given | `expect` |
|---|---|---|
| `unit-conflicts` | `youth`, `adults` (the board) | The IDs of the members in the youth's unit, in board order |
| `outside-member` | `youth`, `adults` (the board) | `true` or `false` |
| `board-size` | `boardType`, `count` | `"too-few"`, `"ok"`, `"over-preferred"` or `"too-many"` |
| `suggest` | `youth`, `adults` (the pool), `waiting` (youth still waiting, in queue order) | A proposal |
| `fill` | `youth`, `adults` (the pool), `picked` (IDs the operator chose), `waiting` | A proposal: only the adults added, never the picks |
| `free-since` | `adults` (`id`, `regTime`), `boards` (`status`, `members` as stored, `lastUpdate`) | `{ "<adult id>": "<time>" }` for the adults it names |
| `seat-down-the-queue` | `adults` (the pool), `queue` (youth in sign-in order) | `{ "Final": n, "Project": n }`, the boards seated |
| `support-link` | `supporting`, `youth` (an ID), `linked` | The new `supporting` string |

`free-since` takes a board's `members` exactly as the youth file holds it, so
some cases use `,` and some `~` (a comma in a stored value, D-1).

`seat-down-the-queue` is a procedure every runner follows the same way: for
each youth in `queue` in order, `suggest` with `waiting` set to every other
youth in `queue` not yet seated, in queue order (one passed over earlier
still counts); if the proposal has no problems, count a board of that type
and set every proposed adult's `room` to any non-blank value, so later
proposals skip them.

Rooms are not part of these cases. Where a version's auto-select also picks
a room (Windows, Mac), the runner gives it one free room of the youth's board
type.

## Running them in each version

Each version keeps a byte-for-byte copy of the case files (the `*.json`;
this README stays here), pinned by a `test-cases.lock` holding this
repository's commit, and its CI fails if a copy differs or a file is
missing or extra, as `checkin-pages.lock` does for the check-in pages
(D-18). A separate lock lets the pages and the cases move on their own
schedules.

| Version | Copies live in | Runner |
|---|---|---|
| Java | `scripts/cases/` | `node scripts/test-cases.js [folder]`, through `process_seat.js` |
| Windows | `tests/EagleBoards.Tests/cases/` (copied to the output directory) | `SharedCaseTests`: one xUnit test per case |
| Mac | `Tests/EagleBoardsCoreTests/Resources/cases/` (a `.copy` resource) | `SharedCaseTests`: one Swift Testing test per case |

A runner:

- runs every case in every file, one named test each;
- fails on an unknown `op`, an unknown problem `kind`, or a `format` above 1;
- maps its own results into the shapes above before comparing, and never
  loosens a comparison to make a case pass;
- may skip a case only by listing its `name` in the runner with a reason, and
  a skip is a parity gap to record in SPEC.md.

Once a version's runner passes, its hand-ported copies of these cases go.
Tests of what only that version has (its screens, its storage, its HTTP
server) stay where they are.

`scripts/check-drift.sh` compares each local clone's copy against this
folder.

## Changing them

Edit or add a case here, then check it against every version before
anything pins it: run Java's runner on this folder
(`node scripts/test-cases.js ../eagleboards-shared/cases` in
`eagleboards-java`), and the others' where you can. A case the versions
answer differently is a question for SPEC.md first. Then copy the `*.json`
into each version and set its `test-cases.lock` to this repository's commit.

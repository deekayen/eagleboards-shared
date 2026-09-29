# Check-in pages

The pages the tablets at the door load, and anyone who scans the check-in QR
code on their phone. One design, served unchanged by every version of Eagle
Boards (SPEC.md D-18).

| File | What |
|---|---|
| `index.html` | Welcome: "I am a youth" / "I am 21 or older", and who has signed in |
| `youth_register.html` | Youth sign-in form |
| `adult_register.html` | Adult sign-in form |
| `checkin.css` | The look, light and dark, with every color pair measured |
| `checkin.js` | The API calls and the pages' shared behavior |

## Built for a shared laptop

Many people sign in on a shared laptop, and some can't scroll with a
trackpad. So on a laptop-sized window (1024×620 and up, including a
1366×768 laptop and a 1920×1080 one at Windows' 150% scaling) each form fits
without scrolling: the fields spread into two columns (youth) or three
(adult), and only a phone gets one long column. **Sign in** and **Cancel** are
pinned to the bottom of the window as well, so they are on screen however
tall the form grows (bigger text, error messages, a short screen). Keep both
true: after a change, check each form at 1366×650 and 1280×600 of page and
see that nothing needs scrolling.

## Changing them

Edit them **here**, never in a version's copy. Then copy all five files into
each version and set its lock file to this repository's commit:

| Version | Copies live in | Lock file |
|---|---|---|
| Java | `src/main/resources/shkc/core/WEBROOT/` | `checkin-pages.lock` |
| Windows | `src/EagleBoards.Web/wwwroot/` | `checkin-pages.lock` |
| Mac | `Sources/CheckInServer/Resources/CheckIn/` | `checkin-pages.lock` |

Each version's CI fetches the five files from this repository at the commit
in its lock file and fails if its copies differ by a byte. `scripts/check-drift.sh`
compares all three local clones against this folder.

Before committing a change here, run:

```bash
node scripts/check-contrast.js
```

and scan the pages with [axe-core](https://github.com/dequelabs/axe-core) in
light and dark, with the forms both fresh and showing errors (see below).

## What the pages ask the server

The same in every version (the Mac version's API):

| Call | Answer |
|---|---|
| `GET /api/checked-in` | `{ refreshSeconds, youth: [{ time, last, first, unitType, unit }], adults: [{ last, first, unitType, unit }] }`, in sign-in order. `refreshSeconds` is still sent but no longer read: the lists load when the page opens |
| `GET /api/scout-choices` | `[{ id, first, last, unitType, unit }]`: RSVPs and the event's walk-ins not yet finished, sorted by last name |
| `POST /api/youth-lookup` `email=` | the pre-registration it matches: `ID, Last, First, UnitType, Unit, BoardType, Leader`, or `{}` |
| `POST /api/adult-lookup` `email=` | the adult history it matches: `ID, Last, First, Phone, UnitType, Unit, FinalBoard, ProjectReview`, or `{}` |
| `POST /register-youth` | form fields; 200 on success, otherwise the reason as text |
| `POST /register-adult` | form fields, plus `WoodBadge` (`Y` or blank) and `Supporting` (youth IDs joined by `\|`); 200 on success |

Emails match trimmed and in any case; `NONE` and blank match nobody. Each
answer carries only what its page shows: names and units for the lists, and
for a lookup the fields that form fills in. **No birthdate** is asked for,
looked up or sent (D-7), and **no youth phone number** (D-8); adults are
still asked for theirs.

Paths the pages link to: `/`, `/youth_register`, `/adult_register`,
`/checkin.css`, `/checkin.js`.

## Accessibility: WCAG 2.2 AA

The pages are built to [WCAG 2.2](https://www.w3.org/TR/WCAG22/) level AA.
How each part is met, and how it was checked:

| Criterion | How |
|---|---|
| 1.1.1 Non-text content | No images; the one symbol (⚠ before an error) is decoration beside the words |
| 1.3.1 Info and relationships | Real headings, `<fieldset>`/`<legend>` groups, `<label for>` on every field, data tables with `<th scope="col">`, landmarks |
| 1.3.2 Meaningful sequence, 2.4.3 Focus order | One column; source order is reading and tab order |
| 1.3.5 Identify input purpose | `autocomplete` on email, first and last name, phone |
| 1.4.1 Use of color | Errors say what is wrong in words, beside the field and in a summary |
| 1.4.3 Contrast (minimum), 1.4.11 Non-text contrast | Fixed colors (not the device's accent), 21 pairs measured in light and dark by `scripts/check-contrast.js`: text 4.5:1 or better, field borders and the focus ring 3:1 or better |
| 1.4.4 Resize text, 1.4.10 Reflow, 1.4.12 Text spacing | Sizes in `rem`; one column with no sideways scrolling at 320px wide, also with WCAG's extra line, letter and word spacing applied |
| 2.1.1 Keyboard | Everything is a link, button or field; the two scrolling lists take focus so they can be scrolled from the keyboard |
| 2.2.1 Timing adjustable | After signing in, the page returns to the start after 20 seconds, says so, and has "Stay on this page" |
| 2.2.2 Pause, stop, hide | Nothing moves or updates on its own: the signed-in lists load when the welcome page opens (after every sign-in) and stay put |
| 2.4.2 Page titled, 2.4.6 Headings and labels | A distinct title per page; labels say what to enter |
| 2.4.7 Focus visible, 2.4.11 Focus not obscured | A 3px ring on every control. The pinned Sign in bar never hides the field in focus: the page keeps a scroll margin the height of the bar, checked on every field at phone size |
| 2.5.3 Label in name | Visible labels are the accessible names |
| 2.5.8 Target size | Every control is at least 44px tall; Sign in is never off screen |
| 3.1.1 Language of page | `lang="en"` |
| 3.3.1 Error identification, 3.3.3 Error suggestion | Each problem is marked on its field (`aria-invalid`, described by the message) and listed in a summary that is announced; focus goes to the first |
| 3.3.2 Labels or instructions | Every field labeled; hints for email (NONE), unit number, and the optional fields |
| 3.3.7 Redundant entry | A known email fills in the rest |
| 4.1.2 Name, role, value | Native controls throughout; the leave-without-saving prompt is a native `<dialog>` |
| 4.1.3 Status messages | "Signing you in…", the pre-fill notice and failures are announced from a `role="status"` region; errors from `role="alert"` |

Checked on 2026-09-27 with axe-core 4.10 (the WCAG 2.0/2.1/2.2 A and AA
rules) on all three pages in light and dark, with each form both fresh and
showing every error: no violations. axe leaves the contrast of rows scrolled
out of view inside the two lists undecided (it cannot sample a clipped
background); they use the same colors the contrast script measures.

**On the tablets:** turn off the browser's saved form entries (autofill) so one
person's details are never offered to the next, and let the device's own
light/dark setting and text size stand: the pages follow both.

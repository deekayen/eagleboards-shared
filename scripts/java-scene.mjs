// Build eagleboards.page's demo event (WEBSITE.md, "Re-shooting") in the Java
// jar and photograph it with shoot-java.mjs, on any computer: no Windows
// needed. Node 22 or later, Java, and Edge, Chrome or another Chromium
// browser; nothing to install.
//
//   node scripts/java-scene.mjs <eagleboards-java clone> <out-dir>
//   node scripts/java-scene.mjs <eagleboards-java clone> --event <data-dir>
//
// --event builds the scene and shoots nothing: it writes a data folder
// (Master_AdultHistory.csv, config.properties and tonight's folder) for
// another version to open, as the Windows tool's --site-event does. Its times
// are moved so 20:00 is the minute it finishes in; open it within that minute
// and the timers read as they do in the Java pictures. It writes only to a new
// folder or one it wrote before, never over a real data folder.
//
// Build the jar first (./mvnw package in the clone). BROWSER=<path> picks the
// browser, as for shoot-java.mjs (Brave: /Applications/Brave Browser.app/
// Contents/MacOS/Brave Browser). With ffmpeg on the PATH it also writes
// seat-board.gif and complete-board.gif; without it, animate the frames with
// the Windows tool's --gif (shoot-java.mjs, step 4).
//
// 1. Starts the jar on a spare port against a scratch folder holding a
//    header-only AdultHistory.csv and the clone's config.properties, so no
//    real record is ever read.
// 2. Seeds the scene over HTTP, with the calls the pages make, in the order of
//    Site.SeedEvent in eagleboards-windows' snapshot tool. Change the two
//    together, so every version's pictures show the same event.
// 3. Stops the jar and moves every time in its files so the scene's 20:00 is
//    the current minute: the jar stamps the real time as it goes.
// 4. Starts the jar again from those files at the top of a minute and runs
//    shoot-java.mjs against it, so the timers read 49, 28, 24 and 12 minutes
//    and the waits 53, 45 and 39 in every frame.
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [cloneArg, outArg, eventArg] = process.argv.slice(2);
if (!cloneArg || !outArg || (outArg === "--event" && !eventArg)) {
  console.error("usage: node scripts/java-scene.mjs <eagleboards-java clone> <out-dir>\n"
    + "       node scripts/java-scene.mjs <eagleboards-java clone> --event <data-dir>");
  process.exit(2);
}
const CLONE = resolve(cloneArg);
const EVENT = outArg === "--event" ? resolve(eventArg) : null;
const OUT = EVENT ? null : resolve(outArg);
// Left in an --event folder so a later run may replace it.
const MARK = ".java-scene";
if (EVENT) {
  let names = [];
  try { names = readdirSync(EVENT); } catch { /* new folder */ }
  if (names.length && !names.includes(MARK)) {
    throw new Error(EVENT + " is not empty and was not written by java-scene.mjs; give a new folder");
  }
}
const HERE = dirname(fileURLToPath(import.meta.url));
const JAVA = process.env.JAVA || "java";

const jars = readdirSync(join(CLONE, "target"))
  .filter((f) => /^eagleboardscheduler-.*\.jar$/.test(f))
  .map((f) => join(CLONE, "target", f))
  .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
if (!jars.length) throw new Error("No jar in " + join(CLONE, "target") + "; run ./mvnw package there first");
const JAR = jars[0];

// The scene, as Site.cs has it. Times are minutes before 20:00.
// Last, first, project review role, final board role, Wood Badge.
const ADULTS = [
  ["Armstrong", "Neil", "Member", "Chair", false],
  ["Lovell", "Jim", "Member", "Member", false],
  ["Duke", "Charles", "Member", "Member", false],
  ["Ford", "Gerald", "Member", "Chair", false],
  ["Gates", "Robert", "Member", "Member", false],
  ["Bloomberg", "Michael", "Member", "Member", false],
  ["Perot", "Ross", "Member", "Chair", false],
  ["Walton", "Sam", "Member", "Member", false],
  ["Bradley", "Bill", "Member", "Member", false],
  ["Spielberg", "Steven", "Chair", "Member", false],
  ["Rowe", "Mike", "Member", "Member", false],
  ["Bluford", "Guion", "Chair", "Member", true],
  ["Fossett", "Steve", "Member", "Member", true],
];
const ADULTS_SIGNED_IN = 70;
// Last, first, unit, board type, signed in, last changed (seated or started).
const YOUTH = [
  ["Eldred", "Arthur", 1001, "Final", 65, 49],
  ["Galifianakis", "Zach", 1002, "Final", 63, 24],
  ["Agre", "Peter", 1003, "Final", 60, 12],
  ["Corddry", "Rob", 1004, "Project", 58, 28],
  ["Amend", "Bill", 1005, "Project", 53, 53],
  ["Belle", "Albert", 1007, "Project", 45, 45],
  ["Cech", "Thomas", 1006, "Final", 39, 39],
];
// Room, board type, when its board last changed (200B: free from the start).
const ROOMS = [["101", "Final", 49], ["102", "Final", 24], ["103", "Final", 12], ["200A", "Project", 28], ["200B", "Project", 70]];
// What the seeding must leave behind, checked before anything is shot.
const EXPECTED = { Eldred: "InProgress", Galifianakis: "InProgress", Agre: "Seated", Corddry: "InProgress", Amend: "Registered", Belle: "Registered", Cech: "Registered" };

const adultId = (last) => {
  const i = ADULTS.findIndex((a) => a[0] === last);
  return `ADULT:${last}:${ADULTS[i][1]}:${2001 + i}`;
};
const youthId = (last) => {
  const y = YOUTH.find((x) => x[0] === last);
  return `SCOUT:${y[0]}:${y[1]}:${y[2]}`;
};
const email = (first, last) => `${first}.${last}@example.org`.toLowerCase();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pad = (n) => String(n).padStart(2, "0");
const day = (t) => `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
// The jar's own stamp: 2026-10-27_20:00-0400, in local time.
function stamp(t) {
  const offset = -t.getTimezoneOffset();
  const abs = Math.abs(offset);
  return `${day(t)}_${pad(t.getHours())}:${pad(t.getMinutes())}${offset < 0 ? "-" : "+"}${pad(Math.floor(abs / 60))}${pad(abs % 60)}`;
}

const scratch = mkdtempSync(join(tmpdir(), "eb-java-scene-"));
const PORT = 18700 + Math.floor(Math.random() * 500);
const BASE = `http://127.0.0.1:${PORT}`;
const history = join(scratch, "AdultHistory.csv");
writeFileSync(history, "Type,ID,Last,First,Email,Phone,UnitType,Unit,UnitName,ProjectReview,FinalBoard,RegTime,Room,Flags,Sel,BoardHistory,WoodBadge,Supporting\n");
const config = join(scratch, "config.properties");
copyFileSync(join(CLONE, "config.properties"), config);
const eventDir = join(scratch, day(new Date()));
const log = join(scratch, "jar.log");

let jar = null;
async function startJar() {
  const out = openSync(log, "a");
  // Started in the scratch folder: the jar writes a default config.properties
  // into the folder it starts in, and that must not land in a repository.
  jar = spawn(JAVA, ["-jar", JAR, "-a", history, "-c", config, "-port", String(PORT), "-d", eventDir],
    { cwd: scratch, stdio: ["ignore", out, out] });
  for (let i = 0; i < 80; i++) {
    await sleep(250);
    try {
      if ((await fetch(BASE + "/")).ok) return;
    } catch { /* not up yet */ }
  }
  throw new Error("The jar did not start:\n" + readFileSync(log, "utf8"));
}
async function stopJar() {
  if (!jar || jar.exitCode !== null) return;
  const exited = new Promise((r) => jar.once("exit", r));
  jar.kill();
  await exited;
}

async function post(path, fields) {
  const res = await fetch(BASE + path, { method: "POST", body: new URLSearchParams(fields) });
  if (!res.ok) throw new Error(`${path} ${JSON.stringify(fields)}: ${res.status} ${await res.text()}`);
}

async function seed() {
  for (const [room, type] of ROOMS) {
    await post("/room-update", { "!nativeeditor_status": "inserted", gr_id: "ROOM:" + room, Room: room, BoardType: type });
  }
  for (const [i, [last, first, project, final, woodBadge]] of ADULTS.entries()) {
    await post("/register-adult", {
      Last: last, First: first, Email: email(first, last), Phone: "555-0100", UnitType: "Troop", Unit: String(2001 + i),
      ProjectReview: project, FinalBoard: final, WoodBadge: woodBadge ? "Y" : "",
    });
  }
  const signIn = (last) => {
    const [, first, unit, type] = YOUTH.find((y) => y[0] === last);
    return post("/register-youth", { Last: last, First: first, Email: email(first, last), UnitType: "Troop", Unit: String(unit), BoardType: type });
  };
  const seat = (room, last, chair, members) => post("/seat-board", {
    RoomID: "ROOM:" + room, ScoutID: youthId(last), ChairID: adultId(chair), MemberIDs: members.map(adultId).join(","),
  });
  const start = (last) => post("/inprogress-board", { ScoutID: youthId(last) });

  // Sign-in order sets the W1..W7 numbers; the times are set afterwards.
  await signIn("Eldred");
  await signIn("Galifianakis");
  await signIn("Agre");
  await signIn("Corddry");
  await seat("101", "Eldred", "Armstrong", ["Armstrong", "Lovell", "Duke"]);
  await signIn("Amend");
  await start("Eldred");
  await signIn("Belle");
  await seat("102", "Galifianakis", "Ford", ["Ford", "Gates", "Bloomberg"]);
  await seat("200A", "Corddry", "Spielberg", ["Spielberg", "Rowe"]);
  await signIn("Cech");
  await start("Corddry");
  await start("Galifianakis");
  await seat("103", "Agre", "Perot", ["Perot", "Walton", "Bradley"]);
}

// Rewrite the given columns of each row in one of the event's files. Values
// never hold a comma: the jar stores one as "~".
function retime(file, keyColumn, times) {
  const path = join(eventDir, file);
  const lines = readFileSync(path, "utf8").split("\n");
  const head = lines[0].split(",");
  const out = lines.map((line, i) => {
    if (i === 0 || !line.trim()) return line;
    const cells = line.split(",");
    for (const [column, when] of Object.entries(times(cells[head.indexOf(keyColumn)]))) {
      const at = head.indexOf(column);
      if (at < 0) throw new Error(`${file} has no ${column} column`);
      cells[at] = stamp(when);
    }
    return cells.join(",");
  });
  writeFileSync(path, out.join("\n"));
}

function checkSeeded() {
  const lines = readFileSync(join(eventDir, "scouts.csv"), "utf8").split("\n").filter((l) => l.trim());
  const head = lines[0].split(",");
  const got = Object.fromEntries(lines.slice(1).map((l) => l.split(",")).map((c) => [c[head.indexOf("Last")], c[head.indexOf("Status")]]));
  for (const [last, status] of Object.entries(EXPECTED)) {
    if (got[last] !== status) throw new Error(`${last} is ${got[last]}, not ${status}, after seeding`);
  }
}

function gif(name, frames) {
  const list = join(OUT, name + ".txt");
  const entries = frames.flatMap(([file, ms]) => [`file '${join(OUT, file).replace(/\\/g, "/")}'`, `duration ${ms / 1000}`]);
  // The concat demuxer drops the last duration unless the last file follows it.
  entries.push(`file '${join(OUT, frames.at(-1)[0]).replace(/\\/g, "/")}'`);
  writeFileSync(list, entries.join("\n") + "\n");
  // One palette for the whole animation and no dithering, as the Windows
  // tool's GifWriter does: flat UI colors survive, text stays crisp.
  const r = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", list,
    "-vf", "split[a][b];[a]palettegen=stats_mode=full:reserve_transparent=0[p];[b][p]paletteuse=dither=none:diff_mode=rectangle",
    "-fps_mode", "passthrough", "-loop", "0", join(OUT, name)], { stdio: "inherit" });
  rmSync(list, { force: true });
  if (r.status !== 0) throw new Error("ffmpeg could not write " + name);
  console.log("wrote " + name);
}

try {
  console.log("jar: " + JAR);
  await startJar();
  await seed();
  await stopJar();
  checkSeeded();

  // Shoot within one minute: shoot-java.mjs takes about half of one.
  if (new Date().getSeconds() > 15) {
    await sleep((60 - new Date().getSeconds()) * 1000 - new Date().getMilliseconds() + 200);
  }
  const eight = new Date();
  eight.setSeconds(0, 0);
  const before = (mins) => new Date(eight.getTime() - mins * 60000);
  retime("scouts.csv", "Last", (last) => {
    const y = YOUTH.find((x) => x[0] === last);
    return { RegTime: before(y[4]), LastUpdateTime: before(y[5]) };
  });
  retime("adults.csv", "Last", () => ({ RegTime: before(ADULTS_SIGNED_IN) }));
  retime("rooms.csv", "Room", (room) => ({ RegTime: before(ROOMS.find((r) => r[0] === room)[2]) }));
  console.log("the scene's 20:00 is " + stamp(eight));

  if (EVENT) {
    rmSync(EVENT, { recursive: true, force: true });
    mkdirSync(join(EVENT, day(eight)), { recursive: true });
    copyFileSync(history, join(EVENT, "Master_AdultHistory.csv"));
    copyFileSync(config, join(EVENT, "config.properties"));
    for (const f of readdirSync(eventDir)) copyFileSync(join(eventDir, f), join(EVENT, day(eight), f));
    writeFileSync(join(EVENT, MARK), "Synthetic demo event from eagleboards-shared/scripts/java-scene.mjs\n");
    console.log("wrote " + EVENT + "; open it before the minute is out");
  } else {
    await startJar();
    mkdirSync(OUT, { recursive: true });
    const shoot = spawn(process.execPath, [join(HERE, "shoot-java.mjs"), BASE, OUT], { stdio: "inherit" });
    const code = await new Promise((r) => shoot.once("exit", r));
    if (code !== 0) throw new Error("shoot-java.mjs failed");
    if (new Date().getMinutes() !== eight.getMinutes()) {
      console.warn("warning: the shots ran past the minute, so some timers may read one minute more");
    }
  }
} finally {
  await stopJar();
  try { rmSync(scratch, { recursive: true, force: true }); } catch { /* still locked */ }
}

if (EVENT) {
  // Nothing shot, nothing to animate.
} else if (spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0) {
  gif("seat-board.gif", [["seat-0.png", 2500], ["seat-1.png", 4000], ["seat-2.png", 4000]]);
  gif("complete-board.gif", [["complete-0.png", 3000], ["complete-1.png", 3500], ["complete-2.png", 4000]]);
} else {
  console.log("No ffmpeg: animate the frames with the Windows tool's --gif (shoot-java.mjs, step 4).");
}

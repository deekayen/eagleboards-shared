// Photograph the Java version's operator pages with eagleboards.page's demo
// cast (WEBSITE.md, "Re-shooting"). Drives a headless Edge or Chrome over the
// DevTools protocol against a jar serving the demo event, and writes PNG
// frames. Node 22 or later; nothing to install.
//
// On any computer, java-scene.mjs does all of the steps below in one go: it
// builds the event in the jar itself, runs this script, and animates the
// frames with ffmpeg. By hand, with Windows:
//
// 1. Write the demo event, on Windows, in eagleboards-windows:
//      dotnet run --project tests/EagleBoards.UiSnapshots -c Release -- --site-event <dir>
//    Its times are moved so the scene's 20:00 is now, so do steps 2 and 3
//    within the minute: the timers then read 49, 28, 24 and 12 minutes.
// 2. Copy eagleboards-java's config.properties into <dir> and start the jar:
//      java -jar <jar> -a <dir>/AdultHistory.csv -c <dir>/config.properties \
//        -port 18765 -d <dir>/<today's date>
// 3. node scripts/shoot-java.mjs http://127.0.0.1:18765 <out-dir>
// 4. Animate the frames with the same tool, as the other walkthroughs are:
//      ... -- --gif seat-board.gif seat-0.png 2500 seat-1.png 4000 seat-2.png 4000
//      ... -- --gif complete-board.gif complete-0.png 3000 complete-1.png 3500 complete-2.png 4000
//
// evening-dark.png is the site's java/evening.png and, with evening-light.png,
// the Java README's event pictures; results.png and settings.png go to both.
// people.png is taken but unused: its sign-in times show as stored.
//
//   node scripts/shoot-java.mjs <base-url> <out-dir>   (BROWSER=<path> to choose one)
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.argv[2];
const OUT = process.argv[3];
mkdirSync(OUT, { recursive: true });
const EDGE = process.env.BROWSER || [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].find((p) => existsSync(p));
if (!EDGE) throw new Error("No Edge or Chrome found; set BROWSER to one");
const PORT = 9300 + Math.floor(Math.random() * 400);
const profile = join(tmpdir(), "eb-java-shots-" + Date.now());
const edge = spawn(EDGE, ["--headless", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--window-size=1440,900", "about:blank"],
  { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    target = list.find((t) => t.type === "page");
  } catch { /* not up yet */ }
}
if (!target) throw new Error("Edge did not start");

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let nextId = 1;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});

async function js(expression) {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " in " + expression);
  return r.result.value;
}

async function theme(scheme) {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: scheme }] });
}

// What a normal start on the venue Wi-Fi shows, in place of this machine's addresses.
const VENUE = `var a = document.getElementById("checkin-address");
  if (a) a.innerHTML = 'Check-in address: <a href="#">http://192.168.1.23:8080/</a>';`;

async function open(path) {
  await send("Page.navigate", { url: BASE + path });
  await sleep(1800);
  await js(VENUE);
  await sleep(200);
}

async function click(selector) {
  const ok = await js(`(function(){ var e = document.querySelector(${JSON.stringify(selector)}); if (!e) return false; e.click(); return true; })()`);
  if (!ok) throw new Error("nothing matches " + selector);
  await sleep(900);
  await js(VENUE);
}

async function shot(name) {
  await sleep(300);
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(OUT, name), Buffer.from(r.data, "base64"));
  console.log("wrote " + name);
}

const youth = (id) => `.eb-queue-item[data-id="${id}"]`;
const ELDRED = "SCOUT:Eldred:Arthur:1001";
const AMEND = "SCOUT:Amend:Bill:1005";

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

try {
  // The evening, before anything changes: dark for the site, both for the README.
  for (const scheme of ["dark", "light"]) {
    await theme(scheme);
    await open("/scheduler");
    await click(youth(ELDRED));
    await shot(`evening-${scheme}.png`);
  }

  // Dark: Bill Amend seated in 200B.
  await theme("dark");
  await open("/scheduler");
  await shot("seat-0.png");
  await click(youth(AMEND));
  await shot("seat-1.png");
  await click("#d-seat");
  await shot("seat-2.png");

  // Light: Arthur Eldred's board comes out and is recorded.
  await theme("light");
  await open("/scheduler");
  await click(youth(ELDRED));
  await shot("complete-0.png");
  await click("#d-primary");
  await js(`document.querySelector("dialog[open] textarea").value = "Well prepared. Led a strong service project for his community."`);
  await shot("complete-1.png");
  await js(`Array.from(document.querySelectorAll("dialog[open] button")).find(b => b.textContent.trim() === "Complete").click()`);
  await sleep(900);
  await js(VENUE);
  await shot("complete-2.png");

  // The records and the settings, light.
  await open("/admin#boards");
  await shot("results.png");
  await open("/admin#adults");
  await shot("people.png");
  await open("/configure");
  await shot("settings.png");
} finally {
  ws.close();
  edge.kill();
  await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* still locked */ }
}

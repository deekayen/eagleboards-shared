#!/usr/bin/env node
// ------------------------------------------------------------------------
// check-palette.js -- measure the status palette (SPEC.md D-13) in light and
// in dark:
//
//   1. Contrast. Each pill's and timer's words on its own fill meet WCAG 2.2
//      AA 1.4.3 (4.5:1), and the solid Overdue fill stands out from the
//      window behind it (1.4.11, 3:1).
//   2. Color blindness. Each pair of pills, and the three timer states, stay
//      apart for protanopia, deuteranopia and tritanopia, simulated with
//      Machado, Oliveira and Fernandes (2009) at full severity. Running long
//      and Overdue stay apart for no color vision at all, by lightness.
//
// Differences are CIEDE2000 (dE00). About 2 is the smallest difference most
// people notice side by side; 5 is plain at a glance.
//
// The colors come straight from the palette table in SPEC.md, so the spec
// cannot drift from what was measured.
//
//   node scripts/check-palette.js          # exit 1 if anything falls short
//
// No packages, no network: Node alone.
// ------------------------------------------------------------------------

"use strict";

const fs = require("fs");
const path = require("path");

const spec = fs.readFileSync(path.join(__dirname, "..", "SPEC.md"), "utf8");

// | `seated-bg` | Seated pill (yellow) | `#f3dfc4` | `#685b3e` |
const ROW = /^\| `([a-z]+-(?:bg|fg))` \|[^|]*\| `(#[0-9a-f]{6})` \| `(#[0-9a-f]{6})` \|$/gm;
const light = {};
const dark = {};
let m;
while ((m = ROW.exec(spec)) !== null) {
   light[m[1]] = m[2];
   dark[m[1]] = m[3];
}

const PILLS = ["neutral", "seated", "review", "completed"];
const TIMERS = ["long", "overdue"];

// The window behind a pill or timer: each version's card and page colors,
// lightest and darkest, in each appearance.
const SURFACES = {
   light: ["#ffffff", "#f9f9f9", "#f3f3f3"],
   dark: ["#1c1c1c", "#2b2b2b", "#2e2e2e"],
};

const PILL_APART = 5;      // dE00 between two pills, by fill or by word
const TIMER_APART = 20;    // dE00 between the Running long and Overdue fills
const TIMER_LIGHTNESS = 20; // L* between them, for no color vision at all
const FILL_SHOWS = 5;      // dE00 between the Running long tint and the window

// Machado et al. 2009, severity 1.0, applied to linear RGB.
const VISION = {
   "normal": null,
   "protanopia": [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
   "deuteranopia": [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
   "tritanopia": [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};

function linear(hex) {
   return [1, 3, 5].map(function (i) {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
   });
}

function seenBy(hex, vision) {
   const c = linear(hex);
   const mat = VISION[vision];
   if (!mat) {
      return c;
   }
   return mat.map(function (row) {
      return Math.min(1, Math.max(0, row[0] * c[0] + row[1] * c[1] + row[2] * c[2]));
   });
}

function luminance(c) {
   return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function ratio(a, b) {
   const la = luminance(linear(a));
   const lb = luminance(linear(b));
   return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function lab(c) {
   const x = (0.4124 * c[0] + 0.3576 * c[1] + 0.1805 * c[2]) / 0.95047;
   const y = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
   const z = (0.0193 * c[0] + 0.1192 * c[1] + 0.9505 * c[2]) / 1.08883;
   const f = function (t) { return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; };
   return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

// CIEDE2000, after Sharma, Wu and Dalal (2005).
function deltaE(p, q) {
   const rad = Math.PI / 180;
   const [L1, a1, b1] = p;
   const [L2, a2, b2] = q;
   const Cbar = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2;
   const G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));
   const a1p = (1 + G) * a1;
   const a2p = (1 + G) * a2;
   const C1 = Math.hypot(a1p, b1);
   const C2 = Math.hypot(a2p, b2);
   const h1 = C1 === 0 ? 0 : (Math.atan2(b1, a1p) / rad + 360) % 360;
   const h2 = C2 === 0 ? 0 : (Math.atan2(b2, a2p) / rad + 360) % 360;
   let dh = h2 - h1;
   if (C1 * C2 === 0) {
      dh = 0;
   } else if (dh > 180) {
      dh -= 360;
   } else if (dh < -180) {
      dh += 360;
   }
   const dL = L2 - L1;
   const dC = C2 - C1;
   const dH = 2 * Math.sqrt(C1 * C2) * Math.sin(dh * rad / 2);
   const Lbar = (L1 + L2) / 2;
   const Cbarp = (C1 + C2) / 2;
   let hbar = h1 + h2;
   if (C1 * C2 !== 0) {
      hbar = Math.abs(h1 - h2) <= 180 ? (h1 + h2) / 2 : (h1 + h2 + (h1 + h2 < 360 ? 360 : -360)) / 2;
   }
   const T = 1 - 0.17 * Math.cos((hbar - 30) * rad) + 0.24 * Math.cos(2 * hbar * rad)
      + 0.32 * Math.cos((3 * hbar + 6) * rad) - 0.20 * Math.cos((4 * hbar - 63) * rad);
   const dTheta = 30 * Math.exp(-Math.pow((hbar - 275) / 25, 2));
   const Rc = 2 * Math.sqrt(Math.pow(Cbarp, 7) / (Math.pow(Cbarp, 7) + Math.pow(25, 7)));
   const Sl = 1 + 0.015 * Math.pow(Lbar - 50, 2) / Math.sqrt(20 + Math.pow(Lbar - 50, 2));
   const Sc = 1 + 0.045 * Cbarp;
   const Sh = 1 + 0.015 * Cbarp * T;
   const Rt = -Math.sin(2 * dTheta * rad) * Rc;
   return Math.sqrt(Math.pow(dL / Sl, 2) + Math.pow(dC / Sc, 2) + Math.pow(dH / Sh, 2) + Rt * (dC / Sc) * (dH / Sh));
}

function apart(a, b, vision) {
   return deltaE(lab(seenBy(a, vision)), lab(seenBy(b, vision)));
}

let failures = 0;
let checks = 0;

function report(ok, text) {
   checks++;
   if (!ok) {
      failures++;
   }
   console.log((ok ? "  ok  " : "FAIL  ") + text);
}

const tokens = PILLS.concat(TIMERS).reduce(function (all, t) { return all.concat([t + "-bg", t + "-fg"]); }, []);
const missing = tokens.filter(function (t) { return !light[t]; });
if (missing.length > 0) {
   console.log("FAIL  SPEC.md's palette table has no row for " + missing.join(", "));
   process.exit(1);
}

for (const [scheme, t] of [["light", light], ["dark", dark]]) {
   console.log("== " + scheme + " ==");

   for (const k of PILLS.concat(TIMERS)) {
      const r = ratio(t[k + "-fg"], t[k + "-bg"]);
      report(r >= 4.5, r.toFixed(2).padStart(5) + ":1  (needs 4.5)  " + k + " words on its fill  ["
         + t[k + "-fg"] + " on " + t[k + "-bg"] + "]");
   }
   for (const s of SURFACES[scheme]) {
      const r = ratio(t["overdue-bg"], s);
      report(r >= 3, r.toFixed(2).padStart(5) + ":1  (needs 3)    the Overdue fill on a " + s + " window");
   }

   for (let i = 0; i < PILLS.length; i++) {
      for (let j = i + 1; j < PILLS.length; j++) {
         const a = PILLS[i];
         const b = PILLS[j];
         let worst = Infinity;
         let who = "";
         for (const vision of Object.keys(VISION)) {
            const d = Math.max(apart(t[a + "-bg"], t[b + "-bg"], vision), apart(t[a + "-fg"], t[b + "-fg"], vision));
            if (d < worst) {
               worst = d;
               who = vision;
            }
         }
         report(worst >= PILL_APART, worst.toFixed(1).padStart(5) + " dE00 (needs " + PILL_APART + ")  " + a + " and " + b
            + " pills, closest for " + who);
      }
   }

   let worst = Infinity;
   let who = "";
   for (const vision of Object.keys(VISION)) {
      const d = apart(t["long-bg"], t["overdue-bg"], vision);
      if (d < worst) {
         worst = d;
         who = vision;
      }
   }
   report(worst >= TIMER_APART, worst.toFixed(1).padStart(5) + " dE00 (needs " + TIMER_APART
      + ")  Running long and Overdue fills, closest for " + who);
   const dL = Math.abs(lab(linear(t["long-bg"]))[0] - lab(linear(t["overdue-bg"]))[0]);
   report(dL >= TIMER_LIGHTNESS, dL.toFixed(1).padStart(5) + " L*   (needs " + TIMER_LIGHTNESS
      + ")  Running long and Overdue fills in lightness alone (no color vision)");

   for (const s of SURFACES[scheme]) {
      let least = Infinity;
      for (const vision of Object.keys(VISION)) {
         least = Math.min(least, apart(t["long-bg"], s, vision));
      }
      report(least >= FILL_SHOWS, least.toFixed(1).padStart(5) + " dE00 (needs " + FILL_SHOWS
         + ")  the Running long tint on a " + s + " window, for every kind of color vision");
   }
}

console.log("");
if (failures > 0) {
   console.log("PALETTE: FAIL -- " + failures + " of " + checks + " checks short");
   process.exit(1);
}
console.log("PALETTE: PASS -- " + checks + " checks, light and dark");

#!/usr/bin/env node
// ------------------------------------------------------------------------
// check-contrast.js -- measure every foreground/background pair the check-in
// pages use, in light and in dark, against WCAG 2.2 AA:
//
//   1.4.3  Contrast (Minimum)     text 4.5:1
//   1.4.11 Non-text Contrast      control boundaries and focus 3:1
//
// The colors come straight from checkin/checkin.css (the :root block and the
// prefers-color-scheme: dark block), so the stylesheet cannot drift from what
// was measured. Add a pair here whenever the stylesheet puts a new color on
// another one.
//
//   node scripts/check-contrast.js          # exit 1 if any pair falls short
//
// No packages, no network: Node alone.
// ------------------------------------------------------------------------

"use strict";

const fs = require("fs");
const path = require("path");

const css = fs.readFileSync(path.join(__dirname, "..", "checkin", "checkin.css"), "utf8");

// [foreground, background, minimum, what it is]
const PAIRS = [
   ["text", "bg", 4.5, "body text on the page"],
   ["text", "surface", 4.5, "body text on a card or field"],
   ["text", "surface-alt", 4.5, "body text on a hovered tile or button"],
   ["text-2", "bg", 4.5, "secondary text on the page"],
   ["text-2", "surface", 4.5, "secondary text (hints, times, headers) on a card"],
   ["text-2", "surface-alt", 4.5, "secondary text on a hovered tile"],
   ["accent-text", "accent", 4.5, "text on the primary button (Sign in)"],
   ["accent-fg", "bg", 4.5, "links on the page"],
   ["accent-fg", "surface", 4.5, "links on a card"],
   ["error-fg", "error-bg", 4.5, "an error message"],
   ["error-fg", "surface", 4.5, "a field's error under it"],
   ["disabled-fg", "disabled-bg", 3.0, "a disabled field (exempt from 1.4.3; kept readable)"],
   ["control-border", "surface", 3.0, "a field or button border on a card"],
   ["control-border", "bg", 3.0, "a tile or field border on the page"],
   ["control-border", "surface-alt", 3.0, "a border on a hovered control"],
   ["error-fg", "bg", 3.0, "an invalid field's border against the page"],
   ["focus", "bg", 3.0, "the focus ring on the page"],
   ["focus", "surface", 3.0, "the focus ring on a card"],
   ["accent", "bg", 3.0, "the primary button's edge against the page (the Sign in bar)"],
   ["accent", "surface", 3.0, "the primary button's edge against a card"],
];

function tokens(block) {
   const out = {};
   const re = /--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g;
   let m;
   while ((m = re.exec(block)) !== null) {
      out[m[1]] = m[2];
   }
   return out;
}

const lightBlock = css.slice(css.indexOf(":root {"), css.indexOf("}", css.indexOf(":root {")));
const darkStart = css.indexOf("@media (prefers-color-scheme: dark)");
const darkBlock = css.slice(darkStart, css.indexOf("}\n}", darkStart));
const light = tokens(lightBlock);
const dark = Object.assign({}, light, tokens(darkBlock));

function luminance(hex) {
   const c = [1, 3, 5].map(function (i) {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
   });
   return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function ratio(a, b) {
   const la = luminance(a);
   const lb = luminance(b);
   return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

let failures = 0;
for (const [scheme, t] of [["light", light], ["dark", dark]]) {
   console.log("== " + scheme + " ==");
   for (const [fg, bg, min, what] of PAIRS) {
      if (!t[fg] || !t[bg]) {
         console.log("FAIL  --" + fg + " or --" + bg + " is not a #rrggbb color in checkin.css");
         failures++;
         continue;
      }
      const r = ratio(t[fg], t[bg]);
      const ok = r >= min;
      if (!ok) {
         failures++;
      }
      console.log((ok ? "  ok  " : "FAIL  ") + r.toFixed(2).padStart(5) + ":1  (needs " + min + ")  "
         + what + "  [" + t[fg] + " on " + t[bg] + "]");
   }
}

console.log("");
if (failures > 0) {
   console.log("CONTRAST: FAIL -- " + failures + " pair(s) short of WCAG 2.2 AA");
   process.exit(1);
}
console.log("CONTRAST: PASS -- " + PAIRS.length * 2 + " pairs meet WCAG 2.2 AA");

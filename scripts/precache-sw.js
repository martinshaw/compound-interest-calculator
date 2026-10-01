#!/usr/bin/env node
/**
 * After `next build`, inject hashed /_next/static assets into dist/sw.js
 * so the service worker can precache the full app for offline use.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const swPath = path.join(dist, "sw.js");

if (!fs.existsSync(swPath)) {
  console.warn("[precache-sw] dist/sw.js missing; skip");
  process.exit(0);
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(dist)
  .filter((f) => !f.endsWith("/sw.js"))
  .map((f) => "./" + path.relative(dist, f).split(path.sep).join("/"))
  // Keep list reasonable: HTML/CSS/JS/fonts/icons/manifest
  .filter((f) =>
    /\.(html|js|css|woff2?|png|ico|webmanifest|json)$/i.test(f) || f === "./"
  );

const unique = [...new Set(files)].sort();
const literal = JSON.stringify(unique, null, 2);

let sw = fs.readFileSync(swPath, "utf8");
if (!sw.includes("const BUILD_ASSETS = ")) {
  console.warn("[precache-sw] BUILD_ASSETS marker missing; skip");
  process.exit(0);
}

sw = sw.replace(
  /const BUILD_ASSETS = \[[\s\S]*?\];/,
  `const BUILD_ASSETS = ${literal};`
);
fs.writeFileSync(swPath, sw);
console.log(`[precache-sw] injected ${unique.length} build assets into dist/sw.js`);

#!/usr/bin/env node
/**
 * Writes CACHE_NAME into public/sw.js from package.json version
 * so each release busts the service worker cache (compound-interest-vX.Y.Z).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = pkg.version;
const cacheName = `compound-interest-v${version}`;
const swPath = path.join(root, "public", "sw.js");

let sw = fs.readFileSync(swPath, "utf8");
const next = sw.replace(
  /const CACHE_NAME = ['"]compound-interest-v[^'"]*['"]/,
  `const CACHE_NAME = '${cacheName}'`
);

if (next === sw && !sw.includes(`'${cacheName}'`)) {
  console.warn("[prepare-sw] CACHE_NAME pattern not found; leaving sw.js unchanged");
} else {
  fs.writeFileSync(swPath, next);
  console.log(`[prepare-sw] CACHE_NAME -> ${cacheName}`);
}

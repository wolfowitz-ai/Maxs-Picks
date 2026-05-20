#!/usr/bin/env node
// Copies attached_assets/ into the Vite build output so they're served as
// static files on Vercel.
import { cp, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "attached_assets");
const destBase = path.join(root, "dist", "public");
const dest = path.join(destBase, "attached_assets");

if (!existsSync(src)) {
  console.log("[copy-attached-assets] No attached_assets/ — skipping.");
  process.exit(0);
}

await mkdir(destBase, { recursive: true });
await cp(src, dest, { recursive: true });
const s = await stat(dest);
console.log(`[copy-attached-assets] Copied to ${dest} (${s.isDirectory() ? "ok" : "?"})`);

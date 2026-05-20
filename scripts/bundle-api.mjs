#!/usr/bin/env node
// Bundles the serverless entrypoint into a single self-contained file at
// api/index.js. This sidesteps Node's ESM extension-resolution requirements
// (TypeScript with moduleResolution=bundler doesn't emit .js extensions).
import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const apiDir = path.join(root, "api");
await mkdir(apiDir, { recursive: true });

const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf-8"));
const allDeps = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];
// Heavy native / non-bundleable deps that should stay external and be
// resolved from node_modules at runtime.
const keepExternal = new Set([
  "sharp",
  "@google-cloud/storage",
  "google-auth-library",
  "pg",
  "pg-native",
  "bufferutil",
  "utf-8-validate",
]);
const external = allDeps.filter((d) => keepExternal.has(d));

await build({
  entryPoints: [path.join(root, "server", "serverless-entry.ts")],
  outfile: path.join(apiDir, "index.js"),
  platform: "node",
  target: "node22",
  format: "cjs",
  bundle: true,
  minify: true,
  sourcemap: false,
  logLevel: "info",
  external,
  define: { "process.env.NODE_ENV": '"production"' },
});

// Vercel's @vercel/node runtime needs a package.json next to the function
// telling it this file is CommonJS (our root package.json says "type":
// "module"). Drop a minimal one.
await writeFile(
  path.join(apiDir, "package.json"),
  JSON.stringify({ type: "commonjs" }, null, 2) + "\n",
);

console.log("[bundle-api] wrote api/index.js");

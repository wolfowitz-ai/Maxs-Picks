#!/usr/bin/env node
// One-shot importer for the Replit pg_dump produced via:
//   pg_dump --data-only --no-owner --no-privileges -t categories -t products
// Pass the path to the .sql file. Reads DATABASE_URL from env.
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const dumpPath = process.argv[2];
if (!dumpPath) {
  console.error("Usage: node scripts/import-replit-dump.mjs <path-to-dump.sql>");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL must be set in the environment.");
  process.exit(1);
}

const raw = fs.readFileSync(path.resolve(dumpPath), "utf-8");

// Parse each `COPY public.<table> (<cols>) FROM stdin;` block followed by
// tab-separated rows terminated by `\.`.
const copyBlockRe = /COPY public\.(\w+) \(([^)]+)\) FROM stdin;\s*\n([\s\S]*?)\n\\\.\s*\n/g;

const blocks = [];
let m;
while ((m = copyBlockRe.exec(raw)) !== null) {
  const [, table, colsRaw, body] = m;
  const cols = colsRaw.split(",").map((c) => c.trim());
  const rows = body
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => line.split("\t").map(unquoteValue));
  blocks.push({ table, cols, rows });
}

// pg COPY's text format escapes: \N → NULL, \t / \n / \\ etc.
function unquoteValue(v) {
  if (v === "\\N") return null;
  // unescape
  let out = "";
  for (let i = 0; i < v.length; i++) {
    if (v[i] === "\\" && i + 1 < v.length) {
      const next = v[i + 1];
      if (next === "n") out += "\n";
      else if (next === "t") out += "\t";
      else if (next === "r") out += "\r";
      else if (next === "\\") out += "\\";
      else out += next;
      i++;
    } else {
      out += v[i];
    }
  }
  return out;
}

// Postgres array literals like `{a,b}` from pg_dump → JS arrays so the
// node-postgres driver can re-encode them into the array column.
function parseArrayCell(text) {
  if (text == null) return null;
  if (!text.startsWith("{") || !text.endsWith("}")) return [text];
  const inner = text.slice(1, -1);
  if (inner === "") return [];
  // Naive splitter — fine for our paths/strings (no embedded commas)
  return inner.split(",").map((s) => s.replace(/^"|"$/g, ""));
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const expected = new Set(["categories", "products"]);
const seen = new Set(blocks.map((b) => b.table));
for (const t of expected) {
  if (!seen.has(t)) {
    console.warn(`[warn] no COPY block found for ${t}`);
  }
}

for (const { table, cols, rows } of blocks) {
  if (!expected.has(table)) {
    console.warn(`[skip] ignoring unexpected table: ${table}`);
    continue;
  }
  console.log(`[${table}] ${rows.length} row(s)`);

  // Identify array-typed columns by table+col so we coerce them.
  const arrayCols = new Set(table === "products" ? ["images"] : []);

  await client.query("BEGIN");
  await client.query(`TRUNCATE public.${table} CASCADE`);
  for (const row of rows) {
    const values = row.map((cell, i) =>
      arrayCols.has(cols[i]) ? parseArrayCell(cell) : cell,
    );
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const colList = cols.map((c) => `"${c}"`).join(", ");
    const sql = `INSERT INTO public.${table} (${colList}) VALUES (${placeholders})`;
    try {
      await client.query(sql, values);
    } catch (err) {
      console.error(`[${table}] insert failed:`, err.message);
      console.error("  values:", values);
      throw err;
    }
  }
  await client.query("COMMIT");
}

await client.end();
console.log("done.");

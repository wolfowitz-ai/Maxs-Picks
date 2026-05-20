# Deploying Little Pup Goodies to Vercel

This is the playbook to take this repo from "cloned" to "live at https://littlepupgoodies.com".

You'll provision two things from the Vercel dashboard (Postgres + Blob storage), then deploy. The whole thing should take ~20 minutes.

---

## 0. One-time: install the Vercel CLI

```bash
npm i -g vercel
vercel login
```

---

## 1. Link the repo to a Vercel project

From the project root:

```bash
vercel link
```

When prompted:
- **Scope** → your team
- **Link to existing project?** → No
- **Project name** → `little-pup-goodies` (or whatever you like)
- **Directory** → `.`
- **Want to modify settings?** → No (we already have `vercel.json`)

This creates `.vercel/` locally (already gitignored by Vercel's defaults — you may want to add it to `.gitignore` if you push this).

---

## 2. Provision Neon Postgres

In the Vercel dashboard:

1. Go to your new project → **Storage** tab
2. Click **Create Database** → **Marketplace** → **Neon**
3. Pick the **Free** plan, a region close to your users (US-East is fine)
4. Click **Connect Project** → select `little-pup-goodies` → **All environments**

This auto-injects `DATABASE_URL` (and a few other Neon vars) into Production, Preview, and Development.

---

## 3. Provision Vercel Blob

In the same **Storage** tab:

1. Click **Create Database** → **Blob**
2. Name it `little-pup-goodies-images`
3. Click **Connect Project** → `little-pup-goodies` → **All environments**

This auto-injects `BLOB_READ_WRITE_TOKEN`. The app detects this and switches image storage to Blob automatically — no code change needed.

---

## 4. Add the rest of the env vars

In the project's **Settings → Environment Variables**, add these to **Production** (and Preview if you want):

| Variable | Value |
|---|---|
| `ADMIN_PASSWORD` | a strong password you'll use to log into `/admin-login` |
| `OPENAI_API_KEY` | _(optional — only needed for "spin text" buttons)_ |
| `SCRAPER_API_KEY` | _(optional — fallback Amazon scraper)_ |
| `AMAZON_ACCESS_KEY` / `AMAZON_SECRET_KEY` / `AMAZON_PARTNER_TAG` | _(optional — official PA-API import)_ |

You do **not** need to set: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `LOCAL_STORAGE`, `PORT`, `NODE_ENV`, `REPL_ID`, `SESSION_SECRET`. The integrations or the platform handle those.

---

## 5. Pull env vars locally and run the migration

Pull the production env vars to your machine so you can run the Drizzle migration against Neon:

```bash
vercel env pull .env.production.local
DATABASE_URL=$(grep ^DATABASE_URL .env.production.local | cut -d= -f2- | tr -d '"') npm run db:push
```

(On PowerShell:)
```powershell
vercel env pull .env.production.local
$env:DATABASE_URL = (Get-Content .env.production.local | Select-String '^DATABASE_URL=').Line -replace '^DATABASE_URL=', '' -replace '"', ''
npm run db:push
```

You should see Drizzle create the `categories`, `products`, `sessions`, and `users` tables.

---

## 6. Deploy

```bash
vercel deploy --prod
```

First deploy takes 1–2 minutes. When it's done you'll get a `*.vercel.app` URL — open it and sanity-check the homepage.

Then visit `/admin-login`, enter your `ADMIN_PASSWORD`, and try adding/importing a product. The first image upload exercises the Vercel Blob path end-to-end.

---

## 7. Wire up littlepupgoodies.com

In the project's **Settings → Domains**:

1. Click **Add** → enter `littlepupgoodies.com`
2. Vercel will show you the DNS records to set (an `A` record to `76.76.21.21` for the apex, and a `CNAME` for `www`)
3. Set those records at your domain registrar
4. Vercel auto-provisions an SSL cert once DNS propagates (usually <5 min)

Add `www.littlepupgoodies.com` as well and pick which one redirects to which (Vercel offers a toggle).

---

## Recurring workflow

- **Deploy preview** → push a branch / `vercel deploy`
- **Deploy production** → `vercel deploy --prod`
- **Schema change** → edit `shared/schema.ts`, run `npm run db:push` against `DATABASE_URL`
- **Logs** → `vercel logs <deployment-url>` or the dashboard's Functions tab

---

## What changed in the codebase

For your own reference, the migration touched:

- **`api/index.ts`** — new Vercel function entrypoint; wraps the Express app and caches it across invocations (Fluid Compute reuse).
- **`server/app.ts`** — new factory that builds the Express app without `listen()` / Vite middleware, so the same app object serves both `npm run dev` and Vercel.
- **`server/index.ts`** — now a thin local-dev entrypoint (createApp → vite → listen).
- **`server/vercel-blob-adapter.ts`** — new storage backend; auto-selected when `BLOB_READ_WRITE_TOKEN` is present.
- **`server/storage-factory.ts`** — picks Local / Vercel Blob / Replit GCS based on env.
- **`server/routes.ts`** — `uploadToObjectStorage` uses a unified `putBuffer` method when the adapter supports it; Replit OIDC routes are skipped on Vercel.
- **`vercel.json`** — build command, static output dir, function config, rewrites for `/api/*`, `/objects/*`, and SPA fallback.
- **`scripts/copy-attached-assets.mjs`** — post-`vite build` step that copies `attached_assets/` into `dist/public/` so they're served as static.
- **`package.json`** — adds `@vercel/blob` and a `vercel-build` script.

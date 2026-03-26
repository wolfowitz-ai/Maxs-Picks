# How to Run Max's Top Picks Locally

This guide walks you through getting the full app — frontend, backend, and database — running on your own computer. No Replit account needed.

---

## What You'll Need

Before you start, make sure you have these installed:

1. **Node.js 18 or newer** — Download it from [nodejs.org](https://nodejs.org). This also installs `npm`, which manages the project's packages.
2. **Docker Desktop** (recommended) — Download from [docker.com](https://www.docker.com/products/docker-desktop/). This gives you a one-command database setup. If you'd rather use your own PostgreSQL installation, that works too — see the "Using Your Own PostgreSQL" section below.

---

## Step-by-Step Setup

### 1. Get the Code

Clone the repository and open the project folder:

```bash
git clone <your-repo-url>
cd maxs-top-picks
```

### 2. Install Dependencies

This downloads all the packages the app needs:

```bash
npm install
```

This may take a minute or two the first time.

### 3. Set Up Your Environment File

The app needs a few settings to run. Copy the template:

```bash
cp .env.example .env
```

The default `.env` is pre-configured to work with Docker — you don't need to change anything to get started. If you want to customize later, open `.env` in any text editor.

### 4. Start the Database

If you have Docker installed, start PostgreSQL with one command:

```bash
docker compose up -d
```

That's it — the database is now running in the background on your machine.

To check it's running: `docker compose ps`
To stop it later: `docker compose down`
To stop it and erase all data: `docker compose down -v`

### 5. Create the Database Tables

This sets up the tables the app needs (products, categories, etc.):

```bash
npm run db:push
```

### 6. Create the Uploads Folder

Product images are saved locally when running on your machine:

```bash
mkdir -p local-uploads/uploads
```

### 7. Start the App

```bash
npm run dev
```

You should see output like:
```
10:30:00 PM [express] serving on port 5000
```

### 8. Open the App

Go to **http://localhost:5000** in your browser. You should see the Max's Top Picks homepage.

---

## Using the Admin Panel

The admin panel is where you add, edit, and import products.

1. Go to **http://localhost:5000/admin-login**
2. Enter the password: **max123** (this is the default — you can change it in your `.env` file)
3. You're in! You can now:
   - Add products manually
   - Import products from Amazon URLs
   - Manage categories
   - Toggle featured products
   - Use AI to generate product descriptions (requires an OpenAI API key in `.env`)

---

## Optional Features

These features work out of the box but need API keys for full functionality. Add them to your `.env` file if you want them:

### AI-Generated Text
Set `OPENAI_API_KEY` to your OpenAI API key. This powers the "spin text" buttons in the admin panel that generate product titles, descriptions, and Max's Take reviews.

### Amazon Product Scraping
Set `SCRAPER_API_KEY` to a [ScraperAPI](https://www.scraperapi.com) key (free tier: 1,000 requests/month). This helps reliably scrape product data from Amazon URLs.

### Amazon Product Advertising API
For the official Amazon import method, you'll need:
- `AMAZON_ACCESS_KEY` — from Amazon Associates Central
- `AMAZON_SECRET_KEY` — from Amazon Associates Central  
- `AMAZON_PARTNER_TAG` — your Associates tracking ID (e.g., "maxtoppicks-20")

---

## Using Your Own PostgreSQL

If you prefer not to use Docker, just point the app at your existing PostgreSQL:

1. Create a database (e.g., `maxtoppicks`)
2. Open `.env` and update `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://youruser:yourpassword@localhost:5432/maxtoppicks
   ```
3. Run `npm run db:push` to create the tables
4. Continue from Step 6 above

---

## Quick Reference

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm start` | Run the production build |
| `npm run db:push` | Create/update database tables |
| `docker compose up -d` | Start the database |
| `docker compose down` | Stop the database |

| URL | What's There |
|-----|-------------|
| http://localhost:5000 | Main site |
| http://localhost:5000/admin-login | Admin login page |
| http://localhost:5000/admin | Admin dashboard |
| http://localhost:5000/products | Product catalog |

---

## How It Differs from Replit

When running locally, a few things work differently behind the scenes:

| Feature | On Replit | On Your Machine |
|---------|-----------|----------------|
| Product images | Stored in cloud (Google Cloud Storage) | Saved to `local-uploads/` folder |
| Admin login | Replit account login + password | Password only |
| Database | Managed by Replit | Docker or your own PostgreSQL |

The app detects its environment automatically — you don't need to toggle anything manually. The `LOCAL_STORAGE=true` setting in `.env` handles the switch.

---

## Troubleshooting

**"Cannot connect to database"**
- Make sure Docker is running: `docker compose ps`
- Or check that your `DATABASE_URL` in `.env` is correct

**"Port 5000 is already in use"**
- Change the `PORT` value in `.env` to something else (e.g., `3000`)

**Images not showing up**
- Make sure `local-uploads/uploads` directory exists
- Make sure `LOCAL_STORAGE=true` is set in `.env`

**"npm install" fails**
- Try deleting `node_modules` and running `npm install` again
- Make sure you're on Node.js 18+: `node -v`

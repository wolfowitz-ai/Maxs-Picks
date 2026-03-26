# Local Development Setup

Run Max's Top Picks on your own machine.

## Prerequisites

- **Node.js 18+** ([download](https://nodejs.org))
- **PostgreSQL 14+** (via Docker or installed locally)
- **npm** (included with Node.js)

## Quick Start

```bash
# 1. Clone and install
git clone <your-repo-url>
cd maxs-top-picks
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your database connection string

# 3. Start PostgreSQL (if using Docker)
docker compose up -d

# 4. Push database schema
npm run db:push

# 5. Create uploads directory
mkdir -p local-uploads/uploads

# 6. Start development server
npm run dev
```

Open **http://localhost:5000** in your browser.

## Or Use the Setup Script

```bash
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh
npm run dev
```

## Admin Panel

- Go to **http://localhost:5000/admin-login**
- Default password: `max123` (change via `ADMIN_PASSWORD` in `.env`)

## Environment Variables

See `.env.example` for all available settings. Key ones:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `LOCAL_STORAGE` | Yes (local) | Set to `true` for local file storage |
| `ADMIN_PASSWORD` | No | Admin panel password (default: `max123`) |
| `OPENAI_API_KEY` | No | For AI text generation features |
| `SCRAPER_API_KEY` | No | For Amazon product scraping |

## Image Storage

When `LOCAL_STORAGE=true`, images are saved to the `local-uploads/` directory instead of cloud Object Storage. This directory is git-ignored.

## Database

### Using Docker (recommended)

```bash
docker compose up -d    # Start PostgreSQL
docker compose down     # Stop PostgreSQL
```

Connection: `postgresql://postgres:postgres@localhost:5432/maxtoppicks`

### Using Existing PostgreSQL

Set `DATABASE_URL` in `.env` to your connection string.

## Build for Production

```bash
npm run build     # Builds frontend + backend
npm start         # Runs production build
```

## Differences from Replit

| Feature | Replit | Local |
|---------|--------|-------|
| Image storage | Google Cloud Object Storage | Local filesystem (`local-uploads/`) |
| Auth (admin) | Replit OIDC + password | Password only |
| Vite plugins | Includes Replit dev tools | Standard React/Vite only |
| Database | Managed PostgreSQL | Docker or local PostgreSQL |

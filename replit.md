# Max's Top Picks - Pet Product Recommendation Site

## Overview

A pet product recommendation website featuring "Max the Maltipoo" as the curator. The application allows visitors to browse Max's favorite pet products (toys, treats, gear, grooming) with affiliate links to Amazon. An admin panel enables product management including an Amazon product scraper for easy product imports.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS v4 with custom theme variables, shadcn/ui component library (New York style)
- **Animations**: Framer Motion for smooth UI transitions
- **Fonts**: Fredoka (headings) and DM Sans (body text) for a friendly, modern aesthetic

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx for development, esbuild for production
- **API Design**: RESTful endpoints under `/api/` prefix
- **Authentication**: Simple password-based admin auth using bcryptjs with Bearer token in localStorage

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` defines users and products tables
- **Migrations**: Drizzle Kit manages schema changes (`npm run db:push`)

### Key Features
- **Product Catalog**: CRUD operations for pet products with categories, ratings, reviews, and "Max's Take" personalized reviews
- **Amazon Scraper**: Admin tool using Cheerio to extract product data from Amazon URLs/ASINs
- **Category Filtering**: Products filterable by Toys, Treats, Gear, Grooming
- **Admin Panel**: Protected dashboard at `/admin` for product management

### Project Structure
```
client/           # React frontend (Vite)
  src/
    components/   # UI components including shadcn/ui
    pages/        # Route components (home, admin, admin-login)
    lib/          # Utilities, API hooks, auth context
    hooks/        # Custom React hooks
server/           # Express backend
  routes.ts       # API route definitions
  storage.ts      # Database operations via Drizzle
  scraper.ts      # Amazon product scraper
  auth.ts         # Admin authentication
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema
```

### Build System
- Development: Vite dev server with HMR for frontend, tsx for backend
- Production: Vite builds static assets to `dist/public`, esbuild bundles server to `dist/index.cjs`

## External Dependencies

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- Drizzle ORM with `drizzle-kit` for schema management

### Third-Party Services
- **Amazon**: Product scraping target (no official API, uses web scraping with axios/cheerio)
- **Google Fonts**: Fredoka and DM Sans font families

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `ADMIN_PASSWORD`: Admin panel password (optional, defaults to "max123" in development)

### Key NPM Packages
- `@tanstack/react-query`: Data fetching and caching
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `bcryptjs`: Password hashing for admin auth
- `cheerio` / `axios`: Amazon product scraping
- `framer-motion`: UI animations
- `wouter`: Client-side routing
- Full shadcn/ui component suite via Radix UI primitives
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
- **Featured Products**: Mark products as featured with a star toggle; featured products display in a dedicated section above the main catalog
- **Layout Settings**: Configurable grid layout with sliders to control items per row (2-6) and total items for both Featured and Curated sections (stored in localStorage)
- **Dual Amazon Import System**:
  - **PA-API Method**: Official Amazon Product Advertising API integration (requires Amazon Associates credentials)
  - **Scraper Method**: Web scraping fallback using Cheerio with optional ScraperAPI proxy for reliability
- **Import Staging**: Review and edit scraped product data before saving to catalog
- **Category Management**: Full CRUD for product categories
- **Category Filtering**: Products filterable by Toys, Treats, Gear, Grooming
- **Admin Panel**: Protected dashboard at `/admin` for product management with mobile-responsive design

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
  scraper.ts      # Amazon web scraper with ScraperAPI fallback
  amazon-api.ts   # Amazon PA-API integration
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
- **Amazon Product Advertising API**: Official API for product data (requires Amazon Associates account)
- **ScraperAPI**: Optional proxy service for reliable web scraping when direct requests are blocked
- **Google Fonts**: Fredoka and DM Sans font families

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `ADMIN_PASSWORD`: Admin panel password (optional, defaults to "max123" in development)

#### Amazon PA-API Import (Optional)
- `AMAZON_ACCESS_KEY`: Amazon PA-API access key from Associates Central
- `AMAZON_SECRET_KEY`: Amazon PA-API secret key  
- `AMAZON_PARTNER_TAG`: Your Amazon Associates tracking ID (e.g., "maxtoppicks-20")

**How to get PA-API credentials:**
1. Join the Amazon Associates program at your marketplace (e.g., affiliate-program.amazon.com)
2. Get approved (requires an active website/app)
3. Go to Associates Central → Tools → Product Advertising API
4. Generate your Access Key and Secret Key
5. Your Partner Tag is your Store/Tracking ID (e.g., "yourstore-20")

**Supported Marketplaces:** US, CA, UK, DE, FR, ES, IT, JP, AU, MX

#### Scraper Fallback (Optional)
- `SCRAPER_API_KEY`: ScraperAPI key for reliable scraping when direct requests fail (free tier: 1000 requests/month at scraperapi.com)

#### Local Image Storage
When importing products, the "Save image locally" toggle downloads Amazon images and stores them in `attached_assets/product_images/`. This protects against Amazon image URLs expiring or being blocked.

### Key NPM Packages
- `@tanstack/react-query`: Data fetching and caching
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `bcryptjs`: Password hashing for admin auth
- `cheerio` / `axios`: Amazon product scraping
- `framer-motion`: UI animations
- `wouter`: Client-side routing
- Full shadcn/ui component suite via Radix UI primitives
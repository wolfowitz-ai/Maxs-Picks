#!/bin/bash
set -e

echo "🐾 Max's Top Picks - Local Development Setup"
echo "============================================="
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required. Install from https://nodejs.org"; exit 1; }

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ is required. You have $(node -v)"
  exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  echo "📋 Creating .env from .env.example..."
  cp .env.example .env
  echo "✅ .env created - edit it with your settings"
else
  echo "✅ .env already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if Docker is available for PostgreSQL
if command -v docker >/dev/null 2>&1; then
  echo ""
  echo "🐘 Starting PostgreSQL with Docker..."
  docker compose up -d
  echo "✅ PostgreSQL running on localhost:5432"
  sleep 2
else
  echo ""
  echo "⚠️  Docker not found. Make sure PostgreSQL is running and DATABASE_URL is set in .env"
fi

# Create local-uploads directory
mkdir -p local-uploads/uploads
echo "✅ Local uploads directory created"

# Push database schema
echo ""
echo "📊 Setting up database schema..."
npm run db:push

echo ""
echo "============================================="
echo "✅ Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:5000"
echo "Admin panel: http://localhost:5000/admin-login"
echo "Default admin password: max123"
echo "============================================="

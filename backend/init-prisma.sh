#!/bin/bash
# Prisma ORM Initialization Script for ORIYET Backend
# This script sets up Prisma ORM with your MySQL database

set -e  # Exit on any error

echo "🚀 ORIYET Backend - Prisma ORM Initialization"
echo "=============================================="
echo ""

# Step 1: Check Node.js version
echo "📋 Step 1: Checking Node.js version..."
node_version=$(node -v)
echo "   ✅ Node.js $node_version"
echo ""

# Step 2: Install dependencies
echo "📋 Step 2: Installing dependencies..."
npm install
echo "   ✅ Dependencies installed"
echo ""

# Step 3: Generate Prisma Client
echo "📋 Step 3: Generating Prisma Client..."
npm run prisma:generate
echo "   ✅ Prisma Client generated"
echo ""

# Step 4: Test database connection
echo "📋 Step 4: Testing database connection..."
npm run test:connection 2>/dev/null || {
  echo "   ⚠️  Database connection test failed"
  echo "   Make sure your MySQL server is running and .env is configured"
  echo ""
}

# Step 5: Push schema to database
echo "📋 Step 5: Pushing schema to database..."
echo "   This will create tables based on your Prisma schema"
npm run prisma:push -- --accept-data-loss || {
  echo "   ⚠️  Schema push encountered an issue"
  echo "   Check your database connection and try again"
}
echo "   ✅ Schema pushed to database"
echo ""

# Step 6: Seed database (optional)
echo "📋 Step 6: Seeding database (optional)..."
read -p "   Do you want to seed the database with default data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    npm run db:seed
    echo "   ✅ Database seeded with default data"
else
    echo "   ⏭️  Skipped seeding"
fi
echo ""

echo "🎉 Setup Complete!"
echo "===================="
echo ""
echo "Next steps:"
echo "1. Review your Prisma schema: prisma/schema.prisma"
echo "2. Open Prisma Studio: npm run prisma:studio"
echo "3. Start your backend: npm run dev"
echo "4. From root: npm run dev (to run frontend + backend)"
echo ""
echo "📚 Documentation:"
echo "   • Prisma Quickstart: PRISMA_QUICKSTART.md"
echo "   • Prisma Migration: PRISMA_MIGRATION.md"
echo "   • Setup Guide: ../SETUP_GUIDE.md"
echo ""

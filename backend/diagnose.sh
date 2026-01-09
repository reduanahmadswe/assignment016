#!/bin/bash

# Prisma ORM Diagnostic and Troubleshooting Script

echo "🔍 ORIYET Backend - Prisma ORM Diagnostics"
echo "==========================================="
echo ""

echo "📋 Environment Check:"
echo "-------------------"

# Check Node.js
echo "Node.js Version: $(node -v)"
echo "npm Version: $(npm -v)"
echo ""

# Check Prisma
echo "Prisma Version:"
npx prisma --version 2>/dev/null || echo "❌ Prisma not installed"
echo ""

# Check .env file
echo "📋 Environment Variables:"
echo "------------------------"
if [ -f .env ]; then
    echo "✅ .env file exists"
    echo ""
    echo "Database Configuration:"
    grep "DATABASE" .env || echo "No DATABASE variables found"
    echo ""
else
    echo "❌ .env file not found"
fi
echo ""

# Check Prisma files
echo "📋 Prisma Files:"
echo "----------------"
echo "prisma/schema.prisma: $([ -f prisma/schema.prisma ] && echo '✅ Exists' || echo '❌ Missing')"
echo "prisma.config.ts: $([ -f prisma.config.ts ] && echo '✅ Exists' || echo '❌ Missing')"
echo "prisma/seed.ts: $([ -f prisma/seed.ts ] && echo '✅ Exists' || echo '❌ Missing')"
echo "generated/prisma/: $([ -d generated/prisma ] && echo '✅ Exists' || echo '❌ Missing')"
echo ""

# Validate schema
echo "📋 Schema Validation:"
echo "--------------------"
npx prisma validate 2>&1 | tail -3
echo ""

# Test connection
echo "📋 Database Connection:"
echo "---------------------"
echo "Testing connection to MySQL database..."
echo "(This may take a moment...)"
echo ""

# Try to connect using Prisma
timeout 5 npx prisma db execute --stdin < /dev/null 2>&1 && \
  echo "✅ Database connection successful!" || \
  echo "❌ Database connection failed"

echo ""
echo "🔧 Troubleshooting Tips:"
echo "------------------------"
echo "1. Verify DATABASE_URL in .env is correct"
echo "2. Check if MySQL server is running and accessible"
echo "3. Verify firewall/network settings allow connection"
echo "4. Test connection with: mysql -h <host> -u <user> -p"
echo "5. Check database credentials are correct"
echo ""

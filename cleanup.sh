#!/bin/bash

# Complete cleanup script for Next.js project

echo "🧹 Starting complete cleanup..."

# Kill all Next.js processes
echo "1. Killing all Next.js processes..."
pkill -f "next dev" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Remove all build artifacts
echo "2. Removing build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc

# Clear npm cache
echo "3. Clearing npm cache..."
npm cache clean --force

# Reinstall dependencies
echo "4. Reinstalling dependencies..."
rm -rf node_modules
npm install

echo "✅ Cleanup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Close ALL browser tabs for localhost:3000"
echo "2. Clear browser cache (Cmd+Shift+Delete on Mac)"
echo "3. Open Chrome DevTools (F12)"
echo "4. Go to Application tab → Storage → Clear site data"
echo "5. Run: npm run dev"
echo "6. Open in INCOGNITO/PRIVATE window: http://localhost:3000/login"

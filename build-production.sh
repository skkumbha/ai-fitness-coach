#!/bin/bash

# Production Build Script for FitCoach AI Frontend
echo "🚀 Building FitCoach AI for Production..."

# Set production environment
export NODE_ENV=production
export VITE_APP_ENVIRONMENT=production
export VITE_ENABLE_DEBUG=false
export VITE_ENABLE_LOGGING=false

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf .vite/

# Install dependencies (if needed)
echo "📦 Installing dependencies..."
npm ci --production=false

# Run production build
echo "🔨 Building production bundle..."
npm run build

# Check build success
if [ $? -eq 0 ]; then
    echo "✅ Production build completed successfully!"
    echo "📁 Build output: dist/"
    echo "📊 Build size:"
    du -sh dist/
    
    # List build files
    echo "📋 Build contents:"
    ls -la dist/
    
    echo ""
    echo "🎯 Ready for production deployment!"
    echo "💡 Next steps:"
    echo "   1. Test the build locally: npm run preview"
    echo "   2. Deploy to staging: ./deploy-staging.sh"
    echo "   3. Deploy to production: ./deploy-production.sh"
else
    echo "❌ Production build failed!"
    exit 1
fi

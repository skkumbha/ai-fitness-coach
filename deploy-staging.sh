#!/bin/bash

# Staging Deployment Script for FitCoach AI Frontend
echo "🚀 Deploying FitCoach AI to Staging..."

# Configuration
STAGING_SERVER="fit.kish.rs"
STAGING_PATH="/var/www/staging.fitcoach.ai"
STAGING_USER="root"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if build exists
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ No build found! Run build-production.sh first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Staging Deployment Details:${NC}"
echo "   Server: $STAGING_SERVER"
echo "   Path: $STAGING_PATH"
echo "   User: $STAGING_USER"
echo ""

# Confirm deployment
read -p "🤔 Proceed with staging deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

echo -e "${YELLOW}🚀 Starting staging deployment...${NC}"

# Create staging directory on server
echo "📁 Creating staging directory..."
ssh $STAGING_USER@$STAGING_SERVER "mkdir -p $STAGING_PATH"

# Copy build files to staging
echo "📤 Uploading build files..."
scp -r dist/* $STAGING_USER@$STAGING_SERVER:$STAGING_PATH/

# Set proper permissions
echo "🔐 Setting permissions..."
ssh $STAGING_USER@$STAGING_SERVER "chown -R www-data:www-data $STAGING_PATH && chmod -R 755 $STAGING_PATH"

# Test staging deployment
echo "🧪 Testing staging deployment..."
if curl -s -o /dev/null -w "%{http_code}" "https://staging.fitcoach.ai" | grep -q "200"; then
    echo -e "${GREEN}✅ Staging deployment successful!${NC}"
    echo ""
    echo "🌐 Staging URL: https://staging.fitcoach.ai"
    echo "💡 Test the application thoroughly before production deployment."
    echo ""
    echo "📋 Testing checklist:"
    echo "   ☐ User registration and login"
    echo "   ☐ Onboarding flow"
    echo "   ☐ Chat functionality"
    echo "   ☐ WebSocket connections"
    echo "   ☐ Message sending/receiving"
    echo "   ☐ Typing indicators"
    echo "   ☐ Mobile responsiveness"
    echo "   ☐ Error handling"
    echo ""
    echo "🚀 Ready for production deployment when testing is complete!"
else
    echo -e "${RED}❌ Staging deployment failed! Check server logs.${NC}"
    exit 1
fi

#!/bin/bash

# Production Deployment Script for FitCoach AI Frontend
echo "🚀 Deploying FitCoach AI to Production..."

# Configuration
PRODUCTION_SERVER="fit.kish.rs"
PRODUCTION_PATH="/var/www/fit.kish.rs"
PRODUCTION_USER="root"

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

echo -e "${YELLOW}📋 Production Deployment Details:${NC}"
echo "   Server: $PRODUCTION_SERVER"
echo "   Path: $PRODUCTION_PATH"
echo "   User: $PRODUCTION_USER"
echo ""

# Confirm deployment
echo -e "${RED}⚠️  WARNING: This will deploy to PRODUCTION!${NC}"
read -p "🤔 Are you absolutely sure? Type 'PRODUCTION' to confirm: " -r
if [[ ! $REPLY == "PRODUCTION" ]]; then
    echo "❌ Production deployment cancelled."
    exit 1
fi

echo -e "${YELLOW}🚀 Starting production deployment...${NC}"

# Create backup of current production
echo "💾 Creating backup of current production..."
ssh $PRODUCTION_USER@$PRODUCTION_SERVER "cp -r $PRODUCTION_PATH ${PRODUCTION_PATH}.backup.$(date +%Y%m%d_%H%M%S)"

# Create production directory
echo "📁 Creating production directory..."
ssh $PRODUCTION_USER@$PRODUCTION_SERVER "mkdir -p $PRODUCTION_PATH"

# Copy build files to production
echo "📤 Uploading build files..."
scp -r dist/* $PRODUCTION_USER@$PRODUCTION_SERVER:$PRODUCTION_PATH/

# Set proper permissions
echo "🔐 Setting permissions..."
ssh $PRODUCTION_USER@$PRODUCTION_SERVER "chown -R www-data:www-data $PRODUCTION_PATH && chmod -R 755 $PRODUCTION_PATH"

# Test production deployment
echo "🧪 Testing production deployment..."
if curl -s -o /dev/null -w "%{http_code}" "https://fit.kish.rs" | grep -q "200"; then
    echo -e "${GREEN}✅ Production deployment successful!${NC}"
    echo ""
    echo "🌐 Production URL: https://fit.kish.rs"
    echo "🎉 FitCoach AI is now live in production!"
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "   ☐ Monitor application logs"
    echo "   ☐ Check WebSocket connections"
    echo "   ☐ Verify user registration/login"
    echo "   ☐ Test chat functionality"
    echo "   ☐ Monitor error rates"
    echo "   ☐ Check performance metrics"
    echo ""
    echo "🔍 Monitoring commands:"
    echo "   ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'tail -f /var/log/nginx/access.log'"
    echo "   ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'tail -f /var/log/nginx/error.log'"
    echo "   ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'docker logs -f ai-fitness-coach-backend'"
    echo ""
    echo "🎯 Deployment completed successfully!"
else
    echo -e "${RED}❌ Production deployment failed! Rolling back...${NC}"
    
    # Rollback to backup
    echo "🔄 Rolling back to previous version..."
    ssh $PRODUCTION_USER@$PRODUCTION_SERVER "rm -rf $PRODUCTION_PATH && mv ${PRODUCTION_PATH}.backup.* $PRODUCTION_PATH"
    
    echo -e "${RED}❌ Rollback completed. Check server logs and try again.${NC}"
    exit 1
fi

#!/bin/bash

echo "🚀 Building and deploying Fitness Coach Frontend with onboarding fix..."

# Configuration
FRONTEND_IMAGE="sreeramkumbham/fitness-assistant-frontend"
VERSION=$(date +%Y%m%d-%H%M%S)
LATEST_TAG="${FRONTEND_IMAGE}:latest"
VERSION_TAG="${FRONTEND_IMAGE}:v${VERSION}"

# Step 1: Build Docker image for linux/amd64
echo "📦 Building Docker image for linux/amd64..."
docker buildx build --platform linux/amd64 --build-arg VITE_API_URL=http://fit.kish.rs/api -t $LATEST_TAG -t $VERSION_TAG --push .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Frontend image built and pushed successfully!"
echo "📦 Image tags: $LATEST_TAG, $VERSION_TAG"
echo ""
echo "🔧 Next steps on your server:"
echo "1. SSH to your server: ssh root@149.28.92.140"
echo "2. Run these commands:"
echo "   docker stop fa-f"
echo "   docker rm fa-f"
echo "   docker pull $LATEST_TAG"
echo "   docker run -d -p 8080:80 --name fa-f $LATEST_TAG"
echo "   sudo systemctl reload nginx"
echo ""
echo "🌐 Your frontend should then be available at: http://fit.kish.rs"
echo "🔧 The onboarding form freezing issue should be fixed!" 
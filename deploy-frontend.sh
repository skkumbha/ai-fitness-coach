#!/bin/bash

echo "🚀 Building and deploying Fitness Coach Frontend..."

# Step 1: Build Docker image with correct API URL
echo "📦 Building Docker image..."

# Build specifically for linux/amd64 to match the server architecture
docker buildx build --platform linux/amd64 --build-arg VITE_API_URL=http://fit.kish.rs/api -t sreeramkumbham/fitness-assistant-frontend:latest --push .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Frontend image built and pushed successfully!"
echo ""
echo "🔧 Next steps on your server:"
echo "1. SSH to your server: ssh root@149.28.92.140"
echo "2. Run these commands:"
echo "   docker stop fa-f"
echo "   docker rm fa-f"
echo "   docker pull sreeramkumbham/fitness-assistant-frontend:latest"
echo "   docker run -d -p 8080:80 --name fa-f sreeramkumbham/fitness-assistant-frontend:latest"
echo "   sudo systemctl reload nginx"
echo ""
echo "🌐 Your frontend should then be available at: http://fit.kish.rs" 
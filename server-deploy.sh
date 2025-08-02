#!/bin/bash

echo "🚀 Updating Fitness Coach Frontend on server..."

# Configuration
CONTAINER_NAME="fa-f"
IMAGE_NAME="sreeramkumbham/fitness-assistant-frontend:latest"

# Step 1: Stop and remove existing container
echo "🛑 Stopping existing container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Step 2: Pull latest image
echo "📦 Pulling latest Docker image..."
docker rmi $IMAGE_NAME 2>/dev/null || true
docker pull $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull Docker image"
    exit 1
fi

# Step 3: Run new container
echo "🐳 Starting new container..."
docker run -d -p 8080:80 --name $CONTAINER_NAME $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo "❌ Failed to start container"
    exit 1
fi

# Step 4: Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

# Step 5: Check status
echo "📊 Checking deployment status..."
echo "Container status:"
docker ps | grep $CONTAINER_NAME

echo "Nginx status:"
sudo systemctl status nginx --no-pager -l

echo "✅ Frontend deployment completed!"
echo "🌐 Your application should be available at: http://fit.kish.rs" 
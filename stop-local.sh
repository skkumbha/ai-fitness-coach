#!/bin/bash

echo "🛑 Stopping local Fitness Coach Frontend..."

# Configuration
CONTAINER_NAME="fitness-coach-local"
IMAGE_NAME="fitness-coach-frontend-local"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

# Step 1: Stop container
print_status "🛑 Stopping container..."
docker stop $CONTAINER_NAME 2>/dev/null || true

# Step 2: Remove container
print_status "🗑️  Removing container..."
docker rm $CONTAINER_NAME 2>/dev/null || true

# Step 3: Check if user wants to remove image too
echo ""
read -p "Do you want to remove the local Docker image as well? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "🗑️  Removing local image..."
    docker rmi $IMAGE_NAME 2>/dev/null || true
    print_success "✅ Local image removed!"
fi

print_success "✅ Local development environment cleaned up!"
echo ""
echo "📋 Container and image status:"
docker ps -a | grep $CONTAINER_NAME || echo "   No containers found"
docker images | grep $IMAGE_NAME || echo "   No images found" 
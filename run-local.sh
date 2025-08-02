#!/bin/bash

echo "🚀 Building and running Fitness Coach Frontend locally..."

# Configuration
IMAGE_NAME="fitness-coach-frontend-local"
CONTAINER_NAME="fa-f"
LOCAL_PORT="3000"

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

print_error() {
    echo -e "${RED}$1${NC}"
}

# Step 1: Stop and remove existing container if running
print_status "🛑 Stopping existing container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# Step 2: Remove existing image if exists
print_status "🗑️  Removing existing local image..."
docker rmi $IMAGE_NAME 2>/dev/null || true

# Step 3: Build Docker image locally
print_status "📦 Building Docker image locally..."
docker build --build-arg VITE_API_URL=http://localhost:8080/api -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    print_error "❌ Docker build failed"
    exit 1
fi

print_success "✅ Docker image built successfully!"

# Step 4: Run the container
print_status "🐳 Starting container..."
docker run -d -p $LOCAL_PORT:80 --name $CONTAINER_NAME $IMAGE_NAME

if [ $? -ne 0 ]; then
    print_error "❌ Failed to start container"
    exit 1
fi

# Step 5: Check container status
print_status "📊 Checking container status..."
if docker ps | grep -q $CONTAINER_NAME; then
    print_success "✅ Container is running!"
else
    print_error "❌ Container failed to start"
    exit 1
fi

# Step 6: Show container logs
print_status "📋 Container logs:"
docker logs $CONTAINER_NAME

# Step 7: Show access information
echo ""
print_success "🎉 Local development server is ready!"
echo ""
echo "🌐 Access your application at:"
echo "   Frontend: http://localhost:$LOCAL_PORT"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker logs -f $CONTAINER_NAME"
echo "   Stop container: docker stop $CONTAINER_NAME"
echo "   Remove container: docker rm $CONTAINER_NAME"
echo "   Remove image: docker rmi $IMAGE_NAME"
echo ""
print_warning "💡 Note: This is using localhost:8080/api for backend calls"
print_warning "   Make sure your backend is running on port 8080"
echo ""
print_success "🚀 Happy coding!" 
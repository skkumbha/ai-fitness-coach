#!/bin/bash

echo "🛑 Stopping and cleaning up Fitness Coach Frontend containers..."

# Configuration - handle both old and new container names
OLD_CONTAINER_NAME="fa-f"
NEW_CONTAINER_NAME="fa-f-dev"
OLD_IMAGE_NAME="fitness-coach-frontend-local"
NEW_IMAGE_NAME="fitness-coach-frontend-dev"

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

# Function to stop and remove container
stop_container() {
    local container_name=$1
    local image_name=$2
    
    if docker ps -a | grep -q "$container_name"; then
        print_status "🛑 Stopping container: $container_name"
        docker stop "$container_name" 2>/dev/null || true
        
        print_status "🗑️  Removing container: $container_name"
        docker rm "$container_name" 2>/dev/null || true
        
        print_success "✅ Container $container_name stopped and removed"
        
        # Optionally remove the image
        if [ "$3" = "remove-image" ]; then
            if docker images | grep -q "$image_name"; then
                print_status "🗑️  Removing image: $image_name"
                docker rmi "$image_name" 2>/dev/null || true
                print_success "✅ Image $image_name removed"
            fi
        fi
    else
        print_warning "⚠️  Container $container_name not found"
    fi
}

# Stop and remove both old and new containers
stop_container "$OLD_CONTAINER_NAME" "$OLD_IMAGE_NAME"
stop_container "$NEW_CONTAINER_NAME" "$NEW_IMAGE_NAME"

echo ""
print_success "🎉 Cleanup completed!"
echo ""
echo "📋 Remaining containers:"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(fa-f|fitness-coach)" || echo "   No fitness coach containers found"
echo ""
echo "📋 Remaining images:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep -E "(fitness-coach)" || echo "   No fitness coach images found"
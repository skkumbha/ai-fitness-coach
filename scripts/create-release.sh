#!/bin/bash

# Script to create a new release with git tag and push to trigger Docker build

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to validate semantic versioning
validate_version() {
    local version=$1
    if [[ ! $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_error "❌ Invalid version format. Use semantic versioning (e.g., 1.0.0, 2.1.3)"
        exit 1
    fi
}

# Function to check if tag already exists
check_tag_exists() {
    local version=$1
    if git tag -l | grep -q "^v$version$"; then
        print_error "❌ Tag v$version already exists!"
        exit 1
    fi
}

# Function to check if working directory is clean
check_clean_working_dir() {
    if [[ -n $(git status --porcelain) ]]; then
        print_warning "⚠️  Working directory is not clean. You have uncommitted changes."
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "❌ Release cancelled"
            exit 1
        fi
    fi
}

# Function to update version in package.json (optional)
update_package_version() {
    local version=$1
    if [[ -f "package.json" ]]; then
        print_status "📦 Updating package.json version..."
        npm version $version --no-git-tag-version
        print_success "✅ Updated package.json to version $version"
    fi
}

# Main script
main() {
    print_status "🚀 Fitness Coach Frontend Release Creator"
    echo ""
    
    # Check if we're in a git repository
    if [[ ! -d ".git" ]]; then
        print_error "❌ Not in a git repository!"
        exit 1
    fi
    
    # Check if we're on main branch
    current_branch=$(git branch --show-current)
    if [[ "$current_branch" != "main" ]]; then
        print_warning "⚠️  You're not on the main branch (currently on $current_branch)"
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "❌ Release cancelled"
            exit 1
        fi
    fi
    
    # Get version from user
    if [[ $# -eq 1 ]]; then
        VERSION=$1
    else
        echo "Enter the version number (e.g., 1.0.0, 2.1.3):"
        read -p "Version: " VERSION
    fi
    
    # Validate version
    validate_version "$VERSION"
    
    # Check if tag exists
    check_tag_exists "$VERSION"
    
    # Check working directory
    check_clean_working_dir
    
    # Update package.json version
    update_package_version "$VERSION"
    
    # Create commit for version update (if package.json was updated)
    if [[ -f "package.json" ]] && [[ -n $(git status --porcelain) ]]; then
        print_status "📝 Committing version update..."
        git add package.json
        git commit -m "chore: bump version to $VERSION"
        print_success "✅ Committed version update"
    fi
    
    # Create and push tag
    print_status "🏷️  Creating git tag v$VERSION..."
    git tag -a "v$VERSION" -m "Release v$VERSION"
    print_success "✅ Created tag v$VERSION"
    
    # Push changes
    print_status "📤 Pushing changes and tag..."
    git push origin main
    git push origin "v$VERSION"
    print_success "✅ Pushed changes and tag"
    
    echo ""
    print_success "🎉 Release v$VERSION created successfully!"
    echo ""
    print_status "📋 What happens next:"
    echo "   1. GitHub Actions will automatically build the Docker image"
    echo "   2. Image will be pushed to Docker Hub as: sreeramkumbham/fitness-assistant-frontend:v$VERSION"
    echo "   3. A GitHub release will be created with deployment instructions"
    echo ""
    print_status "🔗 Monitor the build:"
    echo "   https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/')/actions"
    echo ""
    print_warning "💡 To deploy on your server:"
    echo "   docker pull sreeramkumbham/fitness-assistant-frontend:v$VERSION"
    echo "   docker stop fa-f && docker rm fa-f"
    echo "   docker run -d -p 8080:80 --name fa-f sreeramkumbham/fitness-assistant-frontend:v$VERSION"
    echo "   sudo systemctl reload nginx"
}

# Run main function with all arguments
main "$@" 
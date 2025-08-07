# 🚀 Release Process with Git Tags

This document explains how to create releases using git tags and GitHub Actions for automated Docker image building.

## 📋 Overview

When you create a git tag (e.g., `v1.0.0`), GitHub Actions automatically:
1. Builds a Docker image from the main branch
2. Pushes it to Docker Hub with the version tag
3. Creates a GitHub release with deployment instructions

## 🏷️ Git Tags Benefits

- **Version Tracking**: Each release has a specific version (v1.0.0, v1.1.0, etc.)
- **Rollback Capability**: You can easily rollback to any previous version
- **Release History**: Clear history of all releases with changelogs
- **Automated Builds**: No manual Docker building required
- **Deployment Safety**: Test specific versions before deploying

## 🛠️ Setup Required

### 1. GitHub Secrets
Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
DOCKERHUB_USERNAME=sreeramkumbham
DOCKERHUB_TOKEN=your_dockerhub_access_token
```

### 2. Docker Hub Access Token
1. Go to Docker Hub → Account Settings → Security
2. Create a new access token
3. Copy the token to your GitHub secrets

## 🚀 Creating a Release

### Option 1: Using the Release Script (Recommended)

```bash
# Make sure you're on the main branch
git checkout main

# Run the release script
./scripts/create-release.sh

# Or specify version directly
./scripts/create-release.sh 1.0.0
```

### Option 2: Manual Process

```bash
# 1. Ensure you're on main branch
git checkout main

# 2. Update version in package.json (optional)
npm version 1.0.0 --no-git-tag-version

# 3. Commit changes
git add package.json
git commit -m "chore: bump version to 1.0.0"

# 4. Create and push tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main
git push origin v1.0.0
```

## 📦 What Happens After Tagging

1. **GitHub Actions Trigger**: Workflow starts automatically
2. **Docker Build**: Image built with your code
3. **Docker Push**: Image pushed to Docker Hub with tags:
   - `sreeramkumbham/fitness-assistant-frontend:v1.0.0`
   - `sreeramkumbham/fitness-assistant-frontend:latest`
4. **GitHub Release**: Release created with deployment instructions

## 🚀 Deployment

### Quick Deployment
```bash
# Pull the new image
docker pull sreeramkumbham/fitness-assistant-frontend:v1.0.0

# Update container
docker stop fa-f
docker rm fa-f
docker run -d -p 8080:80 --name fa-f sreeramkumbham/fitness-assistant-frontend:v1.0.0

# Reload nginx
sudo systemctl reload nginx
```

### Rollback to Previous Version
```bash
# If you need to rollback to v1.0.0
docker pull sreeramkumbham/fitness-assistant-frontend:v1.0.0
docker stop fa-f
docker rm fa-f
docker run -d -p 8080:80 --name fa-f sreeramkumbham/fitness-assistant-frontend:v1.0.0
sudo systemctl reload nginx
```

## 📋 Versioning Strategy

### Semantic Versioning (Recommended)
- **MAJOR.MINOR.PATCH** (e.g., 1.0.0, 1.1.0, 1.1.1)
- **MAJOR**: Breaking changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Examples
- `v1.0.0` - Initial release
- `v1.1.0` - Added new features
- `v1.1.1` - Bug fix
- `v2.0.0` - Breaking changes

## 🔍 Monitoring

### Check Build Status
- Go to your GitHub repository → Actions tab
- Monitor the "Build and Push Docker Image" workflow

### Check Docker Hub
- Visit: https://hub.docker.com/r/sreeramkumbham/fitness-assistant-frontend
- Verify new tags are available

### Check GitHub Releases
- Go to your GitHub repository → Releases
- See all releases with deployment instructions

## 🛠️ Troubleshooting

### Build Fails
1. Check GitHub Actions logs
2. Verify Docker Hub credentials
3. Ensure code builds locally first

### Tag Already Exists
```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin --delete v1.0.0

# Create new tag
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

### Manual Workflow Trigger
1. Go to GitHub repository → Actions
2. Select "Build and Push Docker Image"
3. Click "Run workflow"
4. Choose branch and run

## 📝 Best Practices

1. **Always test locally** before creating a release
2. **Use semantic versioning** for clear version history
3. **Write meaningful commit messages** before tagging
4. **Test the deployed version** after release
5. **Keep release notes updated** in GitHub releases

## 🔗 Useful Commands

```bash
# List all tags
git tag -l

# See tag details
git show v1.0.0

# Delete a tag
git tag -d v1.0.0
git push origin --delete v1.0.0

# Check current version
npm version

# Build locally to test
docker build -t test-image .
docker run -p 3000:80 test-image
``` 
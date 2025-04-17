#!/bin/bash

# Check if GitHub token is provided
if [ -z "$1" ]; then
  echo "Usage: ./push-to-github.sh YOUR_GITHUB_TOKEN"
  exit 1
fi

# Set up Git configuration
git config --global credential.helper store
echo "https://skkumbha:$1@github.com" > ~/.git-credentials

# Commit any changes (just in case)
git add .
git commit -m "Initial commit from Replit" || echo "No changes to commit"

# Push to GitHub
git push -u origin main

echo "Code pushed to GitHub successfully!"
#!/bin/bash

# Login with GitHub token
echo "$GITHUB_TOKEN" | gh auth login --with-token

# Configure git
git config --global user.name "Replit User"
git config --global user.email "user@example.com"

# Add all files
git add .

# Commit
git commit -m "Initial commit from Replit"

# Push to GitHub
gh repo set-default skkumbha/ai-fitness-coach
git push -u origin main

echo "Code pushed to GitHub successfully!"
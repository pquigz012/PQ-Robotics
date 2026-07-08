#!/bin/bash

REPO="/home/pquigley/P&Q/PQ-Robotics"
SRC="$HOME/Downloads/index.html"

# Check source file exists
if [ ! -f "$SRC" ]; then
  echo "❌ No index.html found in ~/Downloads"
  exit 1
fi

# Copy file
cp "$SRC" "$REPO/index.html"
echo "✅ Copied index.html to repo"

# Prompt for commit message
echo ""
read -p "What is this for? " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
  echo "❌ Commit message cannot be empty"
  exit 1
fi

cd "$REPO"

# Stage and commit first
git add index.html
git commit -m "$COMMIT_MSG"

# Stash any other unstaged changes, rebase, then pop
git stash
git pull --rebase
git stash pop

git push

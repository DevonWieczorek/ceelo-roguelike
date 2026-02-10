#!/bin/bash

# Cee-Lo Roguelike - GitHub Setup Script
# This script will help you push the project to GitHub

set -e  # Exit on error

echo "🎲 Cee-Lo Roguelike - GitHub Setup"
echo "=================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    echo "   Visit: https://git-scm.com/downloads"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "   Please run this script from the ceelo-roguelike-app directory"
    exit 1
fi

echo "✅ In correct directory"
echo ""

# Check if already a git repo
if [ -d ".git" ]; then
    echo "⚠️  Git repository already initialized"
    echo ""
else
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
    echo ""
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/
EOF
    echo "✅ .gitignore created"
    echo ""
fi

# Check if files are staged
if git diff --cached --quiet 2>/dev/null; then
    echo "📦 Staging files..."
    git add .
    echo "✅ Files staged"
    echo ""
fi

# Check if initial commit exists
if ! git log -1 &> /dev/null; then
    echo "💾 Creating initial commit..."
    git commit -m "Initial commit: Cee-Lo Roguelike modular React app

- Fully refactored from single file to modular architecture
- 39 separate files with modular CSS
- React 18 + Vite
- Custom hooks for game logic
- Screen components for each game state
- Reusable UI components
- Complete game documentation"
    echo "✅ Initial commit created"
    echo ""
else
    echo "✅ Commits already exist"
    echo ""
fi

# Check if remote exists
if git remote get-url origin &> /dev/null; then
    REMOTE_URL=$(git remote get-url origin)
    echo "✅ Remote 'origin' already configured: $REMOTE_URL"
    echo ""
    
    read -p "🚀 Push to remote? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push -u origin main
        echo ""
        echo "✅ Pushed to GitHub!"
    fi
else
    echo "📋 No remote repository configured yet."
    echo ""
    echo "Choose an option:"
    echo ""
    echo "1. Create repo via GitHub CLI (gh)"
    echo "2. Add existing GitHub repo URL"
    echo "3. Exit and create repo manually"
    echo ""
    read -p "Enter choice (1-3): " -n 1 -r
    echo ""
    echo ""
    
    case $REPLY in
        1)
            # Check if gh is installed
            if ! command -v gh &> /dev/null; then
                echo "❌ GitHub CLI (gh) is not installed"
                echo "   Install from: https://cli.github.com/"
                echo "   Or use option 2 to add repo URL manually"
                exit 1
            fi
            
            # Check if authenticated
            if ! gh auth status &> /dev/null; then
                echo "🔐 Authenticating with GitHub..."
                gh auth login
            fi
            
            echo "🚀 Creating GitHub repository..."
            read -p "Make repository public? (y/n) " -n 1 -r
            echo ""
            
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                gh repo create ceelo-roguelike --public --source=. --remote=origin --push
            else
                gh repo create ceelo-roguelike --private --source=. --remote=origin --push
            fi
            
            echo ""
            echo "✅ Repository created and code pushed!"
            echo "🌐 View your repo: https://github.com/$(gh api user --jq .login)/ceelo-roguelike"
            ;;
            
        2)
            echo "📝 Enter your GitHub repository URL"
            echo "   Format: https://github.com/USERNAME/REPO.git"
            echo "   Or: git@github.com:USERNAME/REPO.git"
            echo ""
            read -p "Repository URL: " REPO_URL
            
            if [ -z "$REPO_URL" ]; then
                echo "❌ No URL provided. Exiting."
                exit 1
            fi
            
            echo ""
            echo "🔗 Adding remote..."
            git remote add origin "$REPO_URL"
            
            echo "🚀 Pushing to GitHub..."
            git branch -M main
            git push -u origin main
            
            echo ""
            echo "✅ Code pushed to GitHub!"
            ;;
            
        3)
            echo "📋 Manual setup instructions:"
            echo ""
            echo "1. Go to: https://github.com/new"
            echo "2. Create repository named: ceelo-roguelike"
            echo "3. Don't initialize with README"
            echo "4. After creation, run these commands:"
            echo ""
            echo "   git remote add origin https://github.com/YOUR_USERNAME/ceelo-roguelike.git"
            echo "   git branch -M main"
            echo "   git push -u origin main"
            echo ""
            exit 0
            ;;
            
        *)
            echo "❌ Invalid choice. Exiting."
            exit 1
            ;;
    esac
fi

echo ""
echo "🎉 All done!"
echo ""
echo "Next steps:"
echo "  • Add a nice README badge for GitHub Actions (if using CI)"
echo "  • Set up GitHub Pages for live demo"
echo "  • Configure Dependabot for dependency updates"
echo "  • Add project description and topics on GitHub"
echo ""
echo "Happy coding! 🎲"

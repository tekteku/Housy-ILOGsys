#!/bin/bash
# Housy Tunisia - Git Configuration Script
# Run this in Git Bash

echo "🚀 Configuring Git for Housy Tunisia project..."
echo ""

# Prompt for user information
echo "Please enter your GitHub details:"
read -p "Your full name: " USER_NAME
read -p "Your GitHub email: " USER_EMAIL
read -p "Your GitHub username: " GITHUB_USERNAME

echo ""
echo "📝 Configuring Git with your details..."

# Configure Git globally
git config --global user.name "$USER_NAME"
git config --global user.email "$USER_EMAIL"
git config --global init.defaultBranch main
git config --global core.autocrlf true

echo "✅ Git configured successfully!"
echo ""

# Display current configuration
echo "📋 Current Git configuration:"
echo "Name: $(git config --global user.name)"
echo "Email: $(git config --global user.email)"
echo "Default branch: $(git config --global init.defaultBranch)"
echo ""

# Initialize repository
echo "🔧 Initializing Git repository..."
git init

# Create comprehensive .gitignore
echo "📝 Creating .gitignore file..."
cat > .gitignore << EOL
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json

# Environment files
.env
.env.local
.env.development
.env.production

# Build outputs
dist/
build/
.next/
out/

# Database files
*.sqlite
*.sqlite3
*.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
Desktop.ini

# IDE files
.vscode/settings.json
.idea/
*.swp
*.swo
*~

# Temporary files
tmp/
temp/
.cache/

# Redis dump files
dump.rdb

# Docker
.docker/

# VS Code
.vscode/
!.vscode/extensions.json

# Backup files
*.backup
*.bak
*.orig
EOL

echo "✅ .gitignore created"

# Create .env.example for security
echo "🔒 Creating .env.example file..."
cat > .env.example << EOL
# Housy Tunisia Environment Configuration
# Copy this file to .env and configure with your actual values

# Server Configuration
PORT=3000
NODE_ENV=development
HOST=localhost

# Database Configuration (PostgreSQL for Housy Tunisia)
DATABASE_URL=postgresql://username:password@localhost:5432/housy_tunisia
POSTGRES_DB=housy_tunisia
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# AI/LLM API Keys (configured for AI estimation features)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
QWEN_API_KEY=your_qwen_api_key

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Admin Configuration
ADMIN_EMAIL=admin@housy.tn
ADMIN_PASSWORD=secure_admin_password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info
EOL

echo "✅ .env.example created"

# Prompt for repository details
echo ""
echo "📁 GitHub Repository Setup"
echo "Do you want to:"
echo "1. Create a new repository on GitHub"
echo "2. Connect to an existing repository"
read -p "Enter choice (1 or 2): " REPO_CHOICE

if [ "$REPO_CHOICE" = "1" ]; then
    echo ""
    echo "🌐 Please create a new repository on GitHub:"
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: housy-tunisia (recommended)"
    echo "3. Description: Construction Management System for Tunisia"
    echo "4. Make it Public or Private (your choice)"
    echo "5. DON'T initialize with README, .gitignore, or license"
    echo "6. Click 'Create repository'"
    echo ""
    read -p "Enter the repository URL (git@github.com:username/repo.git): " REPO_URL
else
    read -p "Enter your existing repository URL: " REPO_URL
fi

# Add remote repository
echo "🔗 Adding remote repository..."
git remote add origin "$REPO_URL"

# Stage all files
echo "📦 Staging files for commit..."
git add .

# Create initial commit
echo "📝 Creating initial commit..."
git commit -m "Initial commit: Housy Tunisia Construction Management System

🏗️ Features:
- Complete PostgreSQL database schema (43 tables)
- Redis caching and session management  
- Express.js REST API backend
- React frontend with modern UI
- User authentication and authorization
- Project management system
- Material and supplier tracking
- Financial management (quotations, payments)
- Real-time notifications
- AI integration for estimations
- Docker development environment
- Comprehensive documentation

🚀 Ready for production deployment in Tunisia construction industry"

echo "✅ Initial commit created"

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your Housy Tunisia project is now on GitHub!"
    echo "🌐 Repository: $REPO_URL"
    echo ""
    echo "📋 Next steps:"
    echo "1. Visit your repository on GitHub"
    echo "2. Add a README.md if needed"
    echo "3. Set up branch protection rules"
    echo "4. Add collaborators if working in a team"
    echo "5. Create releases for deployment versions"
    echo ""
    echo "💡 To push future changes:"
    echo "   git add ."
    echo "   git commit -m 'Your commit message'"
    echo "   git push"
else
    echo ""
    echo "❌ Push failed. Common solutions:"
    echo "1. Check your repository URL is correct"
    echo "2. Ensure you have access to the repository"
    echo "3. Set up SSH key authentication"
    echo "4. Try: git push -u origin main --force (if safe to overwrite)"
fi

echo ""
echo "✅ Git setup completed!"
EOL

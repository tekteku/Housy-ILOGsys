# 🚀 **Git & GitHub Setup Guide for Housy Tunisia**

## 📋 **Step-by-Step Configuration**

### **Step 1: Configure Your Git Identity**

First, we need to set up your Git user information. Replace with your actual details:

```bash
# Set your name (replace with your actual name)
git config --global user.name "Your Name"

# Set your email (use the SAME email as your GitHub account)
git config --global user.email "your.email@example.com"

# Optional: Set default branch to main
git config --global init.defaultBranch main

# Optional: Configure line endings for Windows
git config --global core.autocrlf true
```

### **Step 2: Verify Your Configuration**

```bash
# Check your Git configuration
git config --global --list

# Check specifically your name and email
git config --global user.name
git config --global user.email
```

### **Step 3: Generate SSH Key (Recommended)**

For secure authentication with GitHub:

```bash
# Generate SSH key (replace email with your GitHub email)
ssh-keygen -t ed25519 -C "your.email@example.com"

# When prompted:
# - Press Enter to accept default file location
# - Enter a passphrase (optional but recommended)
# - Press Enter again to confirm

# Start SSH agent
eval "$(ssh-agent -s)"

# Add your SSH key to the agent
ssh-add ~/.ssh/id_ed25519

# Copy your public key to clipboard
cat ~/.ssh/id_ed25519.pub
```

### **Step 4: Add SSH Key to GitHub**

1. **Copy the SSH key output** from the previous command
2. **Go to GitHub.com** → **Settings** → **SSH and GPG keys**
3. **Click "New SSH key"**
4. **Paste your key** and give it a name
5. **Click "Add SSH key"**

### **Step 5: Test GitHub Connection**

```bash
# Test SSH connection to GitHub
ssh -T git@github.com

# You should see: "Hi username! You've successfully authenticated..."
```

## 🏗️ **Repository Setup for Housy**

### **Option A: Create New Repository on GitHub**

1. **Go to GitHub.com**
2. **Click "New repository"**
3. **Repository name**: `housy-tunisia` (or your preferred name)
4. **Description**: "Construction Management System for Tunisia"
5. **Public/Private**: Choose as needed
6. **DON'T initialize** with README (we have existing code)
7. **Click "Create repository"**

### **Option B: Use Existing Repository**

If you already have a repository, note down its URL:
- SSH format: `git@github.com:username/repository-name.git`
- HTTPS format: `https://github.com/username/repository-name.git`

## 📤 **Push Your Housy Project**

### **Initialize Git Repository**

```bash
# Initialize Git in your project directory
git init

# Add remote repository (replace with your actual repository URL)
git remote add origin git@github.com:username/housy-tunisia.git

# Or if using HTTPS:
git remote add origin https://github.com/username/housy-tunisia.git
```

### **Prepare Files for Commit**

```bash
# Create .gitignore file
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "dist/" >> .gitignore
echo "*.log" >> .gitignore
echo ".DS_Store" >> .gitignore
echo "Thumbs.db" >> .gitignore

# Add all files
git add .

# Check what will be committed
git status
```

### **Create Initial Commit**

```bash
# Create your first commit
git commit -m "Initial commit: Housy Tunisia Construction Management System

- Complete PostgreSQL database schema (43 tables)
- Redis caching and session management
- Express.js backend with authentication
- React frontend with modern UI
- Docker support for development
- Environment configuration
- Database migration scripts
- Testing utilities
- Documentation and guides"
```

### **Push to GitHub**

```bash
# Push to GitHub (first time)
git push -u origin main

# For subsequent pushes, just use:
git push
```

## 🔧 **Automated Setup Script**

Here's a script to automate the process:

```bash
#!/bin/bash
# Run this in Git Bash

echo "🚀 Setting up Housy Tunisia Git repository..."

# Get user information
read -p "Enter your name: " USER_NAME
read -p "Enter your GitHub email: " USER_EMAIL
read -p "Enter your GitHub repository URL: " REPO_URL

# Configure Git
git config --global user.name "$USER_NAME"
git config --global user.email "$USER_EMAIL"
git config --global init.defaultBranch main

echo "✅ Git configured for $USER_NAME"

# Initialize repository
git init
git remote add origin "$REPO_URL"

# Create .gitignore
cat > .gitignore << EOL
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment files
.env
.env.local
.env.development
.env.production

# Build outputs
dist/
build/
.next/

# Database
*.sqlite
*.db

# Logs
logs/
*.log

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Temporary files
tmp/
temp/
EOL

echo "✅ .gitignore created"

# Add and commit
git add .
git commit -m "Initial commit: Housy Tunisia Construction Management System

Features:
- Complete PostgreSQL database (43 tables)
- Redis caching system
- Express.js REST API
- React frontend
- User authentication
- Project management
- Material tracking
- Financial management
- Real-time notifications
- Docker development environment"

echo "✅ Initial commit created"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo "✅ Successfully pushed to GitHub!"
echo "🌐 Your repository: $REPO_URL"
```

## 🔒 **Security Best Practices**

### **Files to NEVER Commit:**

- `.env` files (contain passwords/API keys)
- `node_modules/` (dependencies)
- Database files
- Log files
- Personal configuration files

### **Environment Variables:**

Create `.env.example` for others:

```env
# Copy this to .env and fill in your values

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Application Configuration
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=your-encryption-key

# API Keys (if needed)
OPENAI_API_KEY=your-api-key
```

## 📋 **Quick Commands Reference**

```bash
# Check repository status
git status

# Add specific files
git add filename.js

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push changes
git push

# Pull latest changes
git pull

# Check commit history
git log --oneline

# Check remote repositories
git remote -v

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

## 🎯 **Next Steps**

1. **Configure your Git identity** with the commands above
2. **Create/connect to your GitHub repository**
3. **Push your Housy project**
4. **Set up branch protection** (optional)
5. **Add collaborators** if needed
6. **Create releases** for versions

Your Housy Tunisia construction management system will be safely stored and version-controlled on GitHub! 🏗️✨

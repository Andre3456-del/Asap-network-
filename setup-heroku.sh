#!/bin/bash

# Heroku Deployment Setup Script for Web3 Learn Bot
# This script creates all necessary files for Heroku deployment

echo "🚀 Setting up Heroku deployment for Web3 Learn Bot..."

# Create Procfile
cat > Procfile << 'EOF'
web: node src/index.js
EOF
echo "✅ Created Procfile"

# Create .env.example with complete configuration
cat > .env.example << 'EOF'
# ===== Telegram =====
# Your Telegram Bot Token from @BotFather
TELEGRAM_BOT_TOKEN=8972969632:AAESkY4-ItORLKCIPVJ1QX98Rsxtj40Ofq0

# Your personal Telegram numeric chat_id (the admin/owner)
ADMIN_CHAT_ID=7070802621

# ===== Gmail (for Email Notifications) =====
# Gmail address for sending notifications
GMAIL_USER=donryscott28@gmail.com

# Your Gmail password (or app-specific password if you have 2FA enabled)
GMAIL_APP_PASSWORD=your_gmail_password_here

# From name shown in activation emails
EMAIL_FROM_NAME=Web3 Learn AI

# ===== AI (for "ask me anything Web3" fallback answers) =====
# Optional: Groq API for AI responses
GROQ_API_KEY=your_groq_api_key_here

# Optional: OpenAI API for AI responses
OPENAI_API_KEY=your_openai_api_key_here

# ===== Payment address (shown to users) =====
# USDT BEP20 wallet address for payments
USDT_BEP20_ADDRESS=0x6Ed0a6fE213D339679192DbbDA695eD283938606

# Telegram support handle
SUPPORT_TELEGRAM_HANDLE=@tesandre25

# ===== Database =====
# SQLite database file path
DB_PATH=./data/web3learn.db

# ===== Polling =====
# Long-poll timeout in seconds (Telegram holds the connection open, cheap & fast)
POLL_TIMEOUT_SECONDS=30

# ===== Environment =====
NODE_ENV=production
EOF
echo "✅ Created .env.example with Telegram bot token"

# Create .github/workflows directory if it doesn't exist
mkdir -p .github/workflows

# Create GitHub Actions workflow for automated Heroku deployment
cat > .github/workflows/heroku-deploy.yml << 'EOF'
name: Deploy to Heroku

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.13.15
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
          usedocker: false
        env:
          HD_TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          HD_ADMIN_CHAT_ID: ${{ secrets.ADMIN_CHAT_ID }}
          HD_GMAIL_USER: ${{ secrets.GMAIL_USER }}
          HD_GMAIL_APP_PASSWORD: ${{ secrets.GMAIL_APP_PASSWORD }}
          HD_EMAIL_FROM_NAME: Web3 Learn AI
          HD_GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
          HD_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          HD_USDT_BEP20_ADDRESS: ${{ secrets.USDT_BEP20_ADDRESS }}
          HD_SUPPORT_TELEGRAM_HANDLE: ${{ secrets.SUPPORT_TELEGRAM_HANDLE }}
          HD_DB_PATH: ./data/web3learn.db
          HD_POLL_TIMEOUT_SECONDS: 30
          HD_NODE_ENV: production
EOF
echo "✅ Created .github/workflows/heroku-deploy.yml"

echo ""
echo "📋 Setup complete! Files created:"
echo "   ✅ Procfile"
echo "   ✅ .env.example (with your Telegram Bot Token: 8972969632:AAESkY4-ItORLKCIPVJ1QX98Rsxtj40Ofq0)"
echo "   ✅ .github/workflows/heroku-deploy.yml"
echo ""
echo "📝 Next steps:"
echo "   1. Commit these files: git add . && git commit -m 'Setup Heroku deployment'"
echo "   2. Push to main: git push origin main"
echo "   3. Add GitHub secrets (Settings → Secrets and variables → Actions)"
echo "   4. Your bot will auto-deploy! 🚀"

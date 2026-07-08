#!/bin/bash

# Heroku Deployment Setup Script for Web3 Learn Bot
# This script creates all necessary files for Heroku deployment

echo "🚀 Setting up Heroku deployment..."

# Create Procfile
cat > Procfile << 'EOF'
web: node src/index.js
EOF
echo "✅ Created Procfile"

# Create .env.example
cat > .env.example << 'EOF'
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=8972969632:AAESkY4-ItORLKCIPVJ1QX98Rsxtj40Ofq0

# Email Configuration (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Database (SQLite file path)
DATABASE_PATH=./data/bot.db

# Payment API (if applicable)
PAYMENT_API_KEY=your_payment_api_key
PAYMENT_API_URL=https://api.payment-provider.com

# Node Environment
NODE_ENV=production
EOF
echo "✅ Created .env.example"

# Create .github/workflows directory if it doesn't exist
mkdir -p .github/workflows

# Create GitHub Actions workflow
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
          HD_EMAIL_SERVICE: ${{ secrets.EMAIL_SERVICE }}
          HD_EMAIL_USER: ${{ secrets.EMAIL_USER }}
          HD_EMAIL_PASSWORD: ${{ secrets.EMAIL_PASSWORD }}
          HD_PAYMENT_API_KEY: ${{ secrets.PAYMENT_API_KEY }}
          HD_PAYMENT_API_URL: ${{ secrets.PAYMENT_API_URL }}
          HD_NODE_ENV: production
EOF
echo "✅ Created .github/workflows/heroku-deploy.yml"

echo ""
echo "📋 Setup complete! Files created:"
echo "   - Procfile"
echo "   - .env.example (with your Telegram Bot token)"
echo "   - .github/workflows/heroku-deploy.yml"
echo ""
echo "📝 Next steps:"
echo "   1. Commit these files: git add . && git commit -m 'Add Heroku deployment files'"
echo "   2. Push to main: git push origin main"
echo "   3. Add GitHub secrets (Settings → Secrets and variables → Actions)"
echo "   4. Your bot will auto-deploy! 🚀"

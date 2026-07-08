# Heroku Deployment Guide - Asap Network Bot

## ✅ Prerequisites Completed
- ✅ Telegram Bot Token: `8970100443:AAGJoI0mT64yw7Tq5fZkOmNimSj5_8fR3UY`
- ✅ Admin Chat ID: `7070802621`
- ✅ Gmail: `donryscott28@gmail.com`
- ✅ Heroku account needed (free tier available at https://www.heroku.com)

## Step 1: Create a Heroku App

1. Go to https://dashboard.heroku.com
2. Click "New" → "Create new app"
3. Enter app name: `asap-network-bot` (or your preferred name)
4. Choose region (US or Europe)
5. Click "Create app"

## Step 2: Add GitHub Secrets

Add these secrets to your GitHub repository (**Settings → Secrets and variables → Actions**):

### Required Secrets:
```
HEROKU_API_KEY       - Your Heroku API key
HEROKU_EMAIL         - Your Heroku account email
HEROKU_APP_NAME      - Your app name (e.g., asap-network-bot)
TELEGRAM_BOT_TOKEN   - 8970100443:AAGJoI0mT64yw7Tq5fZkOmNimSj5_8fR3UY
ADMIN_CHAT_ID        - 7070802621
GMAIL_USER           - donryscott28@gmail.com
GMAIL_APP_PASSWORD   - Your Gmail password
```

### Optional Secrets (for AI features):
```
GROQ_API_KEY         - For Groq AI responses
OPENAI_API_KEY       - For OpenAI API responses
USDT_BEP20_ADDRESS   - Your payment wallet address
SUPPORT_TELEGRAM_HANDLE - Your Telegram handle
```

### How to Add GitHub Secrets:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its value
5. Click **Add secret**

## Step 3: Get Your Heroku API Key

1. Go to https://dashboard.heroku.com/account
2. Scroll to "API Key" section
3. Click "Reveal" and copy your API key
4. Add it to GitHub secrets as `HEROKU_API_KEY`

## Step 4: Configure Gmail

Since you couldn't generate an app password, we'll use your Gmail password:

1. Make sure your Gmail account has **Less secure app access** enabled:
   - Go to https://myaccount.google.com/security
   - Scroll down to "Less secure app access"
   - Turn it ON

2. Or generate an app password (recommended):
   - Enable 2-Step Verification first: https://myaccount.google.com/security
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (custom name)"
   - Name it "AsapNetworkBot"
   - Copy the 16-character password
   - Add to GitHub secrets as `GMAIL_APP_PASSWORD`

## Step 5: Deploy

Once all secrets are added:

1. The setup script has already created all necessary files
2. Commit your changes:
   ```bash
   git add .
   git commit -m "Setup Heroku deployment for Asap Network Bot"
   git push origin main
   ```

3. GitHub Actions will automatically deploy to Heroku
4. Watch the deployment progress in the **Actions** tab

**Or manually deploy with Heroku CLI:**
```bash
heroku login
heroku deploy:github --app=asap-network-bot
```

## Step 6: View Logs

Monitor your bot's logs:

```bash
heroku logs --tail --app=asap-network-bot
```

Or view in the Heroku dashboard → your app → "View logs"

## Database Notes

- SQLite database file will be stored in Heroku's ephemeral filesystem
- **This means data will be lost when your app restarts** (typically every 24 hours)
- For production, upgrade to **Heroku Postgres** (paid add-on):
  - Heroku Dashboard → Resources → Add-ons → Heroku Postgres
  - Update your code to use PostgreSQL connection string from `DATABASE_URL` env var

## Environment Variables

See `.env.example` for all available environment variables. These are configured via GitHub secrets and passed to Heroku during deployment.

## Your Bot Configuration

**Bot Name:** Asap Network
**Telegram Bot Token:** `8970100443:AAGJoI0mT64yw7Tq5fZkOmNimSj5_8fR3UY`
**Admin Chat ID:** `7070802621`
**Gmail Address:** `donryscott28@gmail.com`

## Troubleshooting

**Bot not responding:**
- Check GitHub Actions logs (Actions tab)
- Run `heroku logs --tail --app=asap-network-bot` to see errors
- Verify all GitHub secrets are correctly added
- Ensure Telegram bot token is active

**Build fails:**
- Verify all secrets are correctly added
- Check that `node` version is >=18 in `package.json`
- Look at GitHub Actions logs for specific errors

**App crashes:**
- Run `heroku logs --tail --app=asap-network-bot` to see errors
- Check that all required environment variables are set
- Verify Gmail credentials are correct if email notifications fail

**Need to scale or upgrade:**
- Heroku dashboard → your app → Dyno formation
- Upgrade from free tier to paid dyno for 24/7 uptime

## Manual Commands

```bash
# Login to Heroku
heroku login

# View app status
heroku apps:info --app=asap-network-bot

# Check logs
heroku logs --tail --app=asap-network-bot

# Restart app
heroku restart --app=asap-network-bot

# View environment variables
heroku config --app=asap-network-bot

# Scale dynos (upgrade from free)
heroku ps:scale web=1 --app=asap-network-bot
```

## Next Steps

1. ✅ Run setup script: `./setup-heroku.sh`
2. ⏭️ Create Heroku app (name it `asap-network-bot`)
3. ⏭️ Add all GitHub secrets
4. ⏭️ Push code to main branch
5. ⏭️ Monitor deployment in Actions tab
6. ⏭️ Check app on Heroku dashboard
7. ⏭️ Test bot on Telegram

Your Asap Network Bot should be live! 🚀

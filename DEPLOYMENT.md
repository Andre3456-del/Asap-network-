# Heroku Deployment Guide - Web3 Learn Bot

## Prerequisites
- Heroku account (free tier available at https://www.heroku.com)
- GitHub account with this repository
- Telegram Bot Token (from @BotFather on Telegram)

## Step 1: Create a Heroku App

1. Go to https://dashboard.heroku.com
2. Click "New" → "Create new app"
3. Enter app name: `web3-learn-bot` (or your preferred name)
4. Choose region (US or Europe)
5. Click "Create app"

## Step 2: Set Up GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
HEROKU_API_KEY       - Your Heroku API key (get from Account Settings → API Key)
HEROKU_EMAIL         - Your Heroku account email
HEROKU_APP_NAME      - Your Heroku app name (e.g., web3-learn-bot)
TELEGRAM_BOT_TOKEN   - Your Telegram bot token
EMAIL_SERVICE        - Email service (e.g., gmail)
EMAIL_USER           - Your email address
EMAIL_PASSWORD       - Your app-specific password (NOT your Gmail password)
PAYMENT_API_KEY      - Your payment API key (if using payments)
PAYMENT_API_URL      - Your payment API URL (if using payments)
```

### How to Get GitHub Secrets:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its value

## Step 3: Get Your Heroku API Key

1. Go to https://dashboard.heroku.com/account
2. Scroll to "API Key" section
3. Click "Reveal" and copy your API key
4. Add it to GitHub secrets as `HEROKU_API_KEY`

## Step 4: Get Telegram Bot Token

1. Open Telegram and search for `@BotFather`
2. Send `/start` → `/newbot`
3. Follow the prompts to create your bot
4. Copy the token provided
5. Add it to GitHub secrets as `TELEGRAM_BOT_TOKEN`

## Step 5: Configure Email Notifications (Gmail)

If using Gmail for email notifications:

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Go to https://myaccount.google.com/apppasswords
4. Generate an app-specific password
5. Add to GitHub secrets:
   - `EMAIL_USER`: your email address
   - `EMAIL_PASSWORD`: the app-specific password (NOT your Gmail password)

## Step 6: Deploy

Once all secrets are added:

1. Make any commit to the `main` branch (or manually trigger the workflow)
2. GitHub Actions will automatically deploy to Heroku
3. Watch the deployment progress in the **Actions** tab

```bash
# Or manually deploy with Heroku CLI:
heroku login
heroku deploy:github --app=web3-learn-bot
```

## Step 7: View Logs

Monitor your app's logs:

```bash
heroku logs --tail --app=web3-learn-bot
```

Or view in the Heroku dashboard → your app → "View logs"

## Database Notes

- SQLite database file will be stored in Heroku's ephemeral filesystem
- **This means data will be lost when your app restarts** (typically every 24 hours)
- For production, upgrade to **Heroku Postgres** (paid add-on):
  - Heroku Dashboard → Resources → Add-ons → Heroku Postgres
  - Update your code to use PostgreSQL connection string from `DATABASE_URL` env var

## Environment Variables Reference

See `.env.example` for all available environment variables. These are configured via GitHub secrets and passed to Heroku during deployment.

## Troubleshooting

**Build fails:**
- Check GitHub Actions logs (Actions tab)
- Verify all secrets are correctly added
- Ensure `node` version is >=18 in `package.json`

**App crashes:**
- Run `heroku logs --tail --app=web3-learn-bot` to see errors
- Check that all required environment variables are set

**Need to scale or upgrade:**
- Heroku dashboard → your app → Dyno formation
- Upgrade from free tier to paid dyno for 24/7 uptime

## Manual Commands

```bash
# Login to Heroku
heroku login

# View app status
heroku apps:info --app=web3-learn-bot

# Check logs
heroku logs --tail --app=web3-learn-bot

# Restart app
heroku restart --app=web3-learn-bot

# Scale dynos (upgrade from free)
heroku ps:scale web=1 --app=web3-learn-bot
```

## Next Steps

1. ✅ Create Heroku app
2. ✅ Add GitHub secrets
3. ✅ Push code to main branch
4. ✅ Monitor deployment in Actions tab
5. ✅ Check app on Heroku dashboard

Your bot should be live! 🚀

# Web3 Learn Bot — Standalone Edition

This is a self-contained Node.js Telegram bot. It does **not** need an external
agent/poller framework to trigger it — it runs its own long-polling loop against
the Telegram API, reads/writes a real SQLite database, and sends emails directly
via Gmail. Start it once and leave it running.

## ⚠️ Do this first: rotate your bot token

Your old token was pasted in plaintext in a chat conversation. Before running this
for real, go to **@BotFather** on Telegram → `/mybots` → your bot → **API Token** →
**Revoke current token** → generate a new one, and put *that* in `.env`.

## 1. Install

```bash
cd web3-learn-bot
npm install
```

Requires Node.js 18+.

## 2. Configure

```bash
cp .env.example .env
```

Then edit `.env`:

| Variable | What it is |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Your (new, rotated) bot token from @BotFather |
| `ADMIN_CHAT_ID` | Your Telegram numeric chat id (already `7070802621`) |
| `GMAIL_USER` | The Gmail address the bot sends from |
| `GMAIL_APP_PASSWORD` | 16-character App Password (see below) |
| `EMAIL_FROM_NAME` | Display name on outgoing emails |
| `GROQ_API_KEY` | Optional — for AI Q&A (get one free at console.groq.com) |
| `OPENAI_API_KEY` | Optional — fallback if Groq fails/unset |
| `USDT_BEP20_ADDRESS` | Your payment wallet address |
| `SUPPORT_TELEGRAM_HANDLE` | Where users DM you (e.g. `@tesandre25`) |

### Getting a Gmail App Password
1. Turn on 2-Step Verification: https://myaccount.google.com/security
2. Create an App Password: https://myaccount.google.com/apppasswords
3. App: "Mail", Device: "Other" → name it `Web3LearnBot` → copy the 16-char password (no spaces) into `GMAIL_APP_PASSWORD`.

## 3. Edit your content

- `data/web3-knowledge.md` — course list, pricing, and any Q&A grounding content. Replace the placeholders with your real course info.
- `data/web3-videos.md` — one line per video with keywords, used by `/video {topic}` and free-form questions.

## 4. Run it

```bash
npm start
```

You should see:
```
Web3 Learn Bot starting (standalone long-polling mode)...
```
Leave this running. It long-polls Telegram (cheap — Telegram holds the connection
open server-side) so there's no fixed interval or external trigger needed.

To keep it alive after closing your terminal / on reboot, use **pm2**:
```bash
npm install -g pm2
pm2 start src/index.js --name web3-learn-bot
pm2 save
pm2 startup   # follow the printed instructions to survive reboots
```

## What changed vs. the original "poller" version

1. **No trigger needed.** The original logic only ran when an external agent
   framework invoked it once per "poll." This version runs its own `while` loop
   with Telegram long-polling — it's always listening.
2. **Real database.** SQLite via `better-sqlite3` instead of a flat `.table` file,
   with proper schema, unique constraints on `access_code`/`tx_hash`, and indexed lookups.
3. **Direct Gmail send.** No third-party OAuth integration layer — `nodemailer`
   talks to Gmail directly with an App Password.
4. **Fixed a real bug:** in the original, `/paid` stored the *admin's* `telegram_id`
   on every row (there was no way to capture the customer's id), so `/activate`
   would notify the admin instead of the customer — which is exactly what the test
   log showed. `/paid` now takes the customer's `telegram_id` as a parameter:
   ```
   /paid "Course Name" email@example.com <customer_telegram_id> 0xTXHASH
   ```
   Get their id by having them `/start` the bot once (Telegram doesn't expose a
   user's chat id from just a username — this is a Telegram platform limitation,
   not something code can work around).

## Command reference

**Admin only** (from `ADMIN_CHAT_ID`):
- `/paid "Course Name" email@example.com <telegram_id> 0xTXHASH` — create pending record (silent)
- `/verify <code>` — mark verified (silent)
- `/activate <code>` — mark active, **notifies user on Telegram + email**
- `/reject <code>` — mark rejected, **notifies user on Telegram**
- `/pending` — list all pending payments
- `/stats` — counts by status

**Users:**
- `/start`, `/help`, `/courses`, `/pricing`, `/pay`
- `/register Name|email@example.com|phone` — capture a lead
- `/video {topic}` — get a relevant video
- Anything else → AI answer (Groq → OpenAI fallback) + relevant video if found

## Project structure

```
web3-learn-bot/
  src/
    index.js              # main loop — long-polls Telegram, routes messages
    db.js                 # SQLite schema + queries
    telegramClient.js     # getUpdates / sendMessage wrappers
    handlers/
      adminCommands.js    # /paid /verify /activate /reject /pending /stats
      userCommands.js     # /start /help /courses /pricing /pay /register /video + AI fallback
    services/
      email.js            # Gmail send via nodemailer
      ai.js                # Groq primary, OpenAI fallback
      knowledge.js         # reads data/*.md for courses/pricing/videos
    utils/
      accessCode.js        # W3L-XXXXXXXX generator
  data/
    web3-knowledge.md      # EDIT: your real course/pricing content
    web3-videos.md         # EDIT: your real video links
  .env.example
  package.json
```

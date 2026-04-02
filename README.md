# ☕ Terminal Coffee

> Order coffee from your terminal. Pay via Razorpay. Get notified on Telegram.

```
    ╭──────────────────────────────╮
    │  ☕  Terminal Coffee  ☕     │
    │    Order coffee from your    │
    │        terminal.             │
    ╰──────────────────────────────╯
```

## How It Works

```
coffee order --item latte --size large
        │
        ▼
   ┌─────────┐     ┌──────────┐
   │ Express  │────▶│ MongoDB  │
   │  API     │     └──────────┘
   └────┬─────┘
        │ creates payment link
        ▼
   ┌──────────┐     ┌──────────────┐
   │ Razorpay │────▶│ Webhook      │
   │ Payment  │     │ (on payment) │
   └──────────┘     └──────┬───────┘
                           │ notifies
                           ▼
                    ┌──────────────┐
                    │ Telegram Bot │
                    │ [Accept/Rej] │
                    └──────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Razorpay account
- Telegram bot (via @BotFather)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env    # Fill in your credentials
npm install
npm run dev
```

### 2. CLI Setup

```bash
cd cli
npm install
npm link                # Makes 'coffee' command available globally
```

### 3. Start Ordering

```bash
coffee login --username yourname
coffee menu
coffee order
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `coffee login --username <name>` | Authenticate with the server |
| `coffee logout` | Remove stored credentials |
| `coffee whoami` | Show current user info |
| `coffee menu` | View menu with prices |
| `coffee order` | Place an order (interactive) |
| `coffee order --item latte --size large` | Place an order (direct) |
| `coffee status` | Check latest order status |
| `coffee history` | View past orders |

### Flags

| Flag | Description |
|------|-------------|
| `--json` | Output raw JSON (works with any command) |
| `--help` | Show help for any command |

## Menu

| Item | Small | Medium | Large |
|------|-------|--------|-------|
| Cappuccino | ₹160 | ₹200 | ₹240 |
| Latte | ₹144 | ₹180 | ₹216 |
| Espresso | ₹120 | ₹150 | ₹180 |

## Environment Variables

Create `backend/.env` from `.env.example`:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signature secret |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | Telegram chat ID for order notifications |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Login with username |
| GET | `/menu` | No | Get menu with prices |
| POST | `/order` | Yes | Create new order |
| GET | `/order/status` | Yes | Get latest order status |
| GET | `/order/history` | Yes | Get order history |
| POST | `/webhook/razorpay` | Signature | Razorpay payment webhook |
| POST | `/webhook/telegram` | No | Telegram callback webhook |
| GET | `/health` | No | Health check |

## Webhook Setup

### Razorpay

1. Go to Razorpay Dashboard > Settings > Webhooks
2. Add webhook URL: `https://<your-domain>/webhook/razorpay`
3. Select events: `payment_link.paid`, `payment.captured`
4. Copy the webhook secret to `RAZORPAY_WEBHOOK_SECRET`

### Telegram

Set your bot's webhook:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-domain>/webhook/telegram"
```

For local development, use [ngrok](https://ngrok.com) to expose your local server:

```bash
ngrok http 5000
# Then set the ngrok URL as your webhook URL
```

## Project Structure

```
coffee-ordering/
  backend/
    config/
      db.js              # MongoDB connection
      env.js             # Environment config + validation
      menu.js            # Menu items, sizes, pricing
    models/
      User.js            # User schema
      Order.js           # Order schema
    controllers/
      authController.js  # Login handler
      menuController.js  # Menu handler
      orderController.js # Order CRUD handlers
      webhookController.js # Razorpay + Telegram webhooks
    routes/
      authRoutes.js
      menuRoutes.js
      orderRoutes.js
      webhookRoutes.js
    services/
      razorpayService.js # Payment link creation + signature verify
      telegramService.js # Order notification + retry logic
    middleware/
      auth.js            # Bearer token auth
    server.js            # Express entry point
  cli/
    index.js             # CLI entry point
    lib/
      config.js          # Config file helpers (~/.coffee-config.json)
      api.js             # API client with spinners
      ui.js              # Design system (banner, colors, tables)
    commands/
      login.js
      logout.js
      whoami.js
      menu.js
      order.js
      status.js
      history.js
```

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Payments:** Razorpay
- **Notifications:** Telegram Bot API
- **CLI:** Commander, Chalk, Ora, Inquirer

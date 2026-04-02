import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/coffee-ordering',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
  dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
};

const REQUIRED_VARS = [
  ['RAZORPAY_KEY_ID', env.razorpayKeyId],
  ['RAZORPAY_KEY_SECRET', env.razorpayKeySecret],
  ['RAZORPAY_WEBHOOK_SECRET', env.razorpayWebhookSecret],
  ['TELEGRAM_BOT_TOKEN', env.telegramBotToken],
];

const missing = REQUIRED_VARS.filter(([, value]) => !value);

if (missing.length > 0) {
  console.error('\n╔══════════════════════════════════════════╗');
  console.error('║  Missing required environment variables   ║');
  console.error('╠══════════════════════════════════════════╣');
  missing.forEach(([name]) => {
    console.error(`║  ✗ ${name.padEnd(36)}║`);
  });
  console.error('╠══════════════════════════════════════════╣');
  console.error('║  Copy .env.example to .env and fill in   ║');
  console.error('║  the missing values to get started.      ║');
  console.error('╚══════════════════════════════════════════╝\n');
  process.exit(1);
}

export default env;

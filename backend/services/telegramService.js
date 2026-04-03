import crypto from 'crypto';
import TelegramBot from 'node-telegram-bot-api';
import Shop from '../models/Shop.js';
import env from '../config/env.js';

const dashboardUrl = env.dashboardUrl;

const bot = new TelegramBot(env.telegramBotToken, { polling: false });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetry = async (fn, retries = 3, baseDelay = 300) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries - 1) throw error;
      const delay = baseDelay * Math.pow(3, attempt);
      console.warn(`Telegram API retry ${attempt + 1}/${retries}, waiting ${delay}ms...`);
      await sleep(delay);
    }
  }
};

export const sendOrderNotification = async (order, user, chatId) => {
  const targetChatId = chatId || env.telegramChatId;

  if (!targetChatId) {
    console.warn('No Telegram chat ID available for order notification');
    return;
  }

  // Generate a one-time token for auto-login from Telegram
  let ottParam = '';
  const shopId = order.shopId?._id;
  if (shopId) {
    try {
      const ott = crypto.randomUUID();
      await Shop.findByIdAndUpdate(shopId, {
        'owner.oneTimeToken': ott,
        'owner.oneTimeTokenExpiresAt': new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
      });
      ottParam = `?ott=${ott}`;
    } catch (err) {
      console.warn('Failed to generate one-time token:', err.message);
    }
  }

  const customerName = typeof user === 'string' ? user : (user?.username || 'Unknown');
  const customerPhone = typeof user === 'object' && user?.phone ? user.phone : null;

  const shopLine = order.shopId?.name ? `*Shop:* ${order.shopId.name}\n` : '';
  const phoneLine = customerPhone ? `*Customer Phone:* [${customerPhone}](tel:${customerPhone})\n` : '';
  const locationLine = order.userLocation?.lat && order.userLocation?.lng
    ? `📍 *Location:* [View on Maps](https://www.google.com/maps?q=${order.userLocation.lat},${order.userLocation.lng})\n`
    : '';

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  let itemsBlock;
  const orderItems = order.items && order.items.length > 0 ? order.items : null;

  if (orderItems && orderItems.length > 1) {
    const lines = orderItems.map((i) => `  • ${cap(i.item)} (${cap(i.size)}) — ₹${i.price}`);
    itemsBlock = `*Items:*\n${lines.join('\n')}\n*Total:* ₹${order.totalPrice || order.price}\n`;
  } else {
    const i = orderItems ? orderItems[0] : order;
    itemsBlock = `*Item:* ${cap(i.item)}\n*Size:* ${cap(i.size)}\n*Price:* ₹${order.totalPrice || order.price}\n`;
  }

  const message =
    `🔔 *New Order Received!*\n\n` +
    shopLine +
    itemsBlock +
    `*Customer:* ${customerName}\n` +
    phoneLine +
    locationLine +
    `*Order ID:* \`${order._id}\`\n` +
    `🖥 [View on Dashboard](${dashboardUrl}/dashboard/orders/${order._id}${ottParam})\n\n` +
    `⏳ _Please respond within 2 minutes_`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Accept (5 min)', callback_data: `accept_${order._id}_5` },
        { text: '✅ Accept (10 min)', callback_data: `accept_${order._id}_10` },
      ],
      [
        { text: '✅ Accept (15 min)', callback_data: `accept_${order._id}_15` },
        { text: '✅ Accept (20 min)', callback_data: `accept_${order._id}_20` },
      ],
      [
        { text: '❌ Reject Order', callback_data: `reject_${order._id}_0` },
      ],
    ],
  };

  return withRetry(() =>
    bot.sendMessage(targetChatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    })
  );
};

export const sendOrderUpdate = async (chatId, message) => {
  const targetChatId = chatId || env.telegramChatId;
  if (!targetChatId) return;

  return withRetry(() =>
    bot.sendMessage(targetChatId, message, { parse_mode: 'Markdown' })
  );
};

export const answerCallbackQuery = async (callbackQueryId, text) => {
  return bot.answerCallbackQuery(callbackQueryId, { text });
};

export const editMessageReplyMarkup = async (chatId, messageId) => {
  try {
    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    );
  } catch {
    // Ignore if message can't be edited
  }
};

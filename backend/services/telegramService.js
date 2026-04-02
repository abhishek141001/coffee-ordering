import TelegramBot from 'node-telegram-bot-api';
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

  const customerName = typeof user === 'string' ? user : (user?.username || 'Unknown');
  const customerPhone = typeof user === 'object' && user?.phone ? user.phone : null;

  const shopLine = order.shopId?.name ? `*Shop:* ${order.shopId.name}\n` : '';
  const phoneLine = customerPhone ? `*Customer Phone:* ${customerPhone}\n` : '';

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
    `*Order ID:* \`${order._id}\`\n` +
    `🖥 [View on Dashboard](${dashboardUrl}/dashboard/orders/${order._id})\n\n` +
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

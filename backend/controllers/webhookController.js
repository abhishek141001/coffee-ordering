import Order from '../models/Order.js';
import User from '../models/User.js';
import { verifyWebhookSignature } from '../services/razorpayService.js';
import { sendOrderNotification, answerCallbackQuery, editMessageReplyMarkup } from '../services/telegramService.js';
import { acceptOrder, rejectOrder } from '../services/orderActionService.js';

async function notifyShop(order) {
  const populated = await Order.findById(order._id).populate('shopId', 'name telegramChatId');
  const user = await User.findById(order.userId);
  const chatId = populated.shopId?.telegramChatId || null;

  await sendOrderNotification(populated, user || { username: 'Unknown', phone: '' }, chatId);

  // Auto-reject after 2 minutes if shop doesn't respond
  setTimeout(async () => {
    try {
      const populated = await Order.findById(order._id).populate('shopId', '_id');
      if (populated && populated.status === 'paid') {
        const result = await rejectOrder(order._id, populated.shopId?._id);
        if (result.success) {
          console.log(`Order ${order._id} auto-rejected after 2 minute timeout`);
        }
      }
    } catch (err) {
      console.error('Auto-reject error:', err);
    }
  }, 2 * 60 * 1000);
}

export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    const rawBody = req.body.toString();
    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody);

    if (
      event.event === 'payment_link.paid' ||
      event.event === 'payment.captured'
    ) {
      const payload = event.payload.payment_link?.entity || event.payload.payment?.entity;
      const referenceId = payload?.reference_id || payload?.notes?.order_id;
      const paymentId = payload?.id || event.payload.payment?.entity?.id;

      if (!referenceId) {
        console.error('No reference_id found in webhook payload');
        return res.status(200).json({ status: 'ignored' });
      }

      const order = await Order.findById(referenceId);

      if (!order) {
        console.error(`Order not found: ${referenceId}`);
        return res.status(200).json({ status: 'order_not_found' });
      }

      if (order.status !== 'pending_payment') {
        return res.status(200).json({ status: 'already_processed' });
      }

      order.status = 'paid';
      order.razorpay_payment_id = paymentId;
      await order.save();

      try {
        await notifyShop(order);
      } catch (telegramError) {
        console.error('Failed to send Telegram notification:', telegramError);
      }

      return res.status(200).json({ status: 'ok' });
    }

    res.status(200).json({ status: 'event_ignored' });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

export const razorpayCallback = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_payment_link_id, razorpay_payment_link_status } = req.query;

    if (razorpay_payment_link_status === 'paid' && razorpay_payment_link_id) {
      const order = await Order.findOne({ razorpay_order_id: razorpay_payment_link_id });

      if (order && order.status === 'pending_payment') {
        order.status = 'paid';
        order.razorpay_payment_id = razorpay_payment_id;
        await order.save();

        try {
          await notifyShop(order);
        } catch (telegramError) {
          console.error('Failed to send Telegram notification:', telegramError);
        }
      }
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Successful</title>
        <style>
          body { font-family: -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a1a2e; color: #fff; }
          .card { text-align: center; padding: 48px; border-radius: 16px; background: #16213e; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
          .icon { font-size: 64px; margin-bottom: 16px; }
          h1 { margin: 0 0 8px; color: #4ecca3; }
          p { color: #a0a0b0; margin: 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">☕</div>
          <h1>Payment Successful!</h1>
          <p>Your coffee order is being prepared.</p>
          <p style="margin-top: 16px; font-size: 14px;">You can close this tab and check status with: <code>coffee status</code></p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Razorpay callback error:', error);
    res.status(500).send('Something went wrong');
  }
};

export const telegramWebhook = async (req, res) => {
  try {
    const { callback_query } = req.body;

    if (!callback_query) {
      return res.status(200).json({ status: 'no_callback' });
    }

    const { data, id: callbackQueryId, message } = callback_query;

    if (!data) {
      return res.status(200).json({ status: 'no_data' });
    }

    // Format: action_orderId_eta (e.g., accept_abc123_10 or reject_abc123_0)
    const parts = data.split('_');
    const action = parts[0];
    const orderId = parts[1];
    const eta = parseInt(parts[2]) || 0;

    if (!['accept', 'reject'].includes(action) || !orderId) {
      return res.status(200).json({ status: 'invalid_action' });
    }

    const order = await Order.findById(orderId).populate('shopId', 'name owner telegramChatId');

    if (!order) {
      await answerCallbackQuery(callbackQueryId, 'Order not found');
      return res.status(200).json({ status: 'order_not_found' });
    }

    if (order.status !== 'paid') {
      await answerCallbackQuery(callbackQueryId, `Order already ${order.status}`);
      return res.status(200).json({ status: 'already_processed' });
    }

    const shopId = order.shopId?._id;

    if (action === 'accept') {
      const result = await acceptOrder(orderId, shopId, eta);
      if (!result.success) {
        await answerCallbackQuery(callbackQueryId, result.error);
        return res.status(200).json({ status: 'already_processed' });
      }
      if (message?.chat?.id && message?.message_id) {
        await editMessageReplyMarkup(message.chat.id, message.message_id);
      }
      await answerCallbackQuery(callbackQueryId, `✅ Order accepted! ETA: ${eta} minutes`);
    } else {
      const result = await rejectOrder(orderId, shopId);
      if (!result.success) {
        await answerCallbackQuery(callbackQueryId, result.error);
        return res.status(200).json({ status: 'already_processed' });
      }
      if (message?.chat?.id && message?.message_id) {
        await editMessageReplyMarkup(message.chat.id, message.message_id);
      }
      const refundMessage = result.refundResult?.status === 'processed'
        ? ' Refund initiated.'
        : result.refundResult?.status === 'failed'
          ? ' Refund failed — needs manual processing.'
          : '';
      await answerCallbackQuery(callbackQueryId, `❌ Order rejected.${refundMessage}`);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.status(200).json({ status: 'error' });
  }
};

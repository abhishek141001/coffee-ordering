import Razorpay from 'razorpay';
import crypto from 'crypto';
import env from '../config/env.js';

const razorpay = new Razorpay({
  key_id: env.razorpayKeyId,
  key_secret: env.razorpayKeySecret,
});

export const createPaymentLink = async ({ amount, orderId, description, customerName }) => {
  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: 'INR',
      description,
      reference_id: orderId,
      customer: {
        name: customerName || 'Customer',
      },
      callback_url: `${env.baseUrl}/webhook/razorpay/callback`,
      callback_method: 'get',
    });

    return {
      paymentLinkId: paymentLink.id,
      paymentLinkUrl: paymentLink.short_url,
    };
  } catch (error) {
    // Razorpay SDK wraps errors oddly — extract the real message
    const message = error?.error?.description || error?.message || 'Razorpay API error';
    const err = new Error(message);
    err.statusCode = error?.statusCode || 500;
    throw err;
  }
};

export const createUPIQRCode = async ({ amount, orderId, description, customerName }) => {
  try {
    const closeBy = Math.floor(Date.now() / 1000) + 15 * 60; // 15 minutes from now

    const qrCode = await razorpay.qrCode.create({
      type: 'upi_qr',
      name: customerName || 'Customer',
      usage: 'single_use',
      fixed_amount: true,
      payment_amount: amount * 100,
      description,
      customer_id: orderId,
      close_by: closeBy,
      notes: {
        order_id: orderId,
      },
    });

    return {
      qrCodeId: qrCode.id,
      qrImageUrl: qrCode.image_url,
    };
  } catch (error) {
    const message = error?.error?.description || error?.message || 'Razorpay QR code error';
    const err = new Error(message);
    err.statusCode = error?.statusCode || 500;
    throw err;
  }
};

export const processRefund = async ({ paymentId, amount }) => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100,
      speed: 'normal',
    });

    return { refundId: refund.id, status: refund.status };
  } catch (error) {
    const message = error?.error?.description || error?.message || 'Razorpay refund error';

    // Treat "already refunded" as success
    if (message.toLowerCase().includes('already been fully refunded')) {
      return { refundId: null, status: 'already_refunded' };
    }

    const err = new Error(message);
    err.statusCode = error?.statusCode || 500;
    throw err;
  }
};

export const verifyWebhookSignature = (rawBody, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', env.razorpayWebhookSecret)
    .update(rawBody)
    .digest('hex');

  const expected = Buffer.from(expectedSignature, 'hex');
  const received = Buffer.from(signature, 'hex');

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
};

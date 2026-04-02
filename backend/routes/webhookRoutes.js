import { Router } from 'express';
import express from 'express';
import { razorpayWebhook, razorpayCallback, telegramWebhook } from '../controllers/webhookController.js';

const router = Router();

// Razorpay webhook needs raw body for signature verification
router.post('/razorpay', express.raw({ type: 'application/json' }), razorpayWebhook);

// Razorpay payment callback (user is redirected here after payment)
router.get('/razorpay/callback', razorpayCallback);

// Telegram webhook receives JSON
router.post('/telegram', express.json(), telegramWebhook);

export default router;

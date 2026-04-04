import Order from '../models/Order.js';
import GameProfile from '../models/GameProfile.js';
import Shop from '../models/Shop.js';
import { createPaymentLink, createUPIQRCode } from '../services/razorpayService.js';
import { MENU, SIZES, getPrice } from '../config/menu.js';

function validateItemAgainstShop(shop, itemName, size) {
  const menuItem = shop.menu.find((m) => m.name === itemName.toLowerCase() && m.available);
  if (!menuItem) {
    const available = shop.menu.filter((m) => m.available).map((m) => m.name);
    return { error: `Item "${itemName}" not available. Choose from: ${available.join(', ')}` };
  }
  if (!menuItem.sizes[size]) {
    return { error: `Invalid size "${size}". Choose from: small, medium, large` };
  }
  return { price: menuItem.sizes[size].price };
}

function validateItemAgainstGlobal(itemName, size) {
  if (!MENU[itemName]) {
    return { error: `Invalid item. Choose from: ${Object.keys(MENU).join(', ')}` };
  }
  if (!SIZES[size]) {
    return { error: `Invalid size. Choose from: ${Object.keys(SIZES).join(', ')}` };
  }
  return { price: getPrice(itemName, size) };
}

export const createOrder = async (req, res) => {
  try {
    const { shopId, userLocation } = req.body;
    let shop = null;

    if (shopId) {
      shop = await Shop.findById(shopId);
      if (!shop || shop.status !== 'active') {
        return res.status(404).json({ error: 'Shop not found or inactive' });
      }

      // Check operating hours
      if (shop.operatingHours) {
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const { open, close } = shop.operatingHours;
        const isOpen = open <= close
          ? time >= open && time <= close          // same-day: 08:00–22:00
          : time >= open || time <= close;         // overnight: 08:00–04:00
        if (!isOpen) {
          return res.status(400).json({
            error: `Shop is closed. Operating hours: ${open} – ${close}`,
          });
        }
      }
    }

    let orderItems = [];

    // Cart flow: items array provided
    if (Array.isArray(req.body.items) && req.body.items.length > 0) {
      for (const entry of req.body.items) {
        if (!entry.item || !entry.size) {
          return res.status(400).json({ error: 'Each item must have item and size fields' });
        }
        const result = shop
          ? validateItemAgainstShop(shop, entry.item, entry.size)
          : validateItemAgainstGlobal(entry.item, entry.size);

        if (result.error) {
          return res.status(400).json({ error: result.error });
        }
        orderItems.push({ item: entry.item.toLowerCase(), size: entry.size, price: result.price });
      }
    } else {
      // Legacy single-item flow
      const { item, size } = req.body;
      if (!item || !size) {
        return res.status(400).json({ error: 'item and size are required' });
      }
      const result = shop
        ? validateItemAgainstShop(shop, item, size)
        : validateItemAgainstGlobal(item, size);

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }
      orderItems.push({ item: item.toLowerCase(), size, price: result.price });
    }

    const totalPrice = orderItems.reduce((sum, i) => sum + i.price, 0);
    const firstItem = orderItems[0];

    const order = await Order.create({
      item: firstItem.item,
      size: firstItem.size,
      price: firstItem.price,
      items: orderItems,
      totalPrice,
      userId: req.user._id,
      shopId: shop?._id || undefined,
      status: 'pending_payment',
      userLocation: userLocation && userLocation.lat && userLocation.lng
        ? { lat: userLocation.lat, lng: userLocation.lng, address: userLocation.address || req.user.location?.address || '' }
        : req.user.location?.coordinates?.length === 2
          ? { lat: req.user.location.coordinates[1], lng: req.user.location.coordinates[0], address: req.user.location.address || '' }
          : undefined,
    });

    let paymentLinkId, paymentLinkUrl;
    const description =
      orderItems.length === 1
        ? `Coffee Order: ${firstItem.item} (${firstItem.size})${shop ? ` from ${shop.name}` : ''}`
        : `Coffee Order: ${orderItems.length} items${shop ? ` from ${shop.name}` : ''}`;

    try {
      const result = await createPaymentLink({
        amount: totalPrice,
        orderId: order._id.toString(),
        description,
        customerName: req.user.username,
      });
      paymentLinkId = result.paymentLinkId;
      paymentLinkUrl = result.paymentLinkUrl;
    } catch (paymentError) {
      await Order.findByIdAndDelete(order._id);
      console.error('Razorpay payment link error:', paymentError);
      return res.status(502).json({
        error: 'Failed to create payment link. Check Razorpay credentials.',
        details: paymentError.message,
      });
    }

    order.razorpay_order_id = paymentLinkId;

    // Create UPI QR code (non-blocking — fallback to payment link if it fails)
    let qrCodeImageUrl = null;
    try {
      const qrResult = await createUPIQRCode({
        amount: totalPrice,
        orderId: order._id.toString(),
        description,
        customerName: req.user.username,
      });
      order.razorpay_qr_id = qrResult.qrCodeId;
      qrCodeImageUrl = qrResult.qrImageUrl;
    } catch (qrError) {
      console.error('Razorpay QR code creation failed (non-blocking):', qrError.message);
    }

    await order.save();

    res.json({
      orderId: order._id,
      item: firstItem.item,
      size: firstItem.size,
      price: firstItem.price,
      items: orderItems,
      totalPrice,
      shopName: shop?.name || null,
      paymentLink: paymentLinkUrl,
      qrCodeImageUrl,
      message: 'Order created! Complete payment using the link below.',
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
};

export const getStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('shopId', 'name owner')
      .lean();

    if (!order) {
      return res.status(404).json({ error: 'No orders found' });
    }

    let gamification = null;
    try {
      const profile = await GameProfile.findOne({ userId: req.user._id }).lean();
      if (profile) {
        gamification = {
          totalXP: profile.totalXP,
          level: profile.level,
          rank: profile.rank,
          currentStreak: profile.currentStreak,
          longestStreak: profile.longestStreak,
        };
      }
    } catch (err) {
      // non-blocking
    }

    res.json({
      orderId: order._id,
      item: order.item,
      size: order.size,
      price: order.price,
      items: order.items || [{ item: order.item, size: order.size, price: order.price }],
      totalPrice: order.totalPrice || order.price,
      status: order.status,
      eta: order.eta || null,
      refundStatus: order.refund_status || 'none',
      shopName: order.shopId?.name || null,
      shopPhone: order.shopId?.owner?.phone || null,
      createdAt: order.createdAt,
      gamification,
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Failed to get order status' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('shopId', 'name')
      .lean();

    res.json({
      orders: orders.map((o) => ({
        orderId: o._id,
        item: o.item,
        size: o.size,
        price: o.price,
        items: o.items || [{ item: o.item, size: o.size, price: o.price }],
        totalPrice: o.totalPrice || o.price,
        status: o.status,
        refundStatus: o.refund_status || 'none',
        shopName: o.shopId?.name || null,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get order history' });
  }
};

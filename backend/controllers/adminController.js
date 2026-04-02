import Shop from '../models/Shop.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { processRefund } from '../services/razorpayService.js';

// --- Platform Stats ---

export const getPlatformStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [shopStats, totalUsers, orderStats, todayStats] = await Promise.all([
      Shop.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      User.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ['accepted', 'paid', 'rejected'] } } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: {
              $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, { $ifNull: ['$totalPrice', '$price'] }, 0] },
            },
          },
        },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart }, status: { $in: ['accepted', 'paid', 'rejected'] } } },
        {
          $group: {
            _id: null,
            ordersToday: { $sum: 1 },
            revenueToday: {
              $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, { $ifNull: ['$totalPrice', '$price'] }, 0] },
            },
          },
        },
      ]),
    ]);

    const statusCounts = { active: 0, inactive: 0, pending: 0 };
    shopStats.forEach((s) => { statusCounts[s._id] = s.count; });
    const totalShops = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    const od = orderStats[0] || { totalOrders: 0, totalRevenue: 0 };
    const td = todayStats[0] || { ordersToday: 0, revenueToday: 0 };

    res.json({
      totalShops,
      activeShops: statusCounts.active,
      inactiveShops: statusCounts.inactive,
      pendingShops: statusCounts.pending,
      totalUsers,
      totalOrders: od.totalOrders,
      totalRevenue: od.totalRevenue,
      ordersToday: td.ordersToday,
      revenueToday: td.revenueToday,
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// --- Shops ---

export const getShops = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const [shops, total] = await Promise.all([
      Shop.find(filter)
        .select('-owner.password -owner.authToken -owner.authTokenCreatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Shop.countDocuments(filter),
    ]);

    res.json({ shops, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
};

export const getShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .select('-owner.password -owner.authToken -owner.authTokenCreatedAt')
      .lean();

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const orderCount = await Order.countDocuments({ shopId: shop._id });

    res.json({ shop, orderCount });
  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({ error: 'Failed to fetch shop' });
  }
};

export const updateShop = async (req, res) => {
  try {
    const { name, status, operatingHours, telegramChatId, location } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (status !== undefined) {
      if (!['active', 'inactive', 'pending'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updates.status = status;
    }
    if (operatingHours !== undefined) updates.operatingHours = operatingHours;
    if (telegramChatId !== undefined) updates.telegramChatId = telegramChatId;
    if (location !== undefined) updates.location = location;

    const shop = await Shop.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select('-owner.password -owner.authToken -owner.authTokenCreatedAt')
      .lean();

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json({ message: 'Shop updated', shop });
  } catch (error) {
    console.error('Update shop error:', error);
    res.status(500).json({ error: 'Failed to update shop' });
  }
};

export const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    await Order.deleteMany({ shopId: req.params.id });

    res.json({ message: 'Shop and associated orders deleted' });
  } catch (error) {
    console.error('Delete shop error:', error);
    res.status(500).json({ error: 'Failed to delete shop' });
  }
};

// --- Users ---

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) filter.username = { $regex: search, $options: 'i' };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-token')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-token').lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const orderCount = await Order.countDocuments({ userId: user._id });

    res.json({ user, orderCount });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username, phone } = req.body;
    const updates = {};

    if (username !== undefined) updates.username = username;
    if (phone !== undefined) updates.phone = phone;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select('-token')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// --- Orders ---

export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, shopId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (shopId) filter.shopId = shopId;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'username phone')
        .populate('shopId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'username phone')
      .populate('shopId', 'name slug')
      .lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// --- Settlements ---

export const getSettlements = async (req, res) => {
  try {
    // Per-shop settlement summary: total collected, pending settlement, refunds
    const [shopSettlements, refundSummary, pendingOrders] = await Promise.all([
      Order.aggregate([
        { $match: { status: 'accepted', shopId: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: '$shopId',
            totalCollected: { $sum: { $ifNull: ['$totalPrice', '$price'] } },
            orderCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'shops',
            localField: '_id',
            foreignField: '_id',
            as: 'shop',
          },
        },
        { $unwind: '$shop' },
        {
          $project: {
            shopId: '$_id',
            shopName: '$shop.name',
            ownerName: '$shop.owner.name',
            ownerEmail: '$shop.owner.email',
            totalCollected: 1,
            orderCount: 1,
          },
        },
        { $sort: { totalCollected: -1 } },
      ]),
      Order.aggregate([
        { $match: { status: 'rejected' } },
        {
          $group: {
            _id: '$refund_status',
            count: { $sum: 1 },
            total: { $sum: { $ifNull: ['$totalPrice', '$price'] } },
          },
        },
      ]),
      // Orders paid but never acted on (no accept/reject)
      Order.countDocuments({ status: 'paid' }),
    ]);

    const refundStats = { none: { count: 0, total: 0 }, processed: { count: 0, total: 0 }, failed: { count: 0, total: 0 } };
    refundSummary.forEach((r) => {
      if (refundStats[r._id]) {
        refundStats[r._id] = { count: r.count, total: r.total };
      }
    });

    res.json({
      shopSettlements,
      refundStats,
      pendingOrdersCount: pendingOrders,
    });
  } catch (error) {
    console.error('Get settlements error:', error);
    res.status(500).json({ error: 'Failed to fetch settlements' });
  }
};

// Orders that are paid but not accepted/rejected (need attention)
export const getPendingPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { status: 'paid' };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'username phone')
        .populate('shopId', 'name slug')
        .sort({ createdAt: 1 }) // oldest first
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
};

// Orders where refund failed
export const getFailedRefunds = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'rejected', refund_status: 'failed' })
      .populate('userId', 'username phone')
      .populate('shopId', 'name slug')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ orders });
  } catch (error) {
    console.error('Get failed refunds error:', error);
    res.status(500).json({ error: 'Failed to fetch failed refunds' });
  }
};

// Admin can manually trigger refund for a paid order (or retry failed refund)
export const processOrderRefund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.razorpay_payment_id) {
      return res.status(400).json({ error: 'No payment ID found for this order' });
    }

    if (order.refund_status === 'processed') {
      return res.status(400).json({ error: 'Refund already processed' });
    }

    const amount = order.totalPrice || order.price;

    const refund = await processRefund({
      paymentId: order.razorpay_payment_id,
      amount,
    });

    order.refund_status = 'processed';
    order.razorpay_refund_id = refund.refundId;
    if (order.status === 'paid') {
      order.status = 'rejected';
    }
    await order.save();

    res.json({
      message: 'Refund processed successfully',
      refundId: refund.refundId,
      amount,
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ error: error.message || 'Refund failed' });
  }
};

import Order from '../models/Order.js';
import { acceptOrder, rejectOrder } from '../services/orderActionService.js';

// --- Orders ---

export const getOrders = async (req, res) => {
  try {
    const { status = 'paid', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { shopId: req.shop._id };
    if (status !== 'all') {
      filter.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'username phone')
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
    const order = await Order.findOne({
      _id: req.params.orderId,
      shopId: req.shop._id,
    })
      .populate('userId', 'username phone')
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

export const acceptOrderHandler = async (req, res) => {
  try {
    const { eta } = req.body;
    if (!eta || ![5, 10, 15, 20].includes(parseInt(eta))) {
      return res.status(400).json({ error: 'ETA must be 5, 10, 15, or 20 minutes' });
    }

    const result = await acceptOrder(req.params.orderId, req.shop._id, parseInt(eta));

    if (!result.success) {
      return res.status(409).json({ error: result.error });
    }

    res.json({ message: 'Order accepted', order: result.order });
  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({ error: 'Failed to accept order' });
  }
};

export const rejectOrderHandler = async (req, res) => {
  try {
    const result = await rejectOrder(req.params.orderId, req.shop._id);

    if (!result.success) {
      return res.status(409).json({ error: result.error });
    }

    res.json({
      message: 'Order rejected',
      order: result.order,
      refund: result.refundResult,
    });
  } catch (error) {
    console.error('Reject order error:', error);
    res.status(500).json({ error: 'Failed to reject order' });
  }
};

// --- Menu ---

export const getMenu = async (req, res) => {
  try {
    res.json({ menu: req.shop.menu });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
};

export const addMenuItem = async (req, res) => {
  try {
    const { name, description, basePrice, sizes } = req.body;

    if (!name || !basePrice) {
      return res.status(400).json({ error: 'name and basePrice are required' });
    }

    const itemSizes = sizes || {
      small: { price: Math.round(basePrice * 0.8) },
      medium: { price: basePrice },
      large: { price: Math.round(basePrice * 1.2) },
    };

    req.shop.menu.push({
      name,
      description: description || '',
      basePrice,
      sizes: itemSizes,
      available: true,
    });

    await req.shop.save();
    const newItem = req.shop.menu[req.shop.menu.length - 1];
    res.status(201).json({ message: 'Menu item added', item: newItem });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const item = req.shop.menu.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const { name, description, basePrice, sizes, available } = req.body;
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (basePrice !== undefined) {
      item.basePrice = basePrice;
      if (!sizes) {
        item.sizes = {
          small: { price: Math.round(basePrice * 0.8) },
          medium: { price: basePrice },
          large: { price: Math.round(basePrice * 1.2) },
        };
      }
    }
    if (sizes !== undefined) item.sizes = sizes;
    if (available !== undefined) item.available = available;

    await req.shop.save();
    res.json({ message: 'Menu item updated', item });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const item = req.shop.menu.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    item.deleteOne();
    await req.shop.save();
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

export const toggleMenuItemAvailability = async (req, res) => {
  try {
    const item = req.shop.menu.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const { available } = req.body;
    if (typeof available !== 'boolean') {
      return res.status(400).json({ error: 'available must be a boolean' });
    }

    item.available = available;
    await req.shop.save();
    res.json({ message: `Menu item ${available ? 'enabled' : 'disabled'}`, item });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ error: 'Failed to toggle availability' });
  }
};

// --- Shop Status ---

export const updateShopStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Status must be active or inactive' });
    }

    req.shop.status = status;
    await req.shop.save();
    res.json({ message: `Shop is now ${status}`, status });
  } catch (error) {
    console.error('Update shop status error:', error);
    res.status(500).json({ error: 'Failed to update shop status' });
  }
};

// --- Location ---

export const updateShopLocation = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'latitude and longitude are required as numbers' });
    }

    req.shop.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
      address: address || req.shop.location.address || '',
    };

    await req.shop.save();
    res.json({
      message: 'Location updated',
      location: {
        latitude,
        longitude,
        address: req.shop.location.address,
      },
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

export const getShopDetails = async (req, res) => {
  try {
    const shop = req.shop;
    res.json({
      name: shop.name,
      slug: shop.slug,
      status: shop.status,
      operatingHours: shop.operatingHours,
      location: {
        latitude: shop.location.coordinates[1],
        longitude: shop.location.coordinates[0],
        address: shop.location.address,
      },
    });
  } catch (error) {
    console.error('Get shop details error:', error);
    res.status(500).json({ error: 'Failed to fetch shop details' });
  }
};

// --- Operating Hours ---

export const updateOperatingHours = async (req, res) => {
  try {
    const { open, close } = req.body;
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!open || !close) {
      return res.status(400).json({ error: 'open and close times are required' });
    }
    if (!timeRegex.test(open) || !timeRegex.test(close)) {
      return res.status(400).json({ error: 'Times must be in HH:MM format (e.g. 08:00)' });
    }

    req.shop.operatingHours = { open, close };
    await req.shop.save();

    res.json({
      message: 'Operating hours updated',
      operatingHours: req.shop.operatingHours,
    });
  } catch (error) {
    console.error('Update operating hours error:', error);
    res.status(500).json({ error: 'Failed to update operating hours' });
  }
};

// --- Stats ---

export const getStats = async (req, res) => {
  try {
    const shopId = req.shop._id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [allTime, today] = await Promise.all([
      Order.aggregate([
        { $match: { shopId, status: { $in: ['accepted', 'rejected', 'paid'] } } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: {
              $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, { $ifNull: ['$totalPrice', '$price'] }, 0] },
            },
            accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          },
        },
      ]),
      Order.aggregate([
        { $match: { shopId, createdAt: { $gte: todayStart }, status: { $in: ['accepted', 'rejected', 'paid'] } } },
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

    const allTimeData = allTime[0] || { totalOrders: 0, totalRevenue: 0, accepted: 0, rejected: 0 };
    const todayData = today[0] || { ordersToday: 0, revenueToday: 0 };
    const totalDecided = allTimeData.accepted + allTimeData.rejected;

    res.json({
      totalOrders: allTimeData.totalOrders,
      totalRevenue: allTimeData.totalRevenue,
      ordersToday: todayData.ordersToday,
      revenueToday: todayData.revenueToday,
      acceptanceRate: totalDecided > 0 ? Math.round((allTimeData.accepted / totalDecided) * 100) : 0,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

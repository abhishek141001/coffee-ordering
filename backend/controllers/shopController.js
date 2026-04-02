import Shop from '../models/Shop.js';

export const getNearbyShops = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng query params are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistance = parseInt(radius);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid lat/lng values' });
    }

    const shops = await Shop.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'distance',
          maxDistance: maxDistance,
          spherical: true,
          query: { status: 'active' },
        },
      },
      {
        $project: {
          name: 1,
          slug: 1,
          distance: { $round: ['$distance', 0] },
          address: '$location.address',
          operatingHours: 1,
          menuCount: { $size: '$menu' },
        },
      },
      { $sort: { distance: 1 } },
      { $limit: 20 },
    ]);

    res.json({ shops });
  } catch (error) {
    console.error('Get nearby shops error:', error);
    res.status(500).json({ error: 'Failed to fetch nearby shops' });
  }
};

export const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).lean();

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json({ shop });
  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({ error: 'Failed to fetch shop' });
  }
};

export const getShopMenu = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).select('name menu').lean();

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const items = shop.menu
      .filter((item) => item.available)
      .map((item) => ({
        name: item.name,
        description: item.description,
        prices: {
          small: { label: 'Small', price: item.sizes.small.price },
          medium: { label: 'Medium', price: item.sizes.medium.price },
          large: { label: 'Large', price: item.sizes.large.price },
        },
      }));

    res.json({ shopName: shop.name, items, sizes: ['small', 'medium', 'large'] });
  } catch (error) {
    console.error('Get shop menu error:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
};

export const onboardShop = async (req, res) => {
  try {
    const { name, owner, location, menu, telegramChatId, operatingHours } = req.body;

    if (!name || !owner?.name || !owner?.email) {
      return res.status(400).json({ error: 'name, owner.name, and owner.email are required' });
    }

    if (!location?.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ error: 'location.coordinates [lng, lat] is required' });
    }

    if (!telegramChatId) {
      return res.status(400).json({ error: 'telegramChatId is required' });
    }

    if (!menu || !Array.isArray(menu) || menu.length === 0) {
      return res.status(400).json({ error: 'At least one menu item is required' });
    }

    // Validate menu items
    for (const item of menu) {
      if (!item.name || !item.basePrice) {
        return res.status(400).json({ error: 'Each menu item needs a name and basePrice' });
      }
      // Auto-calculate size prices if not provided
      if (!item.sizes) {
        item.sizes = {
          small: { price: Math.round(item.basePrice * 0.8) },
          medium: { price: item.basePrice },
          large: { price: Math.round(item.basePrice * 1.2) },
        };
      }
    }

    const shop = await Shop.create({
      name,
      owner,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address || '',
      },
      menu,
      telegramChatId,
      operatingHours: operatingHours || { open: '08:00', close: '22:00' },
    });

    res.status(201).json({
      message: 'Shop registered successfully!',
      shop: {
        id: shop._id,
        name: shop.name,
        slug: shop.slug,
        status: shop.status,
      },
    });
  } catch (error) {
    console.error('Onboard shop error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A shop with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to register shop', details: error.message });
  }
};

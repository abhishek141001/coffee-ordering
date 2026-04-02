import Shop from '../models/Shop.js';

const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const shopAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const shop = await Shop.findOne({ 'owner.authToken': token });

    if (!shop) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (shop.owner.authTokenCreatedAt &&
        Date.now() - shop.owner.authTokenCreatedAt.getTime() > TOKEN_EXPIRY_MS) {
      shop.owner.authToken = undefined;
      shop.owner.authTokenCreatedAt = undefined;
      await shop.save();
      return res.status(401).json({ error: 'Token expired' });
    }

    req.shop = shop;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export default shopAuthMiddleware;

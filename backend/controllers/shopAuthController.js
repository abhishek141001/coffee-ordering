import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Shop from '../models/Shop.js';

export const signup = async (req, res) => {
  try {
    const { shopName, ownerName, email, password } = req.body;

    if (!shopName || !ownerName || !email || !password) {
      return res.status(400).json({ error: 'Shop name, owner name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await Shop.findOne({ 'owner.email': email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'A shop with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const authToken = crypto.randomUUID();

    const shop = await Shop.create({
      name: shopName,
      owner: {
        name: ownerName,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        authToken,
        authTokenCreatedAt: new Date(),
      },
      location: { type: 'Point', coordinates: [0, 0] },
      menu: [],
      telegramChatId: '',
      status: 'pending',
    });

    res.status(201).json({
      token: authToken,
      shop: {
        id: shop._id,
        name: shop.name,
        slug: shop.slug,
      },
    });
  } catch (error) {
    console.error('Shop signup error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A shop with this name already exists' });
    }
    res.status(500).json({ error: 'Signup failed' });
  }
};

export const setupPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const shop = await Shop.findOne({ 'owner.email': email.trim().toLowerCase() });

    if (!shop) {
      return res.status(404).json({ error: 'No shop found with this email' });
    }

    if (shop.owner.password) {
      return res.status(409).json({ error: 'Password already set. Use login instead.' });
    }

    shop.owner.password = await bcrypt.hash(password, 10);
    await shop.save();

    res.json({ message: 'Password set successfully. You can now log in.' });
  } catch (error) {
    console.error('Setup password error:', error);
    res.status(500).json({ error: 'Failed to set password' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const shop = await Shop.findOne({ 'owner.email': email.trim().toLowerCase() });

    if (!shop) {
      return res.status(404).json({ error: 'No shop found with this email' });
    }

    if (!shop.owner.password) {
      return res.status(400).json({ error: 'Password not set. Please set up your password first.' });
    }

    const valid = await bcrypt.compare(password, shop.owner.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    shop.owner.authToken = crypto.randomUUID();
    shop.owner.authTokenCreatedAt = new Date();
    await shop.save();

    res.json({
      token: shop.owner.authToken,
      shop: {
        id: shop._id,
        name: shop.name,
        slug: shop.slug,
      },
    });
  } catch (error) {
    console.error('Shop login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const exchangeOneTimeToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const shop = await Shop.findOne({ 'owner.oneTimeToken': token });

    if (!shop) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (!shop.owner.oneTimeTokenExpiresAt || shop.owner.oneTimeTokenExpiresAt < new Date()) {
      shop.owner.oneTimeToken = undefined;
      shop.owner.oneTimeTokenExpiresAt = undefined;
      await shop.save();
      return res.status(401).json({ error: 'Token expired' });
    }

    // Clear the one-time token
    shop.owner.oneTimeToken = undefined;
    shop.owner.oneTimeTokenExpiresAt = undefined;

    // Issue a new auth session token
    shop.owner.authToken = crypto.randomUUID();
    shop.owner.authTokenCreatedAt = new Date();
    await shop.save();

    res.json({
      token: shop.owner.authToken,
      shop: {
        id: shop._id,
        name: shop.name,
        slug: shop.slug,
      },
    });
  } catch (error) {
    console.error('OTT exchange error:', error);
    res.status(500).json({ error: 'Token exchange failed' });
  }
};

export const logout = async (req, res) => {
  try {
    req.shop.owner.authToken = undefined;
    req.shop.owner.authTokenCreatedAt = undefined;
    await req.shop.save();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Shop logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

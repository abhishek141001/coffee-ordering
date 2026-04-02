import crypto from 'crypto';
import User from '../models/User.js';
import env from '../config/env.js';

export const generateLocationToken = async (req, res) => {
  try {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    req.user.locationToken = token;
    req.user.locationTokenExpiresAt = expiresAt;
    await req.user.save();

    const baseUrl = env.baseUrl.replace('/api', '');
    const url = `${baseUrl}/locate/${token}`;

    res.json({ locationToken: token, url, expiresAt });
  } catch (error) {
    console.error('Generate location token error:', error);
    res.status(500).json({ error: 'Failed to generate location token' });
  }
};

export const saveLocation = async (req, res) => {
  try {
    const { locationToken, latitude, longitude } = req.body;

    if (!locationToken) {
      return res.status(400).json({ error: 'locationToken is required' });
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'latitude and longitude are required as numbers' });
    }

    const user = await User.findOne({
      locationToken,
      locationTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired location token' });
    }

    user.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
      address: req.body.address || '',
      updatedAt: new Date(),
    };
    user.locationToken = null;
    user.locationTokenExpiresAt = null;
    await user.save();

    res.json({ success: true, location: { latitude, longitude, address: user.location.address } });
  } catch (error) {
    console.error('Save location error:', error);
    res.status(500).json({ error: 'Failed to save location' });
  }
};

export const getLocationStatus = async (req, res) => {
  try {
    const user = req.user;
    const hasLocation = !!(user.location && user.location.coordinates && user.location.coordinates.length === 2);

    if (hasLocation) {
      res.json({
        hasLocation: true,
        location: {
          lat: user.location.coordinates[1],
          lng: user.location.coordinates[0],
          address: user.location.address || '',
        },
      });
    } else {
      res.json({ hasLocation: false, location: null });
    }
  } catch (error) {
    console.error('Get location status error:', error);
    res.status(500).json({ error: 'Failed to get location status' });
  }
};

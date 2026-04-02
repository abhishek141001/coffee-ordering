import crypto from 'crypto';
import User from '../models/User.js';

export const signup = async (req, res) => {
  try {
    const { username, phone } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const existing = await User.findOne({ username: username.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Username already taken. Use login instead.' });
    }

    const token = crypto.randomUUID();

    const user = await User.create({
      username: username.trim().toLowerCase(),
      phone: phone.trim(),
      token,
    });

    res.status(201).json({
      message: 'Account created successfully',
      username: user.username,
      phone: user.phone,
      token: user.token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    res.status(500).json({ error: 'Signup failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: 'User not found. Sign up first.' });
    }

    // Refresh token on each login
    user.token = crypto.randomUUID();
    await user.save();

    res.json({
      message: 'Login successful',
      username: user.username,
      phone: user.phone || null,
      token: user.token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

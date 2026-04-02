import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import AdminSession from '../models/AdminSession.js';
import env from '../config/env.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!env.adminEmail || !env.adminPasswordHash) {
      return res.status(503).json({ error: 'Admin login is not configured' });
    }

    if (email.trim().toLowerCase() !== env.adminEmail.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, env.adminPasswordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = crypto.randomUUID();
    await AdminSession.create({ email: env.adminEmail, token });

    res.json({ token });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    await AdminSession.deleteOne({ token });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

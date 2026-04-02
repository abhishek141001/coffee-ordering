import AdminSession from '../models/AdminSession.js';

const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const session = await AdminSession.findOne({ token });

    if (!session) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (Date.now() - session.createdAt.getTime() > TOKEN_EXPIRY_MS) {
      await AdminSession.deleteOne({ _id: session._id });
      return res.status(401).json({ error: 'Token expired' });
    }

    req.admin = { email: session.email };
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export default adminAuthMiddleware;

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import env from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import shopAuthRoutes from './routes/shopAuthRoutes.js';
import shopDashboardRoutes from './routes/shopDashboardRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Logging
app.use(morgan('dev'));

// CORS
app.use(cors());

// Webhook routes need raw body for signature verification - mount BEFORE json parser
app.use('/webhook', webhookRoutes);

// Parse JSON for all other routes
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/menu', menuRoutes);
app.use('/shops', shopRoutes);
app.use('/order', orderRoutes);
app.use('/shop-auth', shopAuthRoutes);
app.use('/shop-dashboard', shopDashboardRoutes);
app.use('/admin-auth', adminAuthRoutes);
app.use('/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const start = async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Coffee ordering server running on port ${env.port}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

import { Router } from 'express';
import adminAuthMiddleware from '../middleware/adminAuth.js';
import {
  getPlatformStats,
  getShops,
  getShop,
  updateShop,
  deleteShop,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getOrders,
  getOrder,
} from '../controllers/adminController.js';

const router = Router();

router.use(adminAuthMiddleware);

// Stats
router.get('/stats', getPlatformStats);

// Shops
router.get('/shops', getShops);
router.get('/shops/:id', getShop);
router.put('/shops/:id', updateShop);
router.delete('/shops/:id', deleteShop);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Orders
router.get('/orders', getOrders);
router.get('/orders/:id', getOrder);

export default router;

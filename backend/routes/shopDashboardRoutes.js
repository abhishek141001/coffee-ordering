import { Router } from 'express';
import shopAuthMiddleware from '../middleware/shopAuth.js';
import {
  getOrders,
  getOrder,
  acceptOrderHandler,
  rejectOrderHandler,
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  updateShopStatus,
  updateShopLocation,
  getShopDetails,
  getStats,
  updateOperatingHours,
} from '../controllers/shopDashboardController.js';

const router = Router();

router.use(shopAuthMiddleware);

// Orders
router.get('/orders', getOrders);
router.get('/orders/:orderId', getOrder);
router.post('/orders/:orderId/accept', acceptOrderHandler);
router.post('/orders/:orderId/reject', rejectOrderHandler);

// Menu
router.get('/menu', getMenu);
router.post('/menu', addMenuItem);
router.put('/menu/:itemId', updateMenuItem);
router.delete('/menu/:itemId', deleteMenuItem);
router.patch('/menu/:itemId/availability', toggleMenuItemAvailability);

// Shop
router.get('/details', getShopDetails);
router.patch('/status', updateShopStatus);
router.patch('/location', updateShopLocation);
router.patch('/operating-hours', updateOperatingHours);
router.get('/stats', getStats);

export default router;

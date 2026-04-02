import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { createOrder, getStatus, getHistory } from '../controllers/orderController.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createOrder);
router.get('/status', getStatus);
router.get('/history', getHistory);

export default router;

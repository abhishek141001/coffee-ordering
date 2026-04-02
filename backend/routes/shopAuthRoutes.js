import { Router } from 'express';
import { setupPassword, login, logout } from '../controllers/shopAuthController.js';
import shopAuthMiddleware from '../middleware/shopAuth.js';

const router = Router();

router.post('/setup-password', setupPassword);
router.post('/login', login);
router.post('/logout', shopAuthMiddleware, logout);

export default router;

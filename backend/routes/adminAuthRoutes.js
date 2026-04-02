import { Router } from 'express';
import { login, logout } from '../controllers/adminAuthController.js';
import adminAuthMiddleware from '../middleware/adminAuth.js';

const router = Router();

router.post('/login', login);
router.post('/logout', adminAuthMiddleware, logout);

export default router;

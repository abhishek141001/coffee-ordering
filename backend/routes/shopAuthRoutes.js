import { Router } from 'express';
import { signup, setupPassword, login, exchangeOneTimeToken, logout } from '../controllers/shopAuthController.js';
import shopAuthMiddleware from '../middleware/shopAuth.js';

const router = Router();

router.post('/signup', signup);
router.post('/setup-password', setupPassword);
router.post('/login', login);
router.post('/exchange-ott', exchangeOneTimeToken);
router.post('/logout', shopAuthMiddleware, logout);

export default router;

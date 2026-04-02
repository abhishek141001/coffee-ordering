import { Router } from 'express';
import { signup, login } from '../controllers/authController.js';
import { generateLocationToken, saveLocation, getLocationStatus } from '../controllers/locationController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);

// Location capture
router.post('/location-token', authMiddleware, generateLocationToken);
router.post('/location', saveLocation);
router.get('/location-status', authMiddleware, getLocationStatus);

export default router;

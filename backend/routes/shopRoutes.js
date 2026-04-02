import { Router } from 'express';
import { getNearbyShops, getAllShops, getShopById, getShopMenu, onboardShop } from '../controllers/shopController.js';

const router = Router();

router.get('/nearby', getNearbyShops);
router.get('/all', getAllShops);
router.get('/:id', getShopById);
router.get('/:id/menu', getShopMenu);
router.post('/onboard', onboardShop);

export default router;

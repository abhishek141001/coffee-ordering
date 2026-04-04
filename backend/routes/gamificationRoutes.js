import express from 'express';
import auth from '../middleware/auth.js';
import { getMyProfile, getLeaderboardHandler } from '../controllers/gamificationController.js';

const router = express.Router();

router.get('/profile', auth, getMyProfile);
router.get('/leaderboard', getLeaderboardHandler);

export default router;

import { getProfile, getLeaderboard } from '../services/gamificationService.js';

export const getMyProfile = async (req, res) => {
  try {
    const profile = await getProfile(req.user._id);
    res.json(profile);
  } catch (error) {
    console.error('Get gamification profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const getLeaderboardHandler = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const leaderboard = await getLeaderboard(limit);
    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

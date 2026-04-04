import GameProfile from '../models/GameProfile.js';
import User from '../models/User.js';
import { XP, getStreakMultiplier, calculateLevel, ACHIEVEMENTS } from '../config/gamification.js';

function startOfDay(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function daysDiff(a, b) {
  return Math.round((startOfDay(a) - startOfDay(b)) / (1000 * 60 * 60 * 24));
}

export async function getOrCreateProfile(userId) {
  let profile = await GameProfile.findOne({ userId });
  if (!profile) {
    profile = await GameProfile.create({ userId });
  }
  return profile;
}

export async function awardOrderXP(userId, order) {
  const profile = await getOrCreateProfile(userId);
  const today = startOfDay(new Date());
  const breakdown = [];

  // Update order streak
  let streakChanged = true;
  if (!profile.lastOrderDate) {
    profile.currentStreak = 1;
  } else {
    const diff = daysDiff(today, profile.lastOrderDate);
    if (diff === 0) {
      streakChanged = false; // already ordered today
    } else if (diff === 1) {
      profile.currentStreak += 1;
    } else {
      profile.currentStreak = 1;
    }
  }

  if (streakChanged) {
    profile.lastOrderDate = today;
    profile.longestStreak = Math.max(profile.longestStreak, profile.currentStreak);
  }

  const multiplier = getStreakMultiplier(profile.currentStreak);

  // Base order XP
  let baseXP = XP.ORDER_COMPLETE;
  breakdown.push({ reason: 'order', xp: XP.ORDER_COMPLETE });

  // New item bonuses
  const items = order.items || [{ item: order.item, size: order.size }];
  for (const entry of items) {
    const itemName = entry.item.toLowerCase();
    if (!profile.triedItems.includes(itemName)) {
      profile.triedItems.push(itemName);
      baseXP += XP.NEW_ITEM;
      breakdown.push({ reason: `new item: ${itemName}`, xp: XP.NEW_ITEM });
    }
    if (entry.size && !profile.triedSizes.includes(entry.size)) {
      profile.triedSizes.push(entry.size);
    }
  }

  // New shop bonus
  if (order.shopId) {
    const shopIdStr = order.shopId.toString();
    const alreadyTried = profile.triedShops.some((s) => s.toString() === shopIdStr);
    if (!alreadyTried) {
      profile.triedShops.push(order.shopId);
      baseXP += XP.NEW_SHOP;
      breakdown.push({ reason: 'new shop', xp: XP.NEW_SHOP });
    }
  }

  const xpGained = Math.floor(baseXP * multiplier);
  profile.totalXP += xpGained;
  profile.totalOrders += 1;

  // Recalculate level and rank
  const oldLevel = profile.level;
  const levelInfo = calculateLevel(profile.totalXP);
  profile.level = levelInfo.level;
  profile.rank = levelInfo.rank;

  // Check achievements
  const existingKeys = new Set(profile.achievements.map((a) => a.key));
  const newAchievements = [];
  for (const achievement of ACHIEVEMENTS) {
    if (!existingKeys.has(achievement.key) && achievement.check(profile)) {
      profile.achievements.push({ key: achievement.key, unlockedAt: new Date() });
      newAchievements.push({ key: achievement.key, name: achievement.name, description: achievement.description, icon: achievement.icon });
    }
  }

  await profile.save();

  return {
    xpGained,
    breakdown,
    multiplier,
    streak: profile.currentStreak,
    newAchievements,
    levelUp: profile.level > oldLevel ? { from: oldLevel, to: profile.level, rank: profile.rank } : null,
    profile: {
      totalXP: profile.totalXP,
      level: profile.level,
      rank: profile.rank,
      currentStreak: profile.currentStreak,
    },
  };
}

export async function awardLoginXP(userId) {
  const profile = await getOrCreateProfile(userId);
  const today = startOfDay(new Date());

  // Update login streak
  let xpGained = 0;
  if (!profile.lastLoginDate) {
    profile.loginStreak = 1;
    xpGained = XP.LOGIN;
  } else {
    const diff = daysDiff(today, profile.lastLoginDate);
    if (diff === 0) {
      // Already logged in today — no XP
      return {
        xpGained: 0,
        loginStreak: profile.loginStreak,
        newAchievements: [],
        profile: {
          totalXP: profile.totalXP,
          level: profile.level,
          rank: profile.rank,
          loginStreak: profile.loginStreak,
        },
      };
    } else if (diff === 1) {
      profile.loginStreak += 1;
    } else {
      profile.loginStreak = 1;
    }
    const multiplier = getStreakMultiplier(profile.loginStreak);
    xpGained = Math.floor(XP.LOGIN * multiplier);
  }

  profile.lastLoginDate = today;
  profile.totalXP += xpGained;

  const oldLevel = profile.level;
  const levelInfo = calculateLevel(profile.totalXP);
  profile.level = levelInfo.level;
  profile.rank = levelInfo.rank;

  // Check achievements
  const existingKeys = new Set(profile.achievements.map((a) => a.key));
  const newAchievements = [];
  for (const achievement of ACHIEVEMENTS) {
    if (!existingKeys.has(achievement.key) && achievement.check(profile)) {
      profile.achievements.push({ key: achievement.key, unlockedAt: new Date() });
      newAchievements.push({ key: achievement.key, name: achievement.name, description: achievement.description, icon: achievement.icon });
    }
  }

  await profile.save();

  return {
    xpGained,
    loginStreak: profile.loginStreak,
    newAchievements,
    levelUp: profile.level > oldLevel ? { from: oldLevel, to: profile.level, rank: profile.rank } : null,
    profile: {
      totalXP: profile.totalXP,
      level: profile.level,
      rank: profile.rank,
      loginStreak: profile.loginStreak,
    },
  };
}

export async function getProfile(userId) {
  const profile = await getOrCreateProfile(userId);
  const levelInfo = calculateLevel(profile.totalXP);

  // Build full achievement list with unlock status
  const unlockedKeys = new Set(profile.achievements.map((a) => a.key));
  const achievements = ACHIEVEMENTS.map((a) => ({
    key: a.key,
    name: a.name,
    description: a.description,
    icon: a.icon,
    unlocked: unlockedKeys.has(a.key),
    unlockedAt: profile.achievements.find((pa) => pa.key === a.key)?.unlockedAt || null,
  }));

  return {
    totalXP: profile.totalXP,
    level: levelInfo.level,
    rank: levelInfo.rank,
    xpForNext: levelInfo.xpForNext,
    xpNeeded: levelInfo.xpNeeded,
    xpIntoLevel: levelInfo.xpIntoLevel,
    progress: levelInfo.progress,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    loginStreak: profile.loginStreak,
    totalOrders: profile.totalOrders,
    triedItems: profile.triedItems.length,
    triedShops: profile.triedShops.length,
    triedSizes: profile.triedSizes.length,
    achievements,
    achievementCount: profile.achievements.length,
    achievementTotal: ACHIEVEMENTS.length,
  };
}

export async function getLeaderboard(limit = 20, shopId = null) {
  const query = GameProfile.find({ totalXP: { $gt: 0 } })
    .sort({ totalXP: -1 })
    .limit(limit)
    .populate('userId', 'username');

  const profiles = await query.lean();

  return profiles.map((p, i) => ({
    position: i + 1,
    username: p.userId?.username || 'unknown',
    userId: p.userId?._id || p.userId,
    totalXP: p.totalXP,
    level: p.level,
    rank: p.rank,
  }));
}

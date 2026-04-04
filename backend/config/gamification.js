// XP awarded per action
export const XP = {
  ORDER_COMPLETE: 50,
  NEW_ITEM: 15,
  NEW_SHOP: 20,
  LOGIN: 10,
};

// Streak multiplier brackets
export function getStreakMultiplier(streakDays) {
  if (streakDays >= 14) return 3;
  if (streakDays >= 7) return 2;
  if (streakDays >= 3) return 1.5;
  return 1;
}

// Level thresholds: quadratic growth
// L1=0, L2=50, L3=120, L4=210, L5=320, L6=450, L7=602, L8=776, L9=972, L10=1190...
export function xpForLevel(level) {
  if (level <= 1) return 0;
  const n = level - 1;
  return Math.floor(50 * n * (1 + n * 0.1));
}

export function calculateLevel(totalXP) {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXP) {
    level++;
  }
  const currentThreshold = xpForLevel(level);
  const nextThreshold = xpForLevel(level + 1);
  const progress = nextThreshold > currentThreshold
    ? Math.floor(((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
    : 100;

  return {
    level,
    rank: getRank(level),
    xpForNext: nextThreshold,
    xpIntoLevel: totalXP - currentThreshold,
    xpNeeded: nextThreshold - currentThreshold,
    progress,
  };
}

// Rank brackets
export function getRank(level) {
  if (level >= 51) return 'Caffeine Wizard';
  if (level >= 31) return 'Caffeine Commander';
  if (level >= 16) return 'Espresso Elite';
  if (level >= 6) return 'Bean Counter';
  return 'Caffeine Rookie';
}

// Achievement catalog
export const ACHIEVEMENTS = [
  {
    key: 'first_order',
    name: 'First Sip',
    description: 'Complete your first order',
    icon: '☕',
    check: (p) => p.totalOrders >= 1,
  },
  {
    key: 'orders_10',
    name: 'Regular',
    description: 'Complete 10 orders',
    icon: '🔟',
    check: (p) => p.totalOrders >= 10,
  },
  {
    key: 'orders_50',
    name: 'Addict',
    description: 'Complete 50 orders',
    icon: '💊',
    check: (p) => p.totalOrders >= 50,
  },
  {
    key: 'orders_100',
    name: 'Centurion',
    description: 'Complete 100 orders',
    icon: '💯',
    check: (p) => p.totalOrders >= 100,
  },
  {
    key: 'all_sizes',
    name: 'Size Explorer',
    description: 'Try all three sizes',
    icon: '📏',
    check: (p) => ['small', 'medium', 'large'].every((s) => p.triedSizes.includes(s)),
  },
  {
    key: 'shops_3',
    name: 'Shop Hopper',
    description: 'Order from 3 different shops',
    icon: '🏪',
    check: (p) => p.triedShops.length >= 3,
  },
  {
    key: 'shops_10',
    name: 'Shop Crawler',
    description: 'Order from 10 different shops',
    icon: '🗺️',
    check: (p) => p.triedShops.length >= 10,
  },
  {
    key: 'streak_7',
    name: 'Weekly Warrior',
    description: '7-day order streak',
    icon: '🔥',
    check: (p) => p.longestStreak >= 7,
  },
  {
    key: 'streak_30',
    name: 'Monthly Maven',
    description: '30-day order streak',
    icon: '🌟',
    check: (p) => p.longestStreak >= 30,
  },
  {
    key: 'items_5',
    name: 'Menu Explorer',
    description: 'Try 5 different items',
    icon: '📋',
    check: (p) => p.triedItems.length >= 5,
  },
  {
    key: 'xp_1000',
    name: 'XP Hoarder',
    description: 'Earn 1,000 total XP',
    icon: '💰',
    check: (p) => p.totalXP >= 1000,
  },
  {
    key: 'level_10',
    name: 'Double Digits',
    description: 'Reach level 10',
    icon: '🎯',
    check: (p) => p.level >= 10,
  },
];

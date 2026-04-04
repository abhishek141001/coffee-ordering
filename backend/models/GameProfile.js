import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  key: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now },
}, { _id: false });

const gameProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  totalXP: { type: Number, default: 0, index: true },
  level: { type: Number, default: 1 },
  rank: { type: String, default: 'Caffeine Rookie' },

  // Order streak
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastOrderDate: { type: Date, default: null },

  // Login streak
  loginStreak: { type: Number, default: 0 },
  lastLoginDate: { type: Date, default: null },

  // Discovery tracking
  triedItems: [{ type: String }],
  triedShops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }],
  triedSizes: [{ type: String }],

  totalOrders: { type: Number, default: 0 },
  achievements: [achievementSchema],
}, { timestamps: true });

export default mongoose.model('GameProfile', gameProfileSchema);

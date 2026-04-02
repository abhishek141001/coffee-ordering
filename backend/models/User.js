import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    default: '',
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] },
    address: { type: String, default: '' },
    updatedAt: { type: Date },
  },
  locationToken: { type: String },
  locationTokenExpiresAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

export default User;

import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, lowercase: true, trim: true },
  description: { type: String, default: '' },
  basePrice: { type: Number, required: true },
  sizes: {
    small: { price: { type: Number, required: true } },
    medium: { price: { type: Number, required: true } },
    large: { price: { type: Number, required: true } },
  },
  available: { type: Boolean, default: true },
});

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    owner: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
      password: { type: String },
      authToken: { type: String },
      authTokenCreatedAt: { type: Date },
    },
    location: {
      type: { type: String, enum: ['Point'], required: true, default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
      address: { type: String, default: '' },
    },
    menu: [menuItemSchema],
    telegramChatId: { type: String, required: true },
    operatingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
  },
  { timestamps: true }
);

shopSchema.index({ location: '2dsphere' });

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

shopSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = generateSlug(this.name) + '-' + Date.now().toString(36);
  }
  next();
});

const Shop = mongoose.model('Shop', shopSchema);

export default Shop;

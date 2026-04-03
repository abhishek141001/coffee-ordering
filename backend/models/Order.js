import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    item: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    items: [orderItemSchema],
    totalPrice: {
      type: Number,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
    },
    status: {
      type: String,
      enum: ['pending_payment', 'paid', 'accepted', 'rejected'],
      default: 'pending_payment',
    },
    eta: {
      type: Number,
      default: null,
    },
    razorpay_order_id: {
      type: String,
    },
    razorpay_payment_id: {
      type: String,
    },
    refund_status: {
      type: String,
      enum: ['none', 'processed', 'failed'],
      default: 'none',
    },
    razorpay_refund_id: {
      type: String,
    },
    userLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;

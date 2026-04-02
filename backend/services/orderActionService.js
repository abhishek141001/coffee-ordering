import Order from '../models/Order.js';
import { processRefund } from './razorpayService.js';

export async function acceptOrder(orderId, shopId, eta) {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, shopId, status: 'paid' },
    { status: 'accepted', eta },
    { new: true }
  );

  if (!order) {
    const existing = await Order.findById(orderId);
    if (!existing) return { success: false, error: 'Order not found' };
    if (String(existing.shopId) !== String(shopId)) return { success: false, error: 'Order does not belong to this shop' };
    return { success: false, error: `Order already ${existing.status}` };
  }

  return { success: true, order };
}

export async function rejectOrder(orderId, shopId) {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, shopId, status: 'paid' },
    { status: 'rejected' },
    { new: true }
  );

  if (!order) {
    const existing = await Order.findById(orderId);
    if (!existing) return { success: false, error: 'Order not found' };
    if (String(existing.shopId) !== String(shopId)) return { success: false, error: 'Order does not belong to this shop' };
    return { success: false, error: `Order already ${existing.status}` };
  }

  let refundResult = null;
  if (order.razorpay_payment_id) {
    try {
      const refund = await processRefund({
        paymentId: order.razorpay_payment_id,
        amount: order.totalPrice || order.price,
      });
      order.refund_status = 'processed';
      order.razorpay_refund_id = refund.refundId;
      await order.save();
      refundResult = { status: 'processed', refundId: refund.refundId };
    } catch (err) {
      console.error(`Refund failed for rejected order ${orderId}:`, err);
      order.refund_status = 'failed';
      await order.save();
      refundResult = { status: 'failed', error: err.message };
    }
  }

  return { success: true, order, refundResult };
}

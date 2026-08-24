import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { env } from '../config/env.js';
import { validateOrderInput, normalizePhone } from '../utils/validators.js';
import { razorpay, razorpayEnabled, verifyPaymentSignature } from '../utils/razorpay.js';
import { brevoConfigured, sendOrderConfirmationEmail } from '../utils/brevo.js';

function generateOrderNumber() {
  return 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

const VALID_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const CANCELLABLE_STATUSES = ['Pending', 'Processing'];

async function restockOrderItems(order) {
  await Product.bulkWrite(
    order.items.map(item => ({
      updateOne: { filter: { _id: item.product }, update: { $inc: { stock: item.quantity } } }
    }))
  );
}

export async function createOrder(req, res, next) {
  try {
    const body = req.body || {};
    const errors = validateOrderInput(body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] });
    }
    const productIds = body.items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    if (products.length !== new Set(productIds).size) {
      return res.status(400).json({ error: 'One or more products are no longer available.' });
    }
    const items = body.items.map(item => {
      const product = productMap.get(item.product);
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: Number(item.quantity),
        image: product.image
      };
    });
    for (const item of items) {
      const product = productMap.get(String(item.product));
      const available = Number(product?.stock ?? 0);
      if (item.quantity > available) {
        return res.status(400).json({
          error: `Only ${available} units of "${product.name}" are available${available === 0 ? ' (currently out of stock)' : ''}.`
        });
      }
    }
    const decremented = [];
    try {
      for (const item of items) {
        const result = await Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        );
        if (result.matchedCount === 0) {
          throw Object.assign(new Error('Not enough stock to complete the order.'), { status: 409 });
        }
        decremented.push(item);
      }
    } catch (err) {
      await Product.bulkWrite(
        decremented.map(item => ({
          updateOne: { filter: { _id: item.product }, update: { $inc: { stock: item.quantity } } }
        }))
      );
      throw err;
    }
    const subtotal = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
    const shipping = subtotal >= env.FREE_SHIPPING_THRESHOLD ? 0 : env.SHIPPING_FEE;
    const total = Math.round((subtotal + shipping) * 100) / 100;
    const shippingInfo = {
      firstName: body.shippingInfo.firstName.trim(),
      lastName: body.shippingInfo.lastName.trim(),
      email: body.shippingInfo.email.trim().toLowerCase(),
      phone: normalizePhone(body.shippingInfo.phone || ''),
      address: body.shippingInfo.address.trim(),
      city: body.shippingInfo.city.trim(),
      zip: body.shippingInfo.zip.trim()
    };
    const orderNumber = generateOrderNumber();
    const amount = Math.round(total * 100);

    const requestedMethod = body.paymentMethod === 'cod' ? 'cod' : 'online';
    const payByRazorpay = requestedMethod === 'online' && razorpayEnabled;

    let razorpayOrderId = '';
    if (payByRazorpay) {
      const rzpOrder = await razorpay.orders.create({
        amount,
        currency: env.CURRENCY,
        receipt: orderNumber,
        notes: { order: orderNumber }
      });
      razorpayOrderId = rzpOrder.id;
    }

   const order = await Order.create({
     user: req.user ? req.user._id : null,
     orderNumber,
     items,
     subtotal,
     shipping,
     total,
     status: payByRazorpay ? 'Pending' : 'Processing',
     shippingInfo,
     payment: payByRazorpay
       ? { method: 'razorpay', razorpayOrderId, paid: false }
       : requestedMethod === 'cod'
         ? { method: 'cod', paid: false }
         : undefined
   });

    if (brevoConfigured()) {
      sendOrderConfirmationEmail(order).catch(err => {
        console.error(`[order email] failed for ${order.orderNumber}:`, err.message);
      });
    }

    res.status(201).json({
      order: order.toSafeJSON(),
      payment: {
        enabled: razorpayEnabled,
        keyId: env.RAZORPAY_KEY_ID || '',
        orderId: razorpayOrderId,
        amount
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyOrderPayment(req, res, next) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body || {};
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: 'Missing payment details.' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    if (req.user.role !== 'admin' && (!order.user || order.user.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'You do not have access to this order.' });
    }
    if (!razorpayEnabled) {
      return res.status(400).json({ error: 'Online payments are not enabled.' });
    }
    if (order.payment.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ error: 'Payment order mismatch.' });
    }
    if (order.payment.paid) {
      return res.json({ order: order.toSafeJSON() });
    }
    if (!verifyPaymentSignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature })) {
      return res.status(400).json({ error: 'Payment verification failed.' });
    }
    order.payment.paid = true;
    order.payment.method = 'razorpay';
    order.payment.razorpayPaymentId = razorpayPaymentId;
    order.payment.razorpaySignature = razorpaySignature;
    order.payment.paidAt = new Date();
    order.status = 'Processing';
    await order.save();
    res.json({ order: order.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders: orders.map(o => o.toSafeJSON()) });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    if (req.user.role !== 'admin' && (!order.user || order.user.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'You do not have access to this order.' });
    }
    res.json({ order: order.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

export async function listAllOrders(req, res, next) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ orders: orders.map(o => o.toSafeJSON()) });
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    if (req.user.role !== 'admin' && (!order.user || order.user.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'You do not have access to this order.' });
    }
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return res.status(400).json({
        error: order.status === 'Cancelled'
          ? 'This order is already cancelled.'
          : `Orders that are ${order.status.toLowerCase()} can no longer be cancelled.`
      });
    }
    order.status = 'Cancelled';
    await order.save();
    await restockOrderItems(order);
    res.json({ order: order.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    if (order.status !== status) {
      order.status = status;
      await order.save();
      if (status === 'Cancelled') {
        await restockOrderItems(order);
      }
    }
    res.json({ order: order.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

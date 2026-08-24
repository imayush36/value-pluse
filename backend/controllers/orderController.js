const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// Initialize Razorpay (only if keys are provided)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const mongoose = require('mongoose');

// Helper: validate and reserve stock
const validateAndReserveStock = async (items) => {
  for (const item of items) {
    if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
      const product = await Product.findById(item.product);
      if (product) {
        if (!product.isActive) {
          throw new Error(`Product "${item.name}" is no longer available`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Only ${product.stock} unit(s) of "${product.name}" left in stock`);
        }
      }
    }
  }
};

// @desc  Create Razorpay order (backend)
// @route POST /api/orders/razorpay/create
// @access Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  if (!razorpay) {
    res.status(503);
    throw new Error('Razorpay is not configured. Please use COD or contact support.');
  }

  const { amount } = req.body; // amount in paise (INR × 100)

  const options = {
    amount: Math.round(amount * 100), // Convert to paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);
  res.json({ success: true, order });
});

// @desc  Verify Razorpay payment signature
// @route POST /api/orders/razorpay/verify
// @access Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed. Invalid signature.');
  }

  res.json({ success: true, message: 'Payment verified' });
});

// @desc  Place order (COD or after Razorpay verification)
// @route POST /api/orders
// @access Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    deliveryAddress,
    paymentMethod,
    subtotal,
    deliveryCharge = 0,
    discount = 0,
    totalAmount,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  if (!deliveryAddress || !deliveryAddress.fullName) {
    res.status(400);
    throw new Error('Delivery address is required');
  }

  // Validate stock
  await validateAndReserveStock(items);

  // Verify Razorpay signature if payment method is Razorpay
  if (paymentMethod === 'Razorpay') {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400);
      throw new Error('Razorpay payment details are required');
    }

    const sign = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSig !== razorpaySignature) {
      res.status(400);
      throw new Error('Payment verification failed');
    }
  }

  // Estimate delivery
  const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const estimatedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: items.map((i) => ({
      product: i.product,
      name: i.name,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
    })),
    deliveryAddress,
    paymentMethod,
    paymentStatus: paymentMethod === 'Razorpay' ? 'Paid' : 'Pending',
    orderStatus: 'Processing',
    subtotal,
    deliveryCharge,
    discount,
    totalAmount,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    estimatedDelivery,
    statusHistory: [{ status: 'Processing', note: 'Order placed successfully' }],
  });

  // Decrement stock for each item if in DB
  for (const item of items) {
    if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
  }

  // Clear cart if user exists
  if (req.user && req.user._id) {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  }

  try {
    await order.populate('items.product', 'name images thumbnail');
  } catch (popErr) {
    // Non-ObjectId product or population fallback
  }

  res.status(201).json({ success: true, order });
});

// @desc  Get logged-in user's orders
// @route GET /api/orders/my
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const total = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .populate('items.product', 'name thumbnail images slug');

  res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc  Get order by ID
// @route GET /api/orders/:id
// @access Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product', 'name thumbnail images slug rating');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Users can only see their own orders; admins can see all
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, order });
});

// @desc  Cancel order
// @route PUT /api/orders/:id/cancel
// @access Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  if (['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
    res.status(400); throw new Error('Order cannot be cancelled at this stage');
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  order.orderStatus = 'Cancelled';
  order.statusHistory.push({ status: 'Cancelled', note: req.body.reason || 'Cancelled by user' });
  await order.save();

  res.json({ success: true, order });
});

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};

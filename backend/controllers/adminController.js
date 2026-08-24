const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Contact = require('../models/Contact');

// @desc  Get admin dashboard stats
// @route GET /api/admin/stats
// @access Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalOrders,
    totalProducts,
    totalUsers,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    processingOrders,
    salesAgg,
    recentOrders,
    lowStockProducts,
    unreadContacts,
  ] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'user' }),
    Order.countDocuments({ orderStatus: 'Processing' }),
    Order.countDocuments({ orderStatus: 'Delivered' }),
    Order.countDocuments({ orderStatus: 'Cancelled' }),
    Order.countDocuments({ orderStatus: { $in: ['Processing', 'Confirmed', 'Shipped'] } }),
    Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'fullName email'),
    Product.find({ stock: { $lt: 5 }, isActive: true }).select('name stock brand').limit(10),
    Contact.countDocuments({ isRead: false }),
  ]);

  const totalSales = salesAgg[0]?.total || 0;

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalProducts,
      totalUsers,
      totalSales,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      processingOrders,
      unreadContacts,
    },
    recentOrders,
    lowStockProducts,
  });
});

// @desc  Get all orders (admin)
// @route GET /api/admin/orders
// @access Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const query = {};
  if (status && status !== 'all') query.orderStatus = status;

  let orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .populate('user', 'fullName email phone');

  if (search) {
    orders = orders.filter(
      (o) =>
        o.orderId?.includes(search) ||
        o.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = await Order.countDocuments(query);

  res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc  Update order status (admin)
// @route PUT /api/admin/orders/:id/status
// @access Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus, note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  if (orderStatus) {
    order.orderStatus = orderStatus;
    order.statusHistory.push({ status: orderStatus, note: note || `Status updated to ${orderStatus}` });
  }
  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  await order.save();
  res.json({ success: true, order });
});

// @desc  Get all users (admin)
// @route GET /api/admin/users
// @access Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = { role: 'user' };

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc  Block or unblock user (admin)
// @route PUT /api/admin/users/:id/block
// @access Private/Admin
const blockUnblockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role === 'admin') { res.status(403); throw new Error('Cannot block admin users'); }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({ success: true, isBlocked: user.isBlocked, message: user.isBlocked ? 'User blocked' : 'User unblocked' });
});

// @desc  Get all contact messages (admin)
// @route GET /api/admin/contacts
// @access Private/Admin
const getContactMessages = asyncHandler(async (req, res) => {
  const messages = await Contact.find().sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, messages });
});

// @desc  Mark contact as read
// @route PUT /api/admin/contacts/:id/read
// @access Private/Admin
const markContactRead = asyncHandler(async (req, res) => {
  await Contact.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
});

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  blockUnblockUser,
  getContactMessages,
  markContactRead,
};

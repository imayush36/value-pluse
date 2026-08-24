const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper: populate cart product data
const getPopulatedCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name images thumbnail stock isActive');
  return cart;
};

// @desc  Get cart
// @route GET /api/cart
// @access Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await getPopulatedCart(req.user._id);
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  res.json({ success: true, cart });
});

// @desc  Add item to cart
// @route POST /api/cart
// @access Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} item(s) left in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find((i) => i.product.toString() === productId);
  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > product.stock) {
      res.status(400);
      throw new Error(`Only ${product.stock} item(s) available`);
    }
    existingItem.quantity = newQty;
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      image: product.thumbnail || product.images[0] || '',
      price: product.price,
      discountPrice: product.discountPrice || product.price,
      quantity,
      stock: product.stock,
    });
  }

  await cart.save();
  const populated = await getPopulatedCart(req.user._id);
  res.json({ success: true, cart: populated });
});

// @desc  Update cart item quantity
// @route PUT /api/cart/:itemId
// @access Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error('Cart not found'); }

  const item = cart.items.id(req.params.itemId);
  if (!item) { res.status(404); throw new Error('Cart item not found'); }

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  } else {
    const product = await Product.findById(item.product);
    if (product && quantity > product.stock) {
      res.status(400);
      throw new Error(`Only ${product.stock} item(s) available`);
    }
    item.quantity = quantity;
    item.stock = product?.stock || item.stock;
  }

  await cart.save();
  const populated = await getPopulatedCart(req.user._id);
  res.json({ success: true, cart: populated });
});

// @desc  Remove item from cart
// @route DELETE /api/cart/:itemId
// @access Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error('Cart not found'); }

  cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  await cart.save();

  const populated = await getPopulatedCart(req.user._id);
  res.json({ success: true, cart: populated });
});

// @desc  Clear entire cart
// @route DELETE /api/cart
// @access Private
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };

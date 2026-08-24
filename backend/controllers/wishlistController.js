const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');

// @desc  Get user wishlist
// @route GET /api/wishlist
// @access Private
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    'products',
    'name thumbnail images price discountPrice discountPercent rating reviewCount brand category slug stock'
  );

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  res.json({ success: true, wishlist });
});

// @desc  Toggle product in wishlist (add/remove)
// @route POST /api/wishlist/toggle
// @access Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, products: [] });
  }

  const index = wishlist.products.indexOf(productId);
  let action;

  if (index > -1) {
    wishlist.products.splice(index, 1);
    action = 'removed';
  } else {
    wishlist.products.push(productId);
    action = 'added';
  }

  await wishlist.save();

  const populated = await Wishlist.findOne({ user: req.user._id }).populate(
    'products',
    'name thumbnail images price discountPrice discountPercent rating reviewCount brand category slug stock'
  );

  res.json({ success: true, action, wishlist: populated });
});

module.exports = { getWishlist, toggleWishlist };

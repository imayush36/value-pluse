const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc  Get reviews for a product
// @route GET /api/reviews/:productId
// @access Public
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'fullName avatar')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, reviews });
});

// @desc  Add review for a product
// @route POST /api/reviews/:productId
// @access Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;

  if (!rating || !comment) {
    res.status(400);
    throw new Error('Please provide rating and comment');
  }

  // Check if user purchased this product
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    orderStatus: 'Delivered',
  });

  if (!hasPurchased) {
    res.status(403);
    throw new Error('You can only review products you have purchased and received');
  }

  // Check for existing review
  const existingReview = await Review.findOne({ user: req.user._id, product: productId });
  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    order: hasPurchased._id,
    rating: Number(rating),
    comment,
    userName: req.user.fullName,
  });

  const populated = await review.populate('user', 'fullName avatar');
  res.status(201).json({ success: true, review: populated });
});

// @desc  Delete review (admin)
// @route DELETE /api/reviews/:id
// @access Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  await Review.updateProductRating(review.product);
  await review.deleteOne();
  res.json({ success: true, message: 'Review removed' });
});

module.exports = { getProductReviews, addReview, deleteReview };

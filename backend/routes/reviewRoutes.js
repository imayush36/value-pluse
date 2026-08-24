const express = require('express');
const router = express.Router();
const { getProductReviews, addReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/:productId', getProductReviews);
router.post('/:productId', protect, addReview);
router.delete('/:id', protect, admin, deleteReview);

module.exports = router;

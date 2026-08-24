const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, getFeaturedProducts, getProductsByCategory,
  createProduct, updateProduct, deleteProduct, getBrands,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/', getProducts);
router.get('/brands', getBrands);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:identifier', getProduct);

// Admin only
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;

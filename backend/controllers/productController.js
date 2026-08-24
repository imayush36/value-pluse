const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc  Get all products with search, filter, sort, pagination
// @route GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    inStock,
    featured,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const query = { isActive: true };

  // Text search
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { brand: { $regex: keyword, $options: 'i' } },
      { category: { $regex: keyword, $options: 'i' } },
      { sku: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (category && category !== 'all') {
    query.category = { $regex: category, $options: 'i' };
  }

  if (brand && brand !== 'all') {
    query.brand = { $regex: brand, $options: 'i' };
  }

  if (minPrice || maxPrice) {
    query.discountPrice = {};
    if (minPrice) query.discountPrice.$gte = Number(minPrice);
    if (maxPrice) query.discountPrice.$lte = Number(maxPrice);
  }

  if (rating) {
    query.rating = { $gte: Number(rating) };
  }

  if (inStock === 'true') {
    query.stock = { $gt: 0 };
  }

  if (featured === 'true') {
    query.isFeatured = true;
  }

  // Sorting
  let sortOption = { createdAt: -1 };
  switch (sort) {
    case 'price_asc':
      sortOption = { discountPrice: 1 };
      break;
    case 'price_desc':
      sortOption = { discountPrice: -1 };
      break;
    case 'rating':
      sortOption = { rating: -1 };
      break;
    case 'popular':
      sortOption = { reviewCount: -1 };
      break;
    case 'featured':
      sortOption = { isFeatured: -1, createdAt: -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query).sort(sortOption).skip(skip).limit(limitNum);

  res.json({
    success: true,
    products,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
});

// @desc  Get single product by slug or ID
// @route GET /api/products/:identifier
// @access Public
const getProduct = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  let product;

  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(identifier);
  } else {
    product = await Product.findOne({ slug: identifier });
  }

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, product });
});

// @desc  Get featured products
// @route GET /api/products/featured
// @access Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true, stock: { $gt: 0 } })
    .sort({ createdAt: -1 })
    .limit(12);
  res.json({ success: true, products });
});

// @desc  Get products by category
// @route GET /api/products/category/:category
// @access Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { sort, page = 1, limit = 12 } = req.query;

  const query = { category: { $regex: category, $options: 'i' }, isActive: true };

  let sortOption = { isFeatured: -1, createdAt: -1 };
  if (sort === 'price_asc') sortOption = { discountPrice: 1 };
  if (sort === 'price_desc') sortOption = { discountPrice: -1 };
  if (sort === 'rating') sortOption = { rating: -1 };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortOption)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({
    success: true,
    products,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
    category,
  });
});

// @desc  Create product (admin)
// @route POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @desc  Update product (admin)
// @route PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  Object.assign(product, req.body);
  // Recalculate discount percent
  if (product.price && product.discountPrice) {
    product.discountPercent = Math.round(((product.price - product.discountPrice) / product.price) * 100);
  }

  const updated = await product.save();
  res.json({ success: true, product: updated });
});

// @desc  Delete product (admin)
// @route DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  product.isActive = false;
  await product.save();
  res.json({ success: true, message: 'Product removed' });
});

// @desc  Get all unique brands
// @route GET /api/products/brands
// @access Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand', { isActive: true });
  res.json({ success: true, brands: brands.sort() });
});

module.exports = {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
};

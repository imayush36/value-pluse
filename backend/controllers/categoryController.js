const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');

// @desc  Get all categories
// @route GET /api/categories
// @access Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, categories });
});

// @desc  Get single category by slug
// @route GET /api/categories/:slug
// @access Public
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json({ success: true, category });
});

// @desc  Create category (admin)
// @route POST /api/categories
// @access Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, icon, description, image, tag } = req.body;
  const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
  if (exists) {
    res.status(400);
    throw new Error('Category already exists');
  }
  const category = await Category.create({ name, icon, description, image, tag });
  res.status(201).json({ success: true, category });
});

// @desc  Update category (admin)
// @route PUT /api/categories/:id
// @access Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  Object.assign(category, req.body);
  const updated = await category.save();
  res.json({ success: true, category: updated });
});

// @desc  Delete category (admin)
// @route DELETE /api/categories/:id
// @access Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  category.isActive = false;
  await category.save();
  res.json({ success: true, message: 'Category removed' });
});

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };

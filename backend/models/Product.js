const mongoose = require('mongoose');

const specSchema = new mongoose.Schema({
  key: String,
  value: String,
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, unique: true, lowercase: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, default: '' },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    discountPercent: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    images: [{ type: String }],
    thumbnail: { type: String },
    specifications: [specSchema],
    features: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    sku: { type: String, unique: true },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    badge: { type: String, default: '' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Auto-generate slug from name
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-') + '-' + Date.now();
  }
  // Calculate discount percentage
  if (this.price && this.discountPrice) {
    this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  next();
});

// Text index for search
productSchema.index({ name: 'text', brand: 'text', category: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);

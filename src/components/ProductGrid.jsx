import React, { useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS, VALUE_PLUS_CATEGORIES } from '../data/products';
import ProductCard from './ProductCard';
import CategoryTabs from './CategoryTabs';
import Filters from './Filters';
import { Layers, SearchX, Flame } from 'lucide-react';

export default function ProductGrid() {
  const {
    searchQuery,
    selectedCategory,
    selectedBrand,
    sortBy,
    priceRange,
    setSearchQuery,
    setSelectedCategory,
    setSelectedBrand,
  } = useShop();

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Filter by Category or Mega Deals
    if (selectedCategory === 'deals') {
      result = result.filter((p) => p.isDeal);
    } else if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Brand
    if (selectedBrand && selectedBrand !== 'all') {
      result = result.filter(
        (p) => p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.features && p.features.some((f) => f.toLowerCase().includes(q)))
      );
    }

    // Filter by Price
    result = result.filter((p) => p.price <= priceRange);

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        result.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, selectedBrand, sortBy, priceRange]);

  // Current category name for heading
  const currentCategoryObj = VALUE_PLUS_CATEGORIES.find(
    (c) => c.id.toLowerCase() === selectedCategory.toLowerCase()
  );
  const activeCategoryTitle =
    selectedCategory === 'deals'
      ? '🔥 Today\'s Mega Deals & Offers'
      : currentCategoryObj
      ? currentCategoryObj.name
      : 'All Electronics & Appliances';

  return (
    <section id="shop-section" className="section section-alt">
      <div className="container">
        <div className="section-header" style={{ marginBottom: '1.75rem' }}>
          <div className="section-badge">
            {selectedCategory === 'deals' ? (
              <>
                <Flame size={14} color="#e10600" />
                <span>Special Offers</span>
              </>
            ) : (
              <>
                <Layers size={14} />
                <span>Category Catalog</span>
              </>
            )}
          </div>
          <h2 className="section-title">{activeCategoryTitle}</h2>
          <p className="section-desc">
            Click on any category button below to view items instantly. 100% Genuine brand products with GST invoice &amp; doorstep delivery.
          </p>
        </div>

        {/* 1. Category Buttons / Tabs */}
        <CategoryTabs />

        {/* 2. Filters and Search Controls */}
        <Filters totalCount={filteredProducts.length} />

        {/* 3. Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="zero-state">
            <div className="zero-state-icon">
              <SearchX size={54} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              No products found in this category
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
              We couldn't find any products matching your current filters. Try resetting to view all items.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedBrand('all');
              }}
            >
              Show All Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

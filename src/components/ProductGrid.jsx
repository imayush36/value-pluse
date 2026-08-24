import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import ProductCard from './ProductCard';
import CategoryTabs from './CategoryTabs';
import Filters from './Filters';
import SkeletonCard from './SkeletonCard';
import { Layers, SearchX, Flame, ArrowRight } from 'lucide-react';

export default function ProductGrid() {
  const {
    products,
    isLoadingProducts,
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
    let result = [...products];

    // Filter by Category or Mega Deals
    if (selectedCategory === 'deals') {
      result = result.filter((p) => p.isDeal || (p.discount && p.discount.includes('%')));
    } else if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
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
          p.description?.toLowerCase().includes(q) ||
          (p.features && p.features.some((f) => f.toLowerCase().includes(q)))
      );
    }

    // Filter by Price
    result = result.filter((p) => (p.discountPrice || p.price) <= priceRange);

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-high':
        result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'reviews':
        result.sort((a, b) => (b.reviewCount || b.reviews || 0) - (a.reviewCount || a.reviews || 0));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedBrand, sortBy, priceRange]);

  const activeCategoryTitle =
    selectedCategory === 'deals'
      ? "🔥 Today's Mega Deals & Offers"
      : selectedCategory && selectedCategory !== 'all'
      ? selectedCategory
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
        {isLoadingProducts ? (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="product-grid">
              {filteredProducts.slice(0, 12).map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length > 12 && (
              <div className="text-center mt-10">
                <Link
                  to="/shop"
                  className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm inline-flex items-center gap-2 shadow-md transition-all"
                >
                  View All {filteredProducts.length} Products in Store
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="zero-state">
            <div className="zero-state-icon">
              <SearchX size={54} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              No products found matching filters
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

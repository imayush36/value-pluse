import React from 'react';
import { useShop } from '../context/ShopContext';
import { VALUE_PLUS_CATEGORIES, TOP_BRANDS } from '../data/products';
import { Search, RotateCcw, Filter } from 'lucide-react';

export default function Filters({ totalCount }) {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange,
    formatPrice,
  } = useShop();

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSortBy('featured');
    setPriceRange(300000);
  };

  const isFiltered =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    sortBy !== 'featured' ||
    priceRange < 300000;

  return (
    <div className="vp-filter-bar">
      <div className="vp-filter-controls">
        {/* Search Input */}
        <div className="filter-search-input">
          <Search size={17} color="#64748b" />
          <input
            type="text"
            placeholder="Search by brand, model or feature..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ fontSize: '11px', color: '#94a3b8', padding: '0 4px' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <select
          className="filter-category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter by category"
        >
          {VALUE_PLUS_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Brand Dropdown */}
        <select
          className="filter-category-select"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          aria-label="Filter by brand"
        >
          <option value="all">All Brands</option>
          {TOP_BRANDS.map((b) => (
            <option key={b.name} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Sort Dropdown */}
        <select
          className="filter-sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort products"
        >
          <option value="featured">Sort: Featured &amp; Best Sellers</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Customer Rated</option>
          <option value="reviews">Most Reviewed</option>
        </select>

        {isFiltered && (
          <button className="btn btn-secondary btn-sm" onClick={resetFilters} title="Reset all filters">
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>

      <div className="filter-count-badge">
        Showing <strong>{totalCount}</strong> Products in <strong>Value Plus Megastore</strong>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import Pagination from '../components/Pagination';
import { SlidersHorizontal, Grid, Filter, RotateCcw, Search, Sparkles } from 'lucide-react';

export default function ShopPage() {
  const {
    products,
    categories,
    brands,
    isLoadingProducts,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    minRating,
    setMinRating,
    formatPrice,
  } = useShop();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Filter products locally or through state
  const filteredProducts = products.filter((product) => {
    // Category match
    const matchCategory =
      selectedCategory === 'all' ||
      product.category?.toLowerCase() === selectedCategory?.toLowerCase();

    // Brand match
    const matchBrand =
      selectedBrand === 'all' ||
      product.brand?.toLowerCase() === selectedBrand?.toLowerCase();

    // Search keyword
    const matchSearch =
      !searchQuery.trim() ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());

    // Price range
    const price = product.discountPrice || product.price || 0;
    const matchPrice = price <= priceRange;

    // Rating
    const matchRating = (product.rating || 0) >= minRating;

    return matchCategory && matchBrand && matchSearch && matchPrice && matchRating;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discountPrice || a.price || 0;
    const priceB = b.discountPrice || b.price || 0;

    if (sortBy === 'price_asc') return priceA - priceB;
    if (sortBy === 'price_desc') return priceB - priceA;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'popular') return (b.reviewCount || b.reviews || 0) - (a.reviewCount || a.reviews || 0);
    if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    // Featured default
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSearchQuery('');
    setPriceRange(300000);
    setMinRating(0);
    setSortBy('featured');
    setCurrentPage(1);
  };

  return (
    <div className="shop-page-wrapper py-8">
      <div className="container">
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <div className="text-xs text-slate-500 mb-2">Home / Shop All Products</div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="text-primary" size={28} />
                Electronics &amp; Appliances Store
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Showing {sortedProducts.length} premium genuine products with 100% brand warranty
              </p>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl"
              >
                <Filter size={16} /> Filters
              </button>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="featured">Featured / Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Sidebar + Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className={`md:block ${mobileFilterOpen ? 'block' : 'hidden'} md:col-span-1 space-y-6`}>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-primary" />
                  Filter Products
                </div>
                <button
                  onClick={resetFilters}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Categories
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === 'all'
                        ? 'bg-blue-50 text-primary font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>All Products</span>
                    <span className="text-xs text-slate-400">{products.length}</span>
                  </button>
                  {categories.map((cat) => {
                    const count = products.filter((p) => p.category === cat.name || p.category === cat.id).length;
                    const isSelected = selectedCategory === cat.name || selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id || cat._id || cat.name}
                        onClick={() => {
                          setSelectedCategory(cat.name || cat.id);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 text-primary font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs text-slate-400">{count || cat.count || 0}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Brand
                </label>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  <button
                    onClick={() => {
                      setSelectedBrand('all');
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-sm rounded-lg ${
                      selectedBrand === 'all' ? 'bg-blue-50 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Brands
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setSelectedBrand(b);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-lg ${
                        selectedBrand === b ? 'bg-blue-50 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Max Price
                  </label>
                  <span className="text-sm font-bold text-primary">{formatPrice(priceRange)}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="300000"
                  step="2000"
                  value={priceRange}
                  onChange={(e) => {
                    setPriceRange(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>₹1,000</span>
                  <span>₹3,00,000</span>
                </div>
              </div>

              {/* Min Rating */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Minimum Rating
                </label>
                <div className="space-y-1">
                  {[4, 3, 2, 0].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => {
                        setMinRating(stars);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 ${
                        minRating === stars
                          ? 'bg-blue-50 text-primary font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {stars === 0 ? 'Any Rating' : `${stars}★ & above`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="col-span-1 md:col-span-3">
            {isLoadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <SkeletonCard key={n} />
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
                <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Found</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                  We couldn't find any products matching your active filters. Try resetting the filters or searching for something else.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

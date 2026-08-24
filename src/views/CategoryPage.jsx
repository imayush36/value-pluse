import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { ChevronRight, Sparkles, Filter } from 'lucide-react';

export default function CategoryPage() {
  const { category: categoryParam } = useParams();
  const { products, categories, isLoadingProducts, formatPrice } = useShop();
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [sortBy, setSortBy] = useState('featured');

  // Format category name from slug
  const formattedCategory =
    categoryParam
      ?.split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'All';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Filter products matching category name or slug
    const filtered = products.filter((p) => {
      const pCat = p.category?.toLowerCase();
      const pSlug = p.category?.toLowerCase().replace(/\s+/g, '-');
      const target = categoryParam?.toLowerCase();
      return pCat === target || pSlug === target || pCat?.includes(target) || target?.includes(pCat);
    });

    setCategoryProducts(filtered);
  }, [categoryParam, products]);

  // Sort
  const sorted = [...categoryProducts].sort((a, b) => {
    const priceA = a.discountPrice || a.price || 0;
    const priceB = b.discountPrice || b.price || 0;
    if (sortBy === 'price_asc') return priceA - priceB;
    if (sortBy === 'price_desc') return priceB - priceA;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  return (
    <div className="category-page py-8">
      <div className="container">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-primary">Categories</Link>
          <ChevronRight size={12} />
          <span className="text-slate-800 font-semibold">{formattedCategory}</span>
        </div>

        {/* Category Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-primary text-white p-8 rounded-3xl mb-8 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              Value Plus Category
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{formattedCategory}</h1>
            <p className="text-blue-100 text-sm">
              Explore our wide collection of {formattedCategory.toLowerCase()} with genuine manufacturer warranty, fast delivery, and easy EMI options.
            </p>
          </div>
          <Sparkles className="absolute right-8 bottom-4 text-white/10" size={160} />
        </div>

        {/* Sorting & Count Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div className="text-sm text-slate-600">
            Showing <strong className="text-slate-900">{sorted.length}</strong> items in {formattedCategory}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Products in {formattedCategory} Yet</h3>
            <p className="text-slate-500 text-sm mb-6">Check out other categories in our mega electronics catalog.</p>
            <Link
              to="/shop"
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark inline-block transition-all"
            >
              Explore All Categories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sorted.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

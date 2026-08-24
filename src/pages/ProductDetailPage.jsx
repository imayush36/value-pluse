import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { productService } from '../services';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import StarRating from '../components/StarRating';
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight,
  Share2,
  CheckCircle2,
  CreditCard,
  Building2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import gsap from 'gsap';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    products,
    addToCart,
    handleBuyNow,
    toggleWishlist,
    isWishlisted,
    formatPrice,
    deliveryPincode,
    setIsPincodeModalOpen,
  } = useShop();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const mainImgRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);

    // Try finding in local context first
    const foundLocal = products.find(
      (p) =>
        p.slug === slug ||
        p._id === slug ||
        p.id === slug ||
        p.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-') === slug
    );

    if (foundLocal) {
      setProduct(foundLocal);
      setLoading(false);
    } else {
      // Fetch from API
      productService
        .getProduct(slug)
        .then((res) => {
          if (res.data?.success && res.data.product) {
            setProduct(res.data.product);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug, products]);

  // Set document title
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Value Plus Electronics`;
    }
    return () => {
      document.title = 'Value Plus — Electronics & Home Appliances Megastore';
    };
  }, [product]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Product link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleMouseMove = (e) => {
    if (!mainImgRef.current) return;
    const { left, top, width, height } = mainImgRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h2>
        <p className="text-slate-500 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link
          to="/shop"
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark inline-block"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.thumbnail || product.image];
  const prodId = product._id || product.id;
  const wishlisted = isWishlisted(prodId);
  const currentPrice = product.discountPrice || product.price;
  const originalPrice = product.price > currentPrice ? product.price : product.originalPrice || currentPrice;
  const discountPercent =
    product.discountPercent ||
    (originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0);

  // Related products
  const relatedProducts = products
    .filter((p) => p.category === product.category && (p._id || p.id) !== prodId)
    .slice(0, 4);

  return (
    <div className="product-detail-page py-8">
      <div className="container">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <ChevronRight size={12} />
          <Link to={`/category/${product.category?.toLowerCase()}`} className="hover:text-primary">
            {product.category}
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Top Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 md:p-10 rounded-3xl border border-slate-200 shadow-sm mb-12">
          {/* Gallery Col (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Main Image with Zoom View */}
            <div
              ref={mainImgRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              className="relative overflow-hidden bg-slate-50 rounded-2xl border border-slate-200 aspect-square flex items-center justify-center cursor-crosshair group"
            >
              <img
                src={images[selectedImage] || images[0]}
                alt={product.name}
                className={`w-full h-full object-contain p-4 transition-transform duration-200 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                      }
                    : undefined
                }
              />

              {/* Discount Badge */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {discountPercent}% OFF
                </div>
              )}

              {/* Wishlist Floating Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-all ${
                  wishlisted ? 'bg-red-50 text-secondary' : 'bg-white/80 text-slate-600 hover:text-secondary'
                }`}
                aria-label="Save to Wishlist"
              >
                <Heart size={20} className={wishlisted ? 'fill-secondary' : ''} />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-slate-50 shrink-0 p-1 transition-all ${
                      selectedImage === idx ? 'border-primary shadow-md' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Col (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Brand & SKU row */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-blue-50 px-3 py-1 rounded-lg">
                  {product.brand}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">SKU: {product.sku || 'VP-' + (prodId || '').slice(-6)}</span>
                  <button
                    onClick={handleShare}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Share Product"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-3">
                {product.name}
              </h1>

              {/* Rating & Stock row */}
              <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <span className="text-sm font-bold text-amber-700">{product.rating || 4.8}</span>
                    <StarRating rating={product.rating || 4.8} size={14} />
                  </div>
                  <span className="text-xs text-slate-500">
                    ({product.reviewCount || product.reviews || 120} Customer Reviews)
                  </span>
                </div>

                <div className="h-4 w-px bg-slate-200" />

                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      (product.stock ?? 10) > 0 ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      (product.stock ?? 10) > 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {(product.stock ?? 10) > 0
                      ? `In Stock (${product.stock ?? 10} Units Left)`
                      : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Price & Discount */}
              <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-extrabold text-slate-900">
                    {formatPrice(currentPrice)}
                  </span>
                  {originalPrice > currentPrice && (
                    <>
                      <span className="text-lg text-slate-400 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Save {formatPrice(originalPrice - currentPrice)} ({discountPercent}% OFF)
                      </span>
                    </>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1">Inclusive of all taxes &amp; standard GST invoice</div>

                {/* EMI Pill */}
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-blue-900 bg-blue-100/70 px-3 py-1.5 rounded-xl w-fit">
                  <CreditCard size={14} />
                  <span>No Cost EMI available starting from {formatPrice(Math.round(currentPrice / 12))}/month</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Key Features Bullet List */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Key Highlights
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {product.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pincode / Delivery Estimator */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-primary" />
                  <div className="text-xs">
                    <span className="text-slate-500">Deliver to: </span>
                    <strong className="text-slate-800">{deliveryPincode}</strong>
                    <span className="text-emerald-700 ml-1.5 font-semibold">• Express Delivery by Tomorrow</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPincodeModalOpen(true)}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Action Buttons: Quantity, Add to Cart, Buy Now */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2.5 font-bold text-sm text-slate-800 min-w-10 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                    className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <ShoppingBag size={18} />
                  Add to Cart
                </button>

                {/* Buy Now */}
                <button
                  type="button"
                  onClick={() => handleBuyNow(product, quantity)}
                  className="flex-1 w-full py-3.5 px-6 bg-secondary hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Zap size={18} />
                  Buy Now
                </button>
              </div>

              {/* Guarantees Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-slate-500">
                <div className="flex items-center justify-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>100% Genuine</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <RotateCcw size={14} className="text-primary" />
                  <span>7-Day Replacement</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Building2 size={14} className="text-blue-600" />
                  <span>50+ Stores in UP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Table */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm mb-12">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Sparkles size={20} className="text-primary" />
              Technical Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {product.specifications.map((spec, idx) => (
                <div key={idx} className="flex justify-between py-2.5 border-b border-slate-100 text-sm">
                  <span className="font-semibold text-slate-500">{spec.key}</span>
                  <span className="font-medium text-slate-900 text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verified Reviews Section */}
        <ProductReviews
          productId={prodId}
          averageRating={product.rating}
          reviewCount={product.reviewCount || product.reviews}
        />

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Similar {product.category}</h3>
                <p className="text-xs text-slate-500">Customers who viewed this also considered</p>
              </div>
              <Link to={`/category/${product.category?.toLowerCase()}`} className="text-xs font-bold text-primary hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

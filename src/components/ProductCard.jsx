import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Heart, Star, ShoppingBag, Eye, Zap } from 'lucide-react';
import gsap from 'gsap';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const {
    addToCart,
    handleBuyNow,
    toggleWishlist,
    isWishlisted,
    setSelectedProduct,
    formatPrice,
  } = useShop();

  const cardRef = useRef(null);
  const heartRef = useRef(null);

  const prodId = product._id || product.id;
  const isFavorite = isWishlisted(prodId);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    if (heartRef.current) {
      gsap.fromTo(
        heartRef.current,
        { scale: 0.6 },
        { scale: 1.3, duration: 0.25, yoyo: true, repeat: 1, ease: 'back.out(2)' }
      );
    }
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: -3 },
        { y: 0, duration: 0.2, ease: 'power1.out' }
      );
    }
    addToCart(product, 1);
  };

  const openDetails = (e) => {
    if (e) e.stopPropagation();
    setSelectedProduct(product);
    const targetSlug =
      product.slug ||
      prodId ||
      product.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-');
    navigate(`/product/${targetSlug}`);
  };

  const currentPrice = product.discountPrice || product.price;
  const originalPrice = product.price > currentPrice ? product.price : product.originalPrice;
  const discountText =
    product.discount ||
    (originalPrice && originalPrice > currentPrice
      ? `${Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% OFF`
      : null);

  const imgSrc = product.thumbnail || product.images?.[0] || product.image;

  return (
    <div ref={cardRef} className="vp-product-card" onClick={openDetails}>
      {/* Top Image Section */}
      <div className="vp-card-top">
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          className="vp-card-img"
        />

        {/* Badges */}
        <div className="vp-card-badges">
          {discountText && (
            <span className="badge-tag badge-discount">{discountText}</span>
          )}
          {product.badge && (
            <span className="badge-tag badge-featured">{product.badge}</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          ref={heartRef}
          type="button"
          className={`vp-wishlist-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleHeartClick}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={16}
            fill={isFavorite ? '#e11d48' : 'none'}
            color={isFavorite ? '#e11d48' : 'currentColor'}
          />
        </button>

        {/* Quick View Button Hover Pill */}
        <div className="vp-quick-view-overlay">
          <button type="button" className="vp-quick-view-btn" onClick={openDetails}>
            <Eye size={14} />
            Quick View
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="vp-card-body">
        {/* Brand & Category */}
        <div className="vp-card-brand-row">
          <span className="vp-card-brand">{product.brand || 'Value Plus'}</span>
          <span className="vp-card-category">{product.category}</span>
        </div>

        {/* Product Title */}
        <h3 className="vp-card-title" onClick={openDetails} title={product.name}>
          {product.name}
        </h3>

        {/* Ratings & Reviews */}
        <div className="vp-card-rating-row">
          <div className="stars-group">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                fill={i < Math.floor(product.rating || 4.5) ? '#f59e0b' : 'none'}
                color="#f59e0b"
              />
            ))}
          </div>
          <span className="rating-score">{product.rating || 4.8}</span>
          <span className="rating-count">({product.reviewCount || product.reviews || 120} reviews)</span>
        </div>

        {/* Pricing & MRP */}
        <div className="vp-card-price-block">
          <div className="vp-price-main-row">
            <span className="vp-current-price">{formatPrice(currentPrice)}</span>
            {originalPrice && originalPrice > currentPrice && (
              <span className="vp-original-mrp">{formatPrice(originalPrice)}</span>
            )}
          </div>
          {product.emi && (
            <div className="vp-emi-badge">
              <Zap size={11} color="var(--primary)" fill="var(--primary)" />
              <span>EMI from {product.emi}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="vp-card-actions-row">
          <button
            type="button"
            className="btn btn-vp-view"
            onClick={openDetails}
            title="View full specifications"
          >
            <Eye size={14} />
            View Details
          </button>

          <button
            type="button"
            className="btn btn-vp-cart"
            onClick={handleAddToCart}
            title="Add product to shopping cart"
          >
            <ShoppingBag size={14} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

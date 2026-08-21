import React, { useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { Heart, Star, ShoppingBag, Eye, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import gsap from 'gsap';

export default function ProductCard({ product }) {
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

  const isFavorite = isWishlisted(product.id);

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

  const handleBuy = (e) => {
    e.stopPropagation();
    handleBuyNow(product, 1);
  };

  const openDetails = () => {
    setSelectedProduct(product);
  };

  return (
    <div ref={cardRef} className="vp-product-card">
      {/* Top Image Section */}
      <div className="vp-card-top" onClick={openDetails}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="vp-card-img"
        />

        {/* Badges */}
        <div className="vp-card-badges">
          {product.discount && (
            <span className="badge-tag badge-discount">{product.discount}</span>
          )}
          {product.badge && (
            <span className="badge-tag badge-featured">{product.badge}</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          ref={heartRef}
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
          <button className="vp-quick-view-btn" onClick={openDetails}>
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
                fill={i < Math.floor(product.rating) ? '#f59e0b' : 'none'}
                color="#f59e0b"
              />
            ))}
          </div>
          <span className="rating-score">{product.rating}</span>
          <span className="rating-count">({product.reviews} reviews)</span>
        </div>

        {/* Pricing & MRP */}
        <div className="vp-card-price-block">
          <div className="vp-price-main-row">
            <span className="vp-current-price">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="vp-original-mrp">{formatPrice(product.originalPrice)}</span>
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
            className="btn btn-vp-view"
            onClick={openDetails}
            title="View full specifications"
          >
            <Eye size={14} />
            View Details
          </button>

          <button
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

import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  Star,
  ShoppingBag,
  ArrowRight,
  Heart,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Zap,
  MapPin,
  Calendar,
  CreditCard,
  RotateCcw,
  Store,
} from 'lucide-react';
import gsap from 'gsap';

export default function ProductDetails() {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    handleBuyNow,
    toggleWishlist,
    isWishlisted,
    deliveryPincode,
    deliveryCity,
    setIsPincodeModalOpen,
    formatPrice,
  } = useShop();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (selectedProduct) {
      setQuantity(1);
      setActiveImage(selectedProduct.image);

      if (overlayRef.current && modalRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }
        );
        gsap.fromTo(
          modalRef.current,
          { scale: 0.92, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
        );
      }
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const isFavorite = isWishlisted(selectedProduct.id);
  const gallery = selectedProduct.gallery || [selectedProduct.image];

  const handleClose = () => {
    if (overlayRef.current && modalRef.current) {
      gsap.to(modalRef.current, { scale: 0.95, opacity: 0, duration: 0.25 });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.25,
        onComplete: () => setSelectedProduct(null),
      });
    } else {
      setSelectedProduct(null);
    }
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
  };

  const handleBuy = () => {
    handleBuyNow(selectedProduct, quantity);
    setSelectedProduct(null);
  };

  const savingsAmount = selectedProduct.originalPrice
    ? selectedProduct.originalPrice - selectedProduct.price
    : 0;

  return (
    <div
      ref={overlayRef}
      className="modal-backdrop"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="details-modal vp-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="modal-close-btn"
          onClick={handleClose}
          aria-label="Close product details"
        >
          <X size={20} />
        </button>

        <div className="details-grid">
          {/* Gallery View */}
          <div className="details-gallery">
            <div className="details-main-img">
              <img
                src={activeImage || selectedProduct.image}
                alt={selectedProduct.name}
              />
            </div>

            {gallery.length > 1 && (
              <div className="details-thumbs">
                {gallery.map((imgUrl, index) => (
                  <div
                    key={index}
                    className={`thumb-item ${activeImage === imgUrl ? 'active' : ''}`}
                    onClick={() => setActiveImage(imgUrl)}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}

            {/* Value Plus Store Guarantees */}
            <div className="vp-details-guarantee-box">
              <div className="guarantee-line">
                <ShieldCheck size={18} color="var(--accent-emerald)" />
                <span>100% Genuine Brand Warranty + GST Invoice</span>
              </div>
              <div className="guarantee-line">
                <Truck size={18} color="var(--primary)" />
                <span>Free Express Delivery &amp; Safe Unboxing</span>
              </div>
              <div className="guarantee-line">
                <RotateCcw size={18} color="var(--accent-amber)" />
                <span>7 Days Hassle-Free Replacement Guarantee</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="details-info">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="vp-card-brand" style={{ fontSize: '0.875rem' }}>
                {selectedProduct.brand || 'Value Plus'}
              </span>
              <span className="badge-tag badge-featured" style={{ fontSize: '0.75rem' }}>
                {selectedProduct.category}
              </span>
            </div>

            <h2 className="vp-details-title">
              {selectedProduct.name}
            </h2>

            {/* Rating */}
            <div className="product-rating-row" style={{ marginBottom: '1rem' }}>
              <div className="stars-group">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.floor(selectedProduct.rating) ? '#f59e0b' : 'none'}
                    color="#f59e0b"
                  />
                ))}
              </div>
              <span className="rating-score">{selectedProduct.rating}</span>
              <span className="rating-count">({selectedProduct.reviews} Verified Customer Reviews)</span>
            </div>

            {/* Pricing Breakdown */}
            <div className="vp-details-price-box">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem' }}>
                <span className="vp-details-current-price">
                  {formatPrice(selectedProduct.price)}
                </span>
                {selectedProduct.originalPrice && (
                  <span className="vp-details-original-mrp">
                    MRP {formatPrice(selectedProduct.originalPrice)}
                  </span>
                )}
                {selectedProduct.discount && (
                  <span className="badge-tag badge-discount">{selectedProduct.discount}</span>
                )}
              </div>
              {savingsAmount > 0 && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--accent-emerald)', fontWeight: '700', marginTop: '0.25rem' }}>
                  You Save: {formatPrice(savingsAmount)} (Inclusive of all taxes)
                </div>
              )}
              {selectedProduct.emi && (
                <div className="vp-details-emi-chip">
                  <CreditCard size={14} color="var(--primary)" />
                  <span>{selectedProduct.emi} with Zero Downpayment</span>
                </div>
              )}
            </div>

            {/* Pincode Delivery Check */}
            <div className="vp-details-pincode-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  <MapPin size={16} color="var(--primary)" />
                  <span>Deliver to: <strong>{deliveryPincode}</strong> ({deliveryCity})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPincodeModalOpen(true)}
                  style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: '700', textDecoration: 'underline' }}
                >
                  Change
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>
                <Calendar size={14} />
                <span>Standard Delivery in 24 - 48 Hours | Cash on Delivery available</span>
              </div>
            </div>

            {/* Description */}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: '1.6', margin: '1rem 0' }}>
              {selectedProduct.description}
            </p>

            {/* Key Features List */}
            {selectedProduct.features && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                  Key Features &amp; Specifications:
                </h4>
                <ul className="details-features-list">
                  {selectedProduct.features.map((feat, idx) => (
                    <li key={idx} className="details-feature-item">
                      <CheckCircle2 size={16} color="var(--accent-emerald)" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="vp-details-actions-bar">
              <div className="qty-control">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <div className="qty-display">{quantity}</div>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(selectedProduct.stock || 10, q + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                className="btn btn-primary"
                style={{ flexGrow: 1, padding: '0.85rem 1.25rem', fontSize: '0.9375rem' }}
                onClick={handleAddToCart}
              >
                <ShoppingBag size={18} />
                Add to Cart ({formatPrice(selectedProduct.price * quantity)})
              </button>

              <button
                className="btn btn-secondary"
                style={{ padding: '0.85rem 1.25rem' }}
                onClick={handleBuy}
              >
                Buy Now
                <ArrowRight size={16} />
              </button>

              <button
                className={`btn btn-secondary ${isFavorite ? 'active' : ''}`}
                style={{ padding: '0.85rem' }}
                onClick={() => toggleWishlist(selectedProduct)}
                title={isFavorite ? 'Saved in Wishlist' : 'Add to Wishlist'}
              >
                <Heart
                  size={20}
                  fill={isFavorite ? '#e11d48' : 'none'}
                  color={isFavorite ? '#e11d48' : 'currentColor'}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import ProductCard from './ProductCard';
import {
  ArrowLeft,
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
  ChevronRight,
  Share2,
  Check,
  Award,
  Sparkles,
} from 'lucide-react';

export default function ProductPage() {
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
    showToast,
    setSelectedCategory,
  } = useShop();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'reviews' | 'warranty'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (selectedProduct) {
      setActiveImage(selectedProduct.image);
      setQuantity(1);
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const isFavorite = isWishlisted(selectedProduct.id);
  const gallery = selectedProduct.gallery || [selectedProduct.image];

  const handleBackToStore = () => {
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
  };

  const handleBuy = () => {
    handleBuyNow(selectedProduct, quantity);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('🔗 Product link copied to clipboard!');
    } else {
      showToast('Product URL ready to share!');
    }
  };

  const savingsAmount = selectedProduct.originalPrice
    ? selectedProduct.originalPrice - selectedProduct.price
    : 0;

  // Similar Products in the same category
  const similarProducts = PRODUCTS.filter(
    (p) => p.category === selectedProduct.category && p.id !== selectedProduct.id
  ).slice(0, 4);

  return (
    <div className="product-page-wrapper">
      <div className="container">
        {/* Breadcrumbs & Back Navigation */}
        <div className="product-page-breadcrumb-bar">
          <button
            type="button"
            className="btn-back-to-store"
            onClick={handleBackToStore}
          >
            <ArrowLeft size={16} />
            <span>Back to All Products</span>
          </button>

          <nav className="product-breadcrumbs" aria-label="Breadcrumb">
            <span className="crumb-item" onClick={handleBackToStore}>Home</span>
            <ChevronRight size={13} color="var(--text-muted)" />
            <span
              className="crumb-item"
              onClick={() => {
                setSelectedCategory(selectedProduct.category);
                handleBackToStore();
              }}
            >
              {selectedProduct.category}
            </span>
            <ChevronRight size={13} color="var(--text-muted)" />
            <span className="crumb-item active">{selectedProduct.brand || 'Product'}</span>
          </nav>
        </div>

        {/* Main Product Showcase Section */}
        <div className="product-page-grid">
          {/* Left Column: Gallery & Badges */}
          <div className="product-page-gallery-col">
            <div className="product-page-main-img-box">
              <img
                src={activeImage || selectedProduct.image}
                alt={selectedProduct.name}
                className="product-page-main-img"
              />

              {/* Wishlist Button */}
              <button
                type="button"
                className={`product-page-wish-btn ${isFavorite ? 'active' : ''}`}
                onClick={() => toggleWishlist(selectedProduct)}
                title={isFavorite ? 'Saved in Wishlist' : 'Add to Wishlist'}
                aria-label="Wishlist"
              >
                <Heart
                  size={20}
                  fill={isFavorite ? '#e11d48' : 'none'}
                  color={isFavorite ? '#e11d48' : 'currentColor'}
                />
              </button>

              {/* Badges */}
              <div className="product-page-badges">
                {selectedProduct.discount && (
                  <span className="badge-tag badge-discount">{selectedProduct.discount}</span>
                )}
                {selectedProduct.badge && (
                  <span className="badge-tag badge-featured">{selectedProduct.badge}</span>
                )}
              </div>
            </div>

            {/* Thumbnail selector */}
            {gallery.length > 1 && (
              <div className="product-page-thumbs-row">
                {gallery.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className={`page-thumb-box ${activeImage === imgUrl ? 'active' : ''}`}
                    onClick={() => setActiveImage(imgUrl)}
                  >
                    <img src={imgUrl} alt={`Angle ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}

            {/* Value Plus Store Guarantees Banner */}
            <div className="product-page-trust-card">
              <div className="trust-card-row">
                <ShieldCheck size={20} color="var(--accent-emerald)" />
                <div>
                  <strong>100% Genuine Brand Warranty</strong>
                  <span>Direct brand authorization with GST tax invoice</span>
                </div>
              </div>

              <div className="trust-card-row">
                <Truck size={20} color="var(--primary)" />
                <div>
                  <strong>Express Doorstep Delivery</strong>
                  <span>Insured &amp; verified transit from nearest UP store</span>
                </div>
              </div>

              <div className="trust-card-row">
                <RotateCcw size={20} color="var(--accent-amber)" />
                <div>
                  <strong>7-Day Replacement Guarantee</strong>
                  <span>Hassle-free replacement for any transit defect</span>
                </div>
              </div>

              <div className="trust-card-row">
                <Store size={20} color="var(--primary)" />
                <div>
                  <strong>50+ Physical Stores in UP &amp; NCR</strong>
                  <span>Store pickup &amp; live brand demos available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Purchase Controls */}
          <div className="product-page-info-col">
            <div className="product-page-brand-line">
              <span className="brand-tag-pill">{selectedProduct.brand || 'Value Plus'}</span>
              <span className="category-tag-sub">{selectedProduct.category}</span>
              <button className="share-btn" onClick={handleShare} title="Share product link">
                <Share2 size={15} />
                <span>Share</span>
              </button>
            </div>

            <h1 className="product-page-title">{selectedProduct.name}</h1>

            {/* Ratings & Reviews */}
            <div className="product-page-rating-row">
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
              <span className="rating-divider">•</span>
              <span className="rating-reviews-text">{selectedProduct.reviews} Verified Customer Ratings</span>
              <span className="rating-divider">•</span>
              <span className="stock-in-hand">
                <Check size={14} color="var(--accent-emerald)" />
                In Stock ({selectedProduct.stock} units available)
              </span>
            </div>

            {/* Price Box */}
            <div className="product-page-price-card">
              <div className="price-main-display">
                <span className="current-price-huge">{formatPrice(selectedProduct.price)}</span>
                {selectedProduct.originalPrice && (
                  <span className="original-mrp-strike">
                    MRP {formatPrice(selectedProduct.originalPrice)}
                  </span>
                )}
                {selectedProduct.discount && (
                  <span className="badge-tag badge-discount">{selectedProduct.discount}</span>
                )}
              </div>

              {savingsAmount > 0 && (
                <div className="savings-highlight-text">
                  🎉 You Save {formatPrice(savingsAmount)} on this order! (Inclusive of all taxes)
                </div>
              )}

              {/* No-Cost EMI Chip */}
              {selectedProduct.emi && (
                <div className="emi-options-box">
                  <div className="emi-header">
                    <CreditCard size={16} color="var(--primary)" />
                    <strong>No Cost EMI Available</strong>
                  </div>
                  <div className="emi-details">
                    Pay only <strong>{selectedProduct.emi}</strong> on major credit cards &amp; Bajaj Finserv. Zero downpayment.
                  </div>
                </div>
              )}
            </div>

            {/* Pincode Location Check */}
            <div className="product-page-pincode-card">
              <div className="pincode-header-row">
                <div className="pincode-left">
                  <MapPin size={18} color="var(--primary)" />
                  <span>Delivery to: <strong>{deliveryPincode}</strong> ({deliveryCity})</span>
                </div>
                <button
                  type="button"
                  className="btn-change-pin"
                  onClick={() => setIsPincodeModalOpen(true)}
                >
                  Change Pincode
                </button>
              </div>
              <div className="pincode-estimate-text">
                <Calendar size={15} color="var(--accent-emerald)" />
                <span>
                  <strong>Standard Delivery by Tomorrow</strong> | Free Shipping on orders over ₹999
                </span>
              </div>
            </div>

            {/* Key Specifications Bullet points */}
            {selectedProduct.features && (
              <div className="product-page-features-block">
                <h3 className="features-block-title">Key Highlights &amp; Specs:</h3>
                <ul className="features-bullet-list">
                  {selectedProduct.features.map((feat, index) => (
                    <li key={index} className="feature-bullet-item">
                      <CheckCircle2 size={16} color="var(--accent-emerald)" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Bar (Quantity, Add to Cart, Buy Now) */}
            <div className="product-page-actions-box">
              <div className="qty-control-large">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                >
                  -
                </button>
                <div className="qty-display">{quantity}</div>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(selectedProduct.stock || 10, q + 1))}
                  aria-label="Increase"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg btn-add-cart-page"
                onClick={handleAddToCart}
              >
                <ShoppingBag size={20} />
                Add to Cart ({formatPrice(selectedProduct.price * quantity)})
              </button>

              <button
                type="button"
                className="btn btn-deal btn-lg btn-buy-now-page"
                onClick={handleBuy}
              >
                Buy Now
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Tabs Section (Full Specifications & Reviews) */}
        <div className="product-page-tabs-section">
          <div className="tabs-nav-bar">
            <button
              type="button"
              className={`tab-nav-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Technical Specifications
            </button>
            <button
              type="button"
              className={`tab-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Customer Reviews ({selectedProduct.reviews})
            </button>
            <button
              type="button"
              className={`tab-nav-btn ${activeTab === 'warranty' ? 'active' : ''}`}
              onClick={() => setActiveTab('warranty')}
            >
              Warranty &amp; Installation
            </button>
          </div>

          <div className="tab-content-panel">
            {activeTab === 'specs' && (
              <div className="specs-table-container">
                <table className="specs-table">
                  <tbody>
                    <tr>
                      <th>Brand</th>
                      <td>{selectedProduct.brand || 'Value Plus'}</td>
                    </tr>
                    <tr>
                      <th>Model &amp; Name</th>
                      <td>{selectedProduct.name}</td>
                    </tr>
                    <tr>
                      <th>Category</th>
                      <td>{selectedProduct.category}</td>
                    </tr>
                    <tr>
                      <th>Product Description</th>
                      <td>{selectedProduct.description}</td>
                    </tr>
                    <tr>
                      <th>Warranty</th>
                      <td>1 Year Comprehensive + Additional Brand Compressor/Panel Warranty</td>
                    </tr>
                    <tr>
                      <th>In The Box</th>
                      <td>1x {selectedProduct.name}, User Manual, Power Adapter/Cable, Warranty Card</td>
                    </tr>
                    <tr>
                      <th>Country of Origin</th>
                      <td>India / Global Manufacturing</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-panel-box">
                <div className="reviews-summary-card">
                  <div className="score-big">{selectedProduct.rating}</div>
                  <div>
                    <div className="stars-group">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
                      Based on {selectedProduct.reviews} verified buyer ratings
                    </div>
                  </div>
                </div>

                <div className="review-comment-item">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <strong>Verified Value Plus Buyer (Noida, UP)</strong>
                    <div className="stars-group">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                    “Exceptional product performance! Ordered from Value Plus website with same-day express delivery. Packaging was top-notch with original seal and GST invoice.”
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'warranty' && (
              <div className="warranty-panel-box">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                  <Award size={32} color="var(--primary)" />
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.35rem' }}>
                      Official Manufacturer Brand Warranty
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                      Every appliance and electronic gadget sold on Value Plus carries an authentic manufacturer warranty honored at all authorized service centers across India.
                    </p>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-alt)', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <strong>Free Demo &amp; Installation:</strong> For large appliances (LED TVs, ACs, Washing Machines, Refrigerators), a certified brand technician will visit your location within 24 to 48 hours of delivery for free professional installation.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Recommended Products Section */}
        {similarProducts.length > 0 && (
          <div className="similar-products-section">
            <div className="section-header" style={{ textAlign: 'left', margin: '0 0 2rem 0' }}>
              <div className="section-badge">
                <Sparkles size={14} />
                <span>You May Also Like</span>
              </div>
              <h2 className="section-title">Similar {selectedProduct.category}</h2>
            </div>

            <div className="product-grid">
              {similarProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

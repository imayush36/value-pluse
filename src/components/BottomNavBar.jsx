import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { VALUE_PLUS_CATEGORIES } from '../data/products';
import {
  Home,
  Grid3X3,
  ShoppingBag,
  Heart,
  Package,
  X,
  Smartphone,
  Tv,
  Wind,
  Refrigerator,
  WashingMachine,
  Laptop,
  Headphones,
  UtensilsCrossed,
  Watch,
  Sparkles,
  ChevronRight,
  Flame,
} from 'lucide-react';

const iconMap = {
  Sparkles,
  Smartphone,
  Tv,
  Wind,
  Refrigerator,
  WashingMachine,
  Laptop,
  Headphones,
  UtensilsCrossed,
  Watch,
};

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    cartCount,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsOrdersModalOpen,
    setSelectedCategory,
    setSelectedProduct,
    setSearchQuery,
  } = useShop();
  const { currentUser, openAuthModal } = useAuth();

  const [showCategorySheet, setShowCategorySheet] = useState(false);

  const handleHome = () => {
    setSelectedProduct(null);
    setSearchQuery('');
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowCategorySheet(false);
  };

  const handleCategorySelect = (catId) => {
    setSelectedProduct(null);
    setSelectedCategory(catId);
    setSearchQuery('');
    setShowCategorySheet(false);
    if (catId === 'all') {
      navigate('/shop');
    } else {
      navigate(`/category/${catId.toLowerCase()}`);
    }
  };

  const handleOrdersClick = () => {
    setShowCategorySheet(false);
    if (currentUser) {
      navigate('/orders');
    } else {
      setIsOrdersModalOpen(true);
    }
  };

  const isHomeActive = location.pathname === '/';

  return (
    <>
      {/* Bottom Sticky Navigation Bar */}
      <nav className="mobile-bottom-nav" role="navigation" aria-label="Bottom navigation">
        {/* Home */}
        <button
          type="button"
          className={`bottom-nav-btn ${isHomeActive ? 'active' : ''}`}
          onClick={handleHome}
          aria-label="Home"
        >
          <span className="bottom-nav-icon">
            <Home size={22} />
          </span>
          <span className="bottom-nav-label">Home</span>
        </button>

        {/* Categories */}
        <button
          type="button"
          className={`bottom-nav-btn ${showCategorySheet || location.pathname.includes('/category') ? 'active' : ''}`}
          onClick={() => setShowCategorySheet((v) => !v)}
          aria-label="Categories"
        >
          <span className="bottom-nav-icon">
            <Grid3X3 size={22} />
          </span>
          <span className="bottom-nav-label">Categories</span>
        </button>

        {/* Cart (Centre Prominent) */}
        <button
          type="button"
          className="bottom-nav-btn bottom-nav-cart-cta"
          onClick={() => {
            setIsCartOpen(true);
            setShowCategorySheet(false);
          }}
          aria-label="Cart"
        >
          <span className="bottom-nav-cart-icon-wrap">
            <ShoppingBag size={24} />
            {cartCount > 0 && <span className="bottom-cart-badge">{cartCount}</span>}
          </span>
          <span className="bottom-nav-label" style={{ color: '#ffffff' }}>
            Cart
          </span>
        </button>

        {/* Wishlist */}
        <button
          type="button"
          className="bottom-nav-btn"
          onClick={() => {
            setIsWishlistOpen(true);
            setShowCategorySheet(false);
          }}
          aria-label="Wishlist"
        >
          <span className="bottom-nav-icon" style={{ position: 'relative' }}>
            <Heart size={22} />
            {wishlist.length > 0 && <span className="bottom-nav-mini-badge">{wishlist.length}</span>}
          </span>
          <span className="bottom-nav-label">Wishlist</span>
        </button>

        {/* Orders */}
        <button
          type="button"
          className={`bottom-nav-btn ${location.pathname === '/orders' ? 'active' : ''}`}
          onClick={handleOrdersClick}
          aria-label="My Orders"
        >
          <span className="bottom-nav-icon">
            <Package size={22} />
          </span>
          <span className="bottom-nav-label">Orders</span>
        </button>
      </nav>

      {/* Category Bottom Sheet */}
      {showCategorySheet && (
        <>
          <div className="bottom-sheet-backdrop" onClick={() => setShowCategorySheet(false)} />

          <div className="bottom-category-sheet">
            <div className="sheet-drag-handle" />

            <div className="sheet-header">
              <h2 className="sheet-title">Shop by Category</h2>
              <button
                type="button"
                className="sheet-close-btn"
                onClick={() => setShowCategorySheet(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="sheet-categories-list">
              {/* All Products */}
              <button
                type="button"
                className="sheet-cat-row"
                onClick={() => handleCategorySelect('all')}
              >
                <span className="sheet-cat-icon-box" style={{ background: '#eff6ff', color: '#0a6cdc' }}>
                  <Sparkles size={20} />
                </span>
                <div className="sheet-cat-info">
                  <span className="sheet-cat-name">All Products</span>
                  <span className="sheet-cat-sub">Browse full store catalog</span>
                </div>
                <ChevronRight size={16} color="var(--text-light)" />
              </button>

              {VALUE_PLUS_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                const Icon = iconMap[cat.icon] || Sparkles;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    className="sheet-cat-row"
                    onClick={() => handleCategorySelect(cat.id)}
                  >
                    <span className="sheet-cat-icon-box">
                      <Icon size={20} />
                    </span>
                    <div className="sheet-cat-info">
                      <span className="sheet-cat-name">{cat.name}</span>
                      <span className="sheet-cat-sub">
                        {cat.count} products · {cat.tag}
                      </span>
                    </div>
                    <ChevronRight size={16} color="var(--text-light)" />
                  </button>
                );
              })}

              {/* Mega Deals */}
              <button
                type="button"
                className="sheet-cat-row sheet-cat-deals"
                onClick={() => handleCategorySelect('deals')}
              >
                <span className="sheet-cat-icon-box" style={{ background: '#fff1f2', color: '#e10600' }}>
                  <Flame size={20} />
                </span>
                <div className="sheet-cat-info">
                  <span className="sheet-cat-name" style={{ color: '#e10600' }}>
                    🔥 Mega Deals
                  </span>
                  <span className="sheet-cat-sub">Exclusive limited-time discounts</span>
                </div>
                <ChevronRight size={16} color="#e10600" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

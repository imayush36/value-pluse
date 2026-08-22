// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { VALUE_PLUS_CATEGORIES, PRODUCTS } from '../data/products';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  Package,
  MapPin,
  Phone,
  Store,
  ChevronDown,
  ArrowRight,
  UserRound,
} from 'lucide-react';
import gsap from 'gsap';

export default function Navbar() {
  const {
    cartCount,
    cartSubtotal,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsOrdersModalOpen,
    setIsPincodeModalOpen,
    deliveryPincode,
    deliveryCity,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedProduct,
    setSelectedProduct,
    formatPrice,
    setIsAuthModalOpen,
    isAuthenticated,
    currentUser,
  } = useShop();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchCategoryFilter, setSearchCategoryFilter] = useState('all');
  const navRef = useRef(null);
  const cartIconRef = useRef(null);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
      );
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (cartCount > 0 && cartIconRef.current) {
      gsap.fromTo(
        cartIconRef.current,
        { scale: 0.8 },
        { scale: 1.25, duration: 0.2, yoyo: true, repeat: 1, ease: 'back.out(2)' }
      );
    }
  }, [cartCount]);

  const scrollToSection = (id) => {
    setShowSearchDropdown(false);
    setSelectedProduct(null);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (catId) => {
    setSelectedProduct(null);
    setSelectedCategory(catId);
    setSearchQuery('');
    const element = document.getElementById('shop-section');
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const searchResults = searchQuery.trim()
    ? PRODUCTS.filter((p) => {
        const q = searchQuery.toLowerCase();
        const matchCat = searchCategoryFilter === 'all' || p.category === searchCategoryFilter;
        const matchText =
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        return matchCat && matchText;
      }).slice(0, 5)
    : [];

  return (
    <header ref={navRef} className={`navbar-wrapper ${isScrolled ? 'navbar-scrolled' : ''}`}>

      {/* ── TOP UTILITY BAR (desktop only) ── */}
      <div className="top-utility-bar">
        <div className="container top-utility-inner">
          <div className="top-announcement">
            <span className="live-dot" />
            <span>
              <strong>Value Plus Megastore:</strong> Same-Day Express Delivery in UP &amp; NCR | 100% Genuine Brand Warranty
            </span>
          </div>
          <div className="top-utility-links">
            <button type="button" className="top-link-btn" onClick={() => setIsPincodeModalOpen(true)}>
              <MapPin size={13} color="var(--primary)" />
              <span>Deliver to: <strong>{deliveryPincode}</strong> ({deliveryCity})</span>
              <ChevronDown size={12} />
            </button>
            <a href="tel:18001238258" className="top-link-btn">
              <Phone size={13} color="var(--primary)" />
              <span>1800-123-VALUE</span>
            </a>
            <button type="button" className="top-link-btn" onClick={() => scrollToSection('why-us-section')}>
              <Store size={13} color="var(--primary)" />
              <span>50+ Stores</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN HEADER BAR ── */}
      <div className="main-header-bar">
        <div className="container">
          <div className="main-header-inner">

            {/* Logo */}
            <a
              href="#home"
              className="nav-brand-vp"
              onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}
            >
              <div className="brand-logo-badge">
                <span className="brand-text-value">VALUE</span>
                <span className="brand-text-plus">PLUS</span>
              </div>
              <span className="brand-subtext">ELECTRONICS MEGASTORE</span>
            </a>

            {/* Search Bar (desktop) */}
            <div className="header-search-container">
              <div className="header-search-box">
                <select
                  value={searchCategoryFilter}
                  onChange={(e) => setSearchCategoryFilter(e.target.value)}
                  className="search-cat-dropdown"
                  aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  <option value="Mobiles">Mobiles</option>
                  <option value="Televisions">LED TVs</option>
                  <option value="Air Conditioners">ACs</option>
                  <option value="Refrigerators">Refrigerators</option>
                  <option value="Washing Machines">Washing Machines</option>
                  <option value="Laptops">Laptops</option>
                  <option value="Audio">Audio</option>
                  <option value="Kitchen">Kitchen</option>
                </select>

                <input
                  type="text"
                  placeholder="Search TVs, iPhones, ACs, Laptops..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="search-main-input"
                />
                {searchQuery && (
                  <button className="search-clear-btn" onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}>✕</button>
                )}
                <button className="search-submit-btn" onClick={() => scrollToSection('shop-section')} aria-label="Search">
                  <Search size={18} />
                </button>
              </div>

              {showSearchDropdown && searchResults.length > 0 && (
                <div className="search-predictive-dropdown">
                  <div className="search-dropdown-header">
                    <span>Results for "{searchQuery}"</span>
                    <button onClick={() => setShowSearchDropdown(false)}>Close</button>
                  </div>
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="search-predictive-item"
                      onClick={() => { setSelectedProduct(item); setShowSearchDropdown(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    >
                      <img src={item.image} alt={item.name} />
                      <div className="search-item-info">
                        <div className="search-item-name">{item.name}</div>
                        <div className="search-item-price-row">
                          <span className="search-item-price">{formatPrice(item.price)}</span>
                          {item.discount && <span className="search-item-discount">{item.discount}</span>}
                        </div>
                      </div>
                      <ArrowRight size={14} color="var(--primary)" />
                    </div>
                  ))}
                  <div className="search-view-all" onClick={() => { setShowSearchDropdown(false); scrollToSection('shop-section'); }}>
                    View all results for "{searchQuery}" →
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Actions (hidden on mobile — bottom bar handles those) */}
            <div className="header-actions-group">
              <button className="header-action-item" onClick={() => setIsAuthModalOpen(true)} title="Account">
                <UserRound size={20} />
                <div className="action-text-block">
                  <span className="action-sub">{isAuthenticated ? 'Hi' : 'Sign in'}</span>
                  <span className="action-main">{isAuthenticated ? currentUser.fullName.split(' ')[0] : 'Account'}</span>
                </div>
              </button>

              <button className="header-action-item" onClick={() => setIsOrdersModalOpen(true)} title="My Orders">
                <Package size={20} />
                <div className="action-text-block">
                  <span className="action-sub">Track</span>
                  <span className="action-main">Orders</span>
                </div>
              </button>

              <button className="header-action-item" onClick={() => setIsWishlistOpen(true)} title="Wishlist">
                <div className="icon-with-badge">
                  <Heart size={20} />
                  {wishlist.length > 0 && <span className="action-counter-badge">{wishlist.length}</span>}
                </div>
                <div className="action-text-block">
                  <span className="action-sub">Saved</span>
                  <span className="action-main">Wishlist</span>
                </div>
              </button>

              <button
                ref={cartIconRef}
                className="header-action-item cart-action-pill"
                onClick={() => setIsCartOpen(true)}
                title="Cart"
              >
                <div className="icon-with-badge">
                  <ShoppingBag size={20} />
                  {cartCount > 0 && <span className="action-counter-badge">{cartCount}</span>}
                </div>
                <div className="action-text-block">
                  <span className="action-sub">My Cart</span>
                  <span className="action-main">{cartSubtotal > 0 ? formatPrice(cartSubtotal) : '₹0'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar (visible only on mobile, below logo row) */}
          <div className="mobile-search-row">
            <div className="header-search-box mobile-search-box">
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                onFocus={() => setShowSearchDropdown(true)}
                className="search-main-input"
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}>✕</button>
              )}
              <button className="search-submit-btn" onClick={() => scrollToSection('shop-section')} aria-label="Search">
                <Search size={18} />
              </button>
            </div>
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="search-predictive-dropdown">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="search-predictive-item"
                    onClick={() => { setSelectedProduct(item); setShowSearchDropdown(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    <img src={item.image} alt={item.name} />
                    <div className="search-item-info">
                      <div className="search-item-name">{item.name}</div>
                      <div className="search-item-price-row">
                        <span className="search-item-price">{formatPrice(item.price)}</span>
                        {item.discount && <span className="search-item-discount">{item.discount}</span>}
                      </div>
                    </div>
                    <ArrowRight size={14} color="var(--primary)" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CATEGORY NAV BAR (desktop only) ── */}
      <div className="category-nav-bar">
        <div className="container">
          <div className="category-nav-inner">
            <button
              className={`cat-nav-item cat-nav-all ${selectedCategory === 'all' && !selectedProduct ? 'active' : ''}`}
              onClick={() => handleSelectCategory('all')}
            >
              <Menu size={16} /><span>All Categories</span>
            </button>
            <div className="cat-nav-scroll-list">
              {[
                ['Mobiles', 'Mobiles & Tablets'],
                ['Televisions', 'Televisions'],
                ['Air Conditioners', 'Air Conditioners'],
                ['Refrigerators', 'Refrigerators'],
                ['Washing Machines', 'Washing Machines'],
                ['Laptops', 'Laptops'],
                ['Audio', 'Audio & Soundbars'],
                ['Kitchen', 'Kitchen'],
                ['Wearables', 'Wearables'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={`cat-nav-item ${selectedCategory === id ? 'active' : ''}`}
                  onClick={() => handleSelectCategory(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

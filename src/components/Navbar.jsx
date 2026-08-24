import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
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
  User,
  LogOut,
  Sparkles,
  Shield,
  LayoutDashboard,
} from 'lucide-react';
import gsap from 'gsap';

export default function Navbar() {
  const navigate = useNavigate();
  const {
    products,
    categories,
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
    setSelectedProduct,
    formatPrice,
  } = useShop();

  const {
    currentUser,
    isAdmin,
    openAuthModal,
    openAccountModal,
    logout,
  } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchCategoryFilter, setSearchCategoryFilter] = useState('all');
  const navRef = useRef(null);
  const cartIconRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setShowSearchDropdown(false);
    const slug =
      product.slug ||
      product._id ||
      product.id ||
      product.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-');
    navigate(`/product/${slug}`);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSearchDropdown(false);
    navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
  };

  const searchResults = searchQuery.trim()
    ? products.filter((p) => {
        const q = searchQuery.toLowerCase();
        const matchCat =
          searchCategoryFilter === 'all' ||
          p.category?.toLowerCase() === searchCategoryFilter.toLowerCase();
        const matchText =
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q);
        return matchCat && matchText;
      }).slice(0, 5)
    : [];

  const userFirstName = currentUser ? currentUser.fullName.split(' ')[0] : '';
  const userInitials = currentUser
    ? currentUser.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

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
            <Link to="/about" className="top-link-btn">
              <Store size={13} color="var(--primary)" />
              <span>50+ Stores</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── MAIN HEADER BAR ── */}
      <div className="main-header-bar">
        <div className="container">
          <div className="main-header-inner">
            {/* Logo */}
            <Link to="/" className="nav-brand-vp">
              <div className="brand-logo-badge">
                <span className="brand-text-value">VALUE</span>
                <span className="brand-text-plus">PLUS</span>
              </div>
              <span className="brand-subtext">ELECTRONICS MEGASTORE</span>
            </Link>

            {/* Search Bar (desktop) */}
            <div className="header-search-container">
              <form onSubmit={handleSearchSubmit} className="header-search-box">
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
                  <option value="Wearables">Wearables</option>
                </select>

                <input
                  type="text"
                  placeholder="Search TVs, iPhones, ACs, Laptops..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="search-main-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchDropdown(false);
                    }}
                  >
                    ✕
                  </button>
                )}
                <button type="submit" className="search-submit-btn" aria-label="Search">
                  <Search size={18} />
                </button>
              </form>

              {showSearchDropdown && searchResults.length > 0 && (
                <div className="search-predictive-dropdown">
                  <div className="search-dropdown-header">
                    <span>Results for "{searchQuery}"</span>
                    <button onClick={() => setShowSearchDropdown(false)}>Close</button>
                  </div>
                  {searchResults.map((item) => (
                    <div
                      key={item._id || item.id}
                      className="search-predictive-item"
                      onClick={() => handleSelectProduct(item)}
                    >
                      <img src={item.thumbnail || item.images?.[0] || item.image} alt={item.name} />
                      <div className="search-item-info">
                        <div className="search-item-name">{item.name}</div>
                        <div className="search-item-price-row">
                          <span className="search-item-price">{formatPrice(item.discountPrice || item.price)}</span>
                          {item.discount && <span className="search-item-discount">{item.discount}</span>}
                        </div>
                      </div>
                      <ArrowRight size={14} color="var(--primary)" />
                    </div>
                  ))}
                  <div
                    className="search-view-all"
                    onClick={() => {
                      setShowSearchDropdown(false);
                      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
                    }}
                  >
                    View all results for "{searchQuery}" →
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="header-actions-group">
              {/* Account Dropdown / Sign In Button */}
              {currentUser ? (
                <div className="header-user-dropdown-wrap" ref={userDropdownRef}>
                  <button
                    type="button"
                    className="header-action-item user-logged-pill"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    title="Account Settings"
                  >
                    <div className="nav-user-avatar">{userInitials}</div>
                    <div className="action-text-block">
                      <span className="action-sub">Hi, {userFirstName}</span>
                      <span className="action-main" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        Account <ChevronDown size={12} />
                      </span>
                    </div>
                  </button>

                  {showUserDropdown && (
                    <div className="nav-user-dropdown-menu">
                      <div className="nav-dropdown-user-header">
                        <div className="dropdown-avatar">{userInitials}</div>
                        <div className="dropdown-user-meta">
                          <strong>{currentUser.fullName}</strong>
                          <span>{currentUser.phone ? `+91 ${currentUser.phone}` : currentUser.email}</span>
                          <div className="dropdown-member-badge">
                            <Sparkles size={11} />
                            <span>{isAdmin ? 'Admin Account' : 'Verified Member'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="nav-dropdown-links">
                        {isAdmin && (
                          <button
                            type="button"
                            className="nav-dropdown-item font-bold text-primary bg-blue-50"
                            onClick={() => {
                              setShowUserDropdown(false);
                              navigate('/admin/dashboard');
                            }}
                          >
                            <LayoutDashboard size={16} />
                            <span>Admin Control Panel</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className="nav-dropdown-item"
                          onClick={() => {
                            setShowUserDropdown(false);
                            openAccountModal('profile');
                          }}
                        >
                          <User size={16} />
                          <span>My Profile</span>
                        </button>

                        <button
                          type="button"
                          className="nav-dropdown-item"
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate('/orders');
                          }}
                        >
                          <Package size={16} />
                          <span>My Orders</span>
                        </button>

                        <button
                          type="button"
                          className="nav-dropdown-item"
                          onClick={() => {
                            setShowUserDropdown(false);
                            openAccountModal('addresses');
                          }}
                        >
                          <MapPin size={16} />
                          <span>Saved Addresses</span>
                        </button>

                        <button
                          type="button"
                          className="nav-dropdown-item"
                          onClick={() => {
                            setShowUserDropdown(false);
                            setIsWishlistOpen(true);
                          }}
                        >
                          <Heart size={16} />
                          <span>Saved Wishlist ({wishlist.length})</span>
                        </button>

                        <button
                          type="button"
                          className="nav-dropdown-item"
                          onClick={() => {
                            setShowUserDropdown(false);
                            openAccountModal('security');
                          }}
                        >
                          <Shield size={16} />
                          <span>Security &amp; Password</span>
                        </button>

                        <div className="nav-dropdown-divider" />

                        <button
                          type="button"
                          className="nav-dropdown-item text-danger"
                          onClick={() => {
                            setShowUserDropdown(false);
                            logout();
                          }}
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className="header-action-item header-signin-btn"
                  onClick={() => openAuthModal('login')}
                  title="Sign In or Register"
                >
                  <User size={20} />
                  <div className="action-text-block">
                    <span className="action-sub">Welcome</span>
                    <span className="action-main">Sign In</span>
                  </div>
                </button>
              )}

              <button
                type="button"
                className="header-action-item"
                onClick={() => {
                  if (currentUser) {
                    navigate('/orders');
                  } else {
                    setIsOrdersModalOpen(true);
                  }
                }}
                title="My Orders"
              >
                <Package size={20} />
                <div className="action-text-block">
                  <span className="action-sub">Track</span>
                  <span className="action-main">Orders</span>
                </div>
              </button>

              <button
                type="button"
                className="header-action-item"
                onClick={() => setIsWishlistOpen(true)}
                title="Wishlist"
              >
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
                type="button"
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

          {/* Mobile Search Bar */}
          <div className="mobile-search-row">
            <form onSubmit={handleSearchSubmit} className="header-search-box mobile-search-box">
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="search-main-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchDropdown(false);
                  }}
                >
                  ✕
                </button>
              )}
              <button type="submit" className="search-submit-btn" aria-label="Search">
                <Search size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── CATEGORY NAV BAR ── */}
      <div className="category-nav-bar">
        <div className="container">
          <div className="category-nav-inner">
            <Link to="/shop" className="cat-nav-item cat-nav-all">
              <Menu size={16} />
              <span>All Products &amp; Categories</span>
            </Link>
            <div className="cat-nav-scroll-list">
              {[
                ['mobiles', 'Mobiles & Tablets'],
                ['televisions', 'Televisions'],
                ['air-conditioners', 'Air Conditioners'],
                ['refrigerators', 'Refrigerators'],
                ['washing-machines', 'Washing Machines'],
                ['laptops', 'Laptops'],
                ['audio', 'Audio & Soundbars'],
                ['kitchen', 'Kitchen Appliances'],
                ['wearables', 'Smartwatches & Fitness'],
              ].map(([slug, label]) => (
                <Link
                  key={slug}
                  to={`/category/${slug}`}
                  className="cat-nav-item"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

import React, { useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

export default function WishlistDrawer() {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    toggleWishlist,
    addToCart,
    setSelectedProduct,
  } = useShop();

  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isWishlistOpen) {
      if (overlayRef.current && drawerRef.current) {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(
          drawerRef.current,
          { x: '100%' },
          { x: '0%', duration: 0.4, ease: 'power3.out' }
        );
      }
    }
  }, [isWishlistOpen]);

  const handleClose = () => {
    if (overlayRef.current && drawerRef.current) {
      gsap.to(drawerRef.current, { x: '100%', duration: 0.3, ease: 'power3.in' });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => setIsWishlistOpen(false),
      });
    } else {
      setIsWishlistOpen(false);
    }
  };

  const handleMoveToCart = (item) => {
    addToCart(item, 1);
    toggleWishlist(item);
  };

  if (!isWishlistOpen) return null;

  return (
    <div className="drawer-overlay" ref={overlayRef} onClick={handleClose}>
      <div
        className="cart-drawer"
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Heart size={20} color="#e11d48" fill="#e11d48" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Saved Wishlist ({wishlist.length})
            </h3>
          </div>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Close wishlist">
            <X size={18} />
          </button>
        </div>

        {/* Wishlist Items */}
        {wishlist.length > 0 ? (
          <div className="cart-items-list">
            {wishlist.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div
                  className="cart-item-img"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    handleClose();
                    setSelectedProduct(item);
                  }}
                >
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="cart-item-details">
                  <h4
                    className="cart-item-name"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      handleClose();
                      setSelectedProduct(item);
                    }}
                  >
                    {item.name}
                  </h4>
                  <div className="cart-item-price">${item.price}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleMoveToCart(item)}
                    >
                      <ShoppingBag size={13} />
                      Move to Cart
                    </button>

                    <button
                      onClick={() => toggleWishlist(item)}
                      style={{ color: 'var(--text-light)', padding: '6px', border: '1px solid var(--border-default)', borderRadius: '6px' }}
                      title="Remove from wishlist"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#e11d48' }}>
              <Heart size={32} />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.4rem' }}>
              Your wishlist is empty
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '260px' }}>
              Tap the heart icon on any gadget you love to save it here for later.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                handleClose();
                const el = document.getElementById('shop-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Discover Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Zap,
} from 'lucide-react';
import gsap from 'gsap';

export default function CartDrawer() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const {
    cart,
    cartCount,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    setIsCheckoutOpen,
    formatPrice,
    showToast,
  } = useShop();

  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isCartOpen) {
      if (overlayRef.current && drawerRef.current) {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(
          drawerRef.current,
          { x: '100%' },
          { x: '0%', duration: 0.4, ease: 'power3.out' }
        );
      }
    }
  }, [isCartOpen]);

  const handleClose = () => {
    if (overlayRef.current && drawerRef.current) {
      gsap.to(drawerRef.current, { x: '100%', duration: 0.3, ease: 'power3.in' });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => setIsCartOpen(false),
      });
    } else {
      setIsCartOpen(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setIsCartOpen(false);
      showToast('Please register or log in with OTP before proceeding to checkout', 'info');
      openAuthModal('register');
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  if (!isCartOpen) return null;

  // Free shipping threshold = ₹999
  const freeShippingGoal = 999;
  const progressPercent = Math.min(100, (cartSubtotal / freeShippingGoal) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingGoal - cartSubtotal);
  const deliveryFee = cartSubtotal >= freeShippingGoal || cartSubtotal === 0 ? 0 : 99;
  const grandTotal = cartSubtotal + deliveryFee;

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
            <ShoppingBag size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Value Plus Shopping Bag ({cartCount})
            </h3>
          </div>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        {cart.length > 0 && (
          <div className="free-ship-bar">
            <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Truck size={15} color="var(--primary)" />
              {remainingForFreeShipping === 0 ? (
                <span style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>
                  🎉 You unlocked FREE Value Plus Express Shipping!
                </span>
              ) : (
                <span>
                  Add <strong>{formatPrice(remainingForFreeShipping)}</strong> more for <strong>FREE Shipping</strong>
                </span>
              )}
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        )}

        {/* Items List */}
        {cart.length > 0 ? (
          <div className="cart-items-list">
            {cart.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div className="cart-item-img">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="cart-item-details">
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>
                    {item.brand || item.category}
                  </div>
                  <h4 className="cart-item-name">{item.name}</h4>
                  <div className="cart-item-price">{formatPrice(item.price)}</div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem' }}>
                    {/* Quantity Controls */}
                    <div className="qty-control" style={{ transform: 'scale(0.85)', transformOrigin: 'left' }}>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, -1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <div className="qty-display">{item.quantity}</div>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{ color: 'var(--text-light)', padding: '4px', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#e11d48')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-light)')}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--text-light)' }}>
              <ShoppingBag size={32} />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.4rem' }}>
              Your cart is empty
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '260px' }}>
              Discover hot deals on electronics &amp; appliances to add them here!
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                handleClose();
                const el = document.getElementById('shop-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Products
            </button>
          </div>
        )}

        {/* Footer with Calculations */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-calc-row">
              <span>Subtotal:</span>
              <strong>{formatPrice(cartSubtotal)}</strong>
            </div>

            <div className="cart-calc-row">
              <span>Estimated Delivery:</span>
              <span>{deliveryFee === 0 ? <strong style={{ color: 'var(--accent-emerald)' }}>FREE</strong> : formatPrice(deliveryFee)}</span>
            </div>

            <div className="cart-calc-total">
              <span>Total Payable:</span>
              <span style={{ color: 'var(--primary)' }}>{formatPrice(grandTotal)}</span>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
              onClick={handleProceedToCheckout}
            >
              Proceed to Buy ({formatPrice(grandTotal)})
              <ArrowRight size={16} />
            </button>

            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
              onClick={handleClose}
            >
              Continue Shopping
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <ShieldCheck size={14} color="var(--accent-emerald)" />
              <span>100% Genuine Brand Product Guarantee</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

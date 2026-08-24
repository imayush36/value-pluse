// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { Check, ShoppingBag, Package, Calendar, ArrowRight, Truck, MapPin } from 'lucide-react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

export default function OrderSuccess() {
  const {
    isOrderSuccessOpen,
    setIsOrderSuccessOpen,
    lastPlacedOrder,
    setIsOrdersModalOpen,
    formatPrice,
  } = useShop();

  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const circleRef = useRef(null);
  const checkSvgRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOrderSuccessOpen && lastPlacedOrder) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#0a6cdc', '#10b981', '#f59e0b', '#e11d48', '#6366f1'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
        });
      }, 350);

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
        .fromTo(
          modalRef.current,
          { scale: 0.85, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4 }
        )
        .fromTo(
          circleRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.8)' },
          '-=0.2'
        )
        .fromTo(
          checkSvgRef.current,
          { strokeDasharray: 60, strokeDashoffset: 60 },
          { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.2'
        )
        .fromTo(
          contentRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.1 },
          '-=0.2'
        );
    }
  }, [isOrderSuccessOpen, lastPlacedOrder]);

  if (!isOrderSuccessOpen || !lastPlacedOrder) return null;

  const handleContinueShopping = () => {
    setIsOrderSuccessOpen(false);
    const shopEl = document.getElementById('shop-section');
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewOrders = () => {
    setIsOrderSuccessOpen(false);
    setIsOrdersModalOpen(true);
  };

  return (
    <div className="modal-backdrop" ref={overlayRef}>
      <div className="success-modal" ref={modalRef}>
        {/* Animated Checkmark Circle */}
        <div className="success-icon-container">
          <div ref={circleRef} className="success-circle-ring"></div>
          <svg className="success-svg-check" viewBox="0 0 24 24">
            <polyline
              ref={checkSvgRef}
              points="20 6 9 17 4 12"
            />
          </svg>
        </div>

        {/* Content Stagger Container */}
        <div ref={contentRef}>
          <div className="section-badge" style={{ backgroundColor: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', borderColor: 'rgba(5, 150, 105, 0.2)' }}>
            ✓ Verified Order &amp; Invoice Generated
          </div>

          <h2 style={{ fontSize: '1.95rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            Order Placed Successfully!
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '0.75rem' }}>
            Thank you for shopping with <strong>Value Plus India</strong>.
          </p>

          {/* Prominent Ordered Item Name Banner */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                borderRadius: '12px',
                padding: '0.65rem 1.15rem',
                color: '#1e40af',
                fontWeight: '700',
                fontSize: '0.95rem',
                maxWidth: '100%',
                boxShadow: '0 2px 8px rgba(10, 108, 220, 0.08)',
              }}
            >
              <Package size={18} color="#0a6cdc" />
              <span style={{ whiteSpace: 'normal', textAlign: 'left' }}>
                <strong>Item:</strong> {lastPlacedOrder.productName || lastPlacedOrder.primaryProductName || lastPlacedOrder.items?.[0]?.name || 'Electronic Appliance'}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Order ID: <strong style={{ color: 'var(--text-main)' }}>{lastPlacedOrder.orderId}</strong>
            </div>
          </div>

          <p style={{ fontSize: '0.9375rem', color: 'var(--accent-emerald)', fontWeight: '700', marginBottom: '1.25rem' }}>
            ● Your order has been dispatched from your nearest Value Plus retail warehouse.
          </p>

          {/* Quick Summary Card */}
          <div style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '1.25rem', textAlign: 'left', marginBottom: '1.75rem' }}>
            {/* Item(s) Preview List */}
            {lastPlacedOrder.items && lastPlacedOrder.items.length > 0 && (
              <div style={{ marginBottom: '0.85rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Ordered Products ({lastPlacedOrder.items.length}):
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {lastPlacedOrder.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {it.image && (
                        <img
                          src={it.image}
                          alt={it.name}
                          style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-default)' }}
                        />
                      )}
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {it.name || it.productName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Qty: {it.quantity} × {formatPrice(it.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Delivery:</span>
              <strong style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="var(--primary)" />
                {lastPlacedOrder.estimatedDelivery}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
              <strong style={{ color: 'var(--text-main)' }}>{lastPlacedOrder.customer?.fullName} ({lastPlacedOrder.customer?.city})</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment:</span>
              <strong style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} /> {lastPlacedOrder.paymentMethod || 'UPI'} ({lastPlacedOrder.paymentStatus || 'Paid'})
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', borderTop: '1px solid var(--border-default)', paddingTop: '0.65rem' }}>
              <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>Total Paid Amount:</span>
              <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{formatPrice(lastPlacedOrder.total)}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleContinueShopping}>
              <ShoppingBag size={17} />
              Continue Shopping
            </button>

            <button className="btn btn-secondary" onClick={handleViewOrders}>
              <Package size={17} />
              View Order Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

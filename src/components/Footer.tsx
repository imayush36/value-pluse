// @ts-nocheck
import React from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, Phone, Mail, MapPin, Store, Clock, Award } from 'lucide-react';

export default function Footer() {
  const { setSelectedCategory, openPolicy, setIsOrdersModalOpen } = useShop();

  const handleCategoryNav = (catId) => {
    setSelectedCategory(catId);
    const shopEl = document.getElementById('shop-section');
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="footer-section" className="site-footer">
      <div className="container">
        {/* Top Feature highlights */}
        <div className="vp-footer-features-banner">
          <div className="vp-footer-f-cell" onClick={() => openPolicy('shipping')} style={{ cursor: 'pointer' }}>
            <Store size={26} color="var(--primary)" />
            <div>
              <strong>50+ Stores Across UP</strong>
              <span>Visit our nearest electronics megastore</span>
            </div>
          </div>

          <div className="vp-footer-f-cell" onClick={() => openPolicy('returns')} style={{ cursor: 'pointer' }}>
            <Award size={26} color="var(--accent-emerald)" />
            <div>
              <strong>100% Genuine Brand Warranty</strong>
              <span>7-Day Replacement &amp; GST invoice</span>
            </div>
          </div>

          <div className="vp-footer-f-cell">
            <Phone size={26} color="var(--primary)" />
            <div>
              <strong>Customer Support</strong>
              <span>Toll Free: 1800-123-VALUE (9 AM - 9 PM)</span>
            </div>
          </div>
        </div>

        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div className="nav-brand-vp" style={{ marginBottom: '1rem' }}>
              <div className="brand-logo-badge">
                <span className="brand-text-value">VALUE</span>
                <span className="brand-text-plus">PLUS</span>
              </div>
              <span className="brand-subtext">ELECTRONICS MEGASTORE</span>
            </div>

            <p style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              “Smart Tech. Better Living.”
            </p>

            <p className="footer-brand-desc">
              Value Plus is Uttar Pradesh's leading electronics and home appliances retail store chain, offering the latest Smart TVs, Refrigerators, ACs, Washing Machines, Mobiles &amp; Laptops at guaranteed best market prices.
            </p>

            {/* Social SVGs */}
            <div className="footer-social-links">
              <a href="#instagram" className="social-icon-btn" aria-label="Value Plus Instagram" onClick={(e) => e.preventDefault()}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#facebook" className="social-icon-btn" aria-label="Value Plus Facebook" onClick={(e) => e.preventDefault()}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#youtube" className="social-icon-btn" aria-label="Value Plus YouTube" onClick={(e) => e.preventDefault()}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="footer-col-title">Shop by Categories</h4>
            <ul className="footer-links">
              <li>
                <a href="#shop" onClick={(e) => { e.preventDefault(); handleCategoryNav('Mobiles'); }}>
                  Mobiles &amp; 5G Tablets
                </a>
              </li>
              <li>
                <a href="#shop" onClick={(e) => { e.preventDefault(); handleCategoryNav('Televisions'); }}>
                  Smart LED TVs (4K &amp; OLED)
                </a>
              </li>
              <li>
                <a href="#shop" onClick={(e) => { e.preventDefault(); handleCategoryNav('Air Conditioners'); }}>
                  5-Star Inverter ACs &amp; Coolers
                </a>
              </li>
              <li>
                <a href="#shop" onClick={(e) => { e.preventDefault(); handleCategoryNav('Refrigerators'); }}>
                  Double Door &amp; Side-by-Side Fridges
                </a>
              </li>
              <li>
                <a href="#shop" onClick={(e) => { e.preventDefault(); handleCategoryNav('Washing Machines'); }}>
                  Front &amp; Top Load Washing Machines
                </a>
              </li>
              <li>
                <a href="#shop" onClick={(e) => { e.preventDefault(); handleCategoryNav('Laptops'); }}>
                  Laptops &amp; MacBooks
                </a>
              </li>
              <li>
                <a href="#shop" onClick={(e) => { e.preventDefault(); handleCategoryNav('Kitchen'); }}>
                  Kitchen Air Fryers &amp; Microwaves
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="footer-col-title">Customer Care &amp; Policies</h4>
            <ul className="footer-links">
              <li><a href="#shipping" onClick={(e) => { e.preventDefault(); openPolicy('shipping'); }}>Shipping &amp; Delivery Policy</a></li>
              <li><a href="#returns" onClick={(e) => { e.preventDefault(); openPolicy('returns'); }}>7-Day Return &amp; Replacement</a></li>
              <li><a href="#refund" onClick={(e) => { e.preventDefault(); openPolicy('refund'); }}>Refund &amp; Cancellation Policy</a></li>
              <li><a href="#privacy" onClick={(e) => { e.preventDefault(); openPolicy('privacy'); }}>Privacy &amp; Security Policy</a></li>
              <li><a href="#track" onClick={(e) => { e.preventDefault(); setIsOrdersModalOpen(true); }}>Track My Order</a></li>
              <li><a href="tel:18001238258">Helpline: 1800-123-VALUE</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="footer-col-title">Value Plus India</h4>
            <ul className="footer-links">
              <li><a href="#why-us" onClick={(e) => { e.preventDefault(); const el = document.getElementById('why-us-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>About Value Plus Megastore</a></li>
              <li><a href="#stores" onClick={(e) => { e.preventDefault(); openPolicy('shipping'); }}>Our Store Network (50+ Locations)</a></li>
              <li><a href="#returns" onClick={(e) => { e.preventDefault(); openPolicy('returns'); }}>Warranty &amp; Replacement Support</a></li>
              <li><a href="#privacy" onClick={(e) => { e.preventDefault(); openPolicy('privacy'); }}>Privacy Policy</a></li>
              <li><a href="#refund" onClick={(e) => { e.preventDefault(); openPolicy('refund'); }}>Cancellation Terms</a></li>
              <li><a href="#shipping" onClick={(e) => { e.preventDefault(); openPolicy('shipping'); }}>Free Shipping Thresholds</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © 2026 <strong>Value Plus Retail India Pvt. Ltd.</strong> All Rights Reserved. Authorised Consumer Electronics Retailer.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => openPolicy('privacy')}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openPolicy('shipping')}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}
            >
              Shipping Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openPolicy('refund')}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}
            >
              Refund &amp; Cancellation
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openPolicy('returns')}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}
            >
              Return &amp; Replacement
            </button>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="var(--accent-emerald)" /> 100% Encrypted &amp; Secure Checkout
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, Mail, MapPin, Store, Award, Headphones, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="footer-section" className="site-footer">
      <div className="container">
        {/* Top Feature highlights */}
        <div className="vp-footer-features-banner">
          <Link to="/about" className="vp-footer-f-cell" title="View Value Plus Store Network">
            <Store size={28} color="var(--primary)" />
            <div>
              <strong>50+ Stores Across UP</strong>
              <span>Visit our nearest electronics megastore →</span>
            </div>
          </Link>

          <Link to="/return-policy" className="vp-footer-f-cell" title="Brand Warranty & 7-Day Replacement">
            <Award size={28} color="var(--accent-emerald)" />
            <div>
              <strong>100% Genuine Brand Warranty</strong>
              <span>Authorised brand partner with GST invoice →</span>
            </div>
          </Link>

          <a href="tel:180012382583" className="vp-footer-f-cell" title="Call Value Plus Customer Care">
            <Headphones size={28} color="var(--primary)" />
            <div>
              <strong>Customer Helpline</strong>
              <span>Toll Free: 1800-123-VALUE (9 AM - 9 PM)</span>
            </div>
          </a>
        </div>

        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <Link to="/" className="nav-brand-vp" style={{ marginBottom: '1rem', display: 'inline-block' }}>
              <div className="brand-logo-badge">
                <span className="brand-text-value">VALUE</span>
                <span className="brand-text-plus">PLUS</span>
              </div>
              <span className="brand-subtext">ELECTRONICS MEGASTORE</span>
            </Link>

            <p style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              “Smart Tech. Better Living.”
            </p>

            <p className="footer-brand-desc">
              Value Plus is Uttar Pradesh's leading electronics and home appliances retail store chain, offering the latest Smart TVs, Refrigerators, ACs, Washing Machines, Mobiles &amp; Laptops at guaranteed best market prices.
            </p>

            {/* Social SVGs */}
            <div className="footer-social-links">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Value Plus Instagram">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Value Plus Facebook">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Value Plus YouTube">
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
                <Link to="/category/mobiles">
                  Mobiles &amp; 5G Tablets
                </Link>
              </li>
              <li>
                <Link to="/category/televisions">
                  Smart LED TVs (4K &amp; OLED)
                </Link>
              </li>
              <li>
                <Link to="/category/air-conditioners">
                  5-Star Inverter ACs &amp; Coolers
                </Link>
              </li>
              <li>
                <Link to="/category/refrigerators">
                  Double Door &amp; Side-by-Side Fridges
                </Link>
              </li>
              <li>
                <Link to="/category/washing-machines">
                  Front &amp; Top Load Washing Machines
                </Link>
              </li>
              <li>
                <Link to="/category/laptops">
                  Laptops &amp; MacBooks
                </Link>
              </li>
              <li>
                <Link to="/category/kitchen">
                  Kitchen Air Fryers &amp; Appliances
                </Link>
              </li>
              <li>
                <Link to="/category/wearables">
                  Smartwatches &amp; Audio
                </Link>
              </li>
              <li>
                <Link to="/shop" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                  Browse All Categories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="footer-col-title">Customer Care</h4>
            <ul className="footer-links">
              <li><Link to="/contact">Contact Us &amp; Helpline</Link></li>
              <li><Link to="/orders">Track My Order</Link></li>
              <li><Link to="/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/return-policy">Return &amp; Replacement</Link></li>
              <li><Link to="/refund-cancellation">Refund &amp; Cancellation</Link></li>
              <li><Link to="/faq">Store Pickup &amp; Warranty FAQs</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="footer-col-title">Value Plus India</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Value Plus</Link></li>
              <li><Link to="/about">Our Store Network (50+ in UP)</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms &amp; Conditions</Link></li>
              <li><Link to="/admin/login" style={{ color: 'var(--text-muted)' }}>Staff &amp; Admin Login</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © 2026 <strong>Value Plus Retail India Pvt. Ltd.</strong> All Rights Reserved. Authorised Consumer Electronics Retailer.
          </div>

          <div className="footer-bottom-links">
            <Link to="/shipping-policy">Shipping Policy</Link>
            <span>•</span>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <span>•</span>
            <Link to="/refund-cancellation">Refund &amp; Cancellation</Link>
            <span>•</span>
            <Link to="/return-policy">Return &amp; Replacement</Link>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="var(--accent-emerald)" /> 100% Encrypted &amp; Secure Checkout
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

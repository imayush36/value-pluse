// @ts-nocheck
import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Send, CheckCircle2, Sparkles, Tag } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useShop();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setSubscribed(true);
    showToast('🎉 Thanks for subscribing to Value Plus Insider Club!');
  };

  return (
    <section className="section section-light" style={{ paddingBottom: '2.5rem' }}>
      <div className="container">
        <div className="newsletter-card vp-newsletter-card">
          <div className="section-badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.25)', margin: '0 auto 1.25rem auto' }}>
            <Tag size={14} />
            <span>Value Plus VIP Club</span>
          </div>

          <h2 className="newsletter-title">Get ₹500 OFF on Your Next Appliance</h2>
          <p className="newsletter-sub">
            Subscribe to receive exclusive festive coupon codes, early flash sale access, and new electronics launch alerts.
          </p>

          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email for instant ₹500 voucher..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">
                <Send size={15} />
                Get Voucher
              </button>
            </form>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #059669', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: '700' }}>
              <CheckCircle2 size={18} />
              <span>Use coupon code <strong>VALUE500</strong> at checkout to redeem ₹500 discount!</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// @ts-nocheck
import React from 'react';
import { TESTIMONIALS } from '../data/products';
import { Star, MessageSquare, CheckCircle, MapPin } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className="section section-alt">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <MessageSquare size={14} />
            <span>Customer Experiences</span>
          </div>
          <h2 className="section-title">Trusted by 10 Lakh+ Happy Customers</h2>
          <p className="section-desc">
            Read real stories from verified shoppers across Uttar Pradesh &amp; Delhi NCR who chose Value Plus.
          </p>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((item) => (
            <div key={item.id} className="testimonial-card">
              <div>
                <div style={{ display: 'flex', gap: '3px', color: '#f59e0b', marginBottom: '0.75rem' }}>
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>

                <p className="testimonial-quote">“{item.comment}”</p>
              </div>

              <div className="testimonial-author">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="testimonial-avatar"
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="author-name">{item.name}</span>
                    {item.verified && (
                      <CheckCircle size={14} color="var(--primary)" fill="var(--primary-light)" />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <MapPin size={12} color="var(--primary)" />
                    <span>{item.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

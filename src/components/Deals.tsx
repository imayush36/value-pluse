// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import ProductCard from './ProductCard';
import { Flame, Clock, ArrowRight, Sparkles } from 'lucide-react';

export default function Deals() {
  const { setSelectedCategory } = useShop();

  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 34,
    seconds: 28,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dealProducts = PRODUCTS.filter((p) => p.isDeal).slice(0, 4);

  const formatUnit = (num) => String(num).padStart(2, '0');

  return (
    <section id="deals-section" className="section deals-section">
      <div className="container">
        <div className="deals-header-flex">
          <div>
            <div className="section-badge" style={{ backgroundColor: 'var(--accent-deal-light)', color: 'var(--accent-deal)', borderColor: 'rgba(225, 29, 72, 0.2)' }}>
              <Flame size={14} />
              <span>Value Plus Flash Sale</span>
            </div>
            <h2 className="section-title">Today's Mega Tech &amp; Appliance Deals</h2>
            <p className="section-desc">
              Grab extraordinary savings on 4K TVs, Inverter ACs, Washing Machines &amp; 5G Phones.
            </p>
          </div>

          <div className="deal-timer-box">
            <Clock size={18} color="var(--accent-deal)" />
            <span className="timer-label">Offer Closes In:</span>
            <div className="timer-digits">
              <span className="timer-unit">{formatUnit(timeLeft.hours)}h</span>
              <span>:</span>
              <span className="timer-unit">{formatUnit(timeLeft.minutes)}m</span>
              <span>:</span>
              <span className="timer-unit">{formatUnit(timeLeft.seconds)}s</span>
            </div>
          </div>
        </div>

        <div className="product-grid">
          {dealProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

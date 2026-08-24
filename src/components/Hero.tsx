// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { HERO_SLIDES, VALUE_PLUS_CATEGORIES } from '../data/products';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Zap,
  CreditCard,
  Smartphone,
  Tv,
  Wind,
  Refrigerator,
  WashingMachine,
  Laptop,
  Headphones,
  UtensilsCrossed,
  Watch,
  ArrowRight,
} from 'lucide-react';
import gsap from 'gsap';

const iconMap = {
  Sparkles: Sparkles,
  Smartphone: Smartphone,
  Tv: Tv,
  Wind: Wind,
  Refrigerator: Refrigerator,
  WashingMachine: WashingMachine,
  Laptop: Laptop,
  Headphones: Headphones,
  UtensilsCrossed: UtensilsCrossed,
  Watch: Watch,
};

export default function Hero() {
  const { setSelectedCategory } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideContentRef = useRef(null);

  const totalSlides = HERO_SLIDES.length;

  // Auto slide effect
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  // Animate slide content on change
  useEffect(() => {
    if (slideContentRef.current) {
      gsap.fromTo(
        slideContentRef.current,
        { opacity: 0, x: 25 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, [currentSlide]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const activeSlide = HERO_SLIDES[currentSlide];

  const handleSlideCategoryClick = (category) => {
    setSelectedCategory(category);
    const shopEl = document.getElementById('shop-section');
    if (shopEl) {
      const yOffset = -120;
      const y = shopEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="hero-carousel-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        {/* Main Auto-Slide Banner Box */}
        <div className="hero-banner-card">
          {/* Background image & overlay */}
          <div className="hero-banner-media">
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              className="hero-banner-bg-img"
            />
            <div className="hero-banner-overlay" style={{ background: activeSlide.bgColor }}></div>
          </div>

          {/* Slide Text Content */}
          <div ref={slideContentRef} className="hero-banner-content">
            <div className="hero-banner-badge">
              <Sparkles size={14} />
              <span>{activeSlide.badge}</span>
            </div>

            <h1 className="hero-banner-title">{activeSlide.title}</h1>
            <p className="hero-banner-subtitle">{activeSlide.subtitle}</p>

            <div className="hero-offer-highlight">
              <Zap size={16} color="#fbbf24" fill="#fbbf24" />
              <span>{activeSlide.offerText}</span>
            </div>

            <div className="hero-banner-actions">
              <button
                className="btn btn-hero-primary"
                onClick={() => handleSlideCategoryClick(activeSlide.category)}
              >
                {activeSlide.primaryBtn}
                <ArrowRight size={17} />
              </button>
              <button
                className="btn btn-hero-secondary"
                onClick={() => handleSlideCategoryClick(activeSlide.category)}
              >
                {activeSlide.secondaryBtn}
              </button>
            </div>
          </div>

          {/* Prev / Next Arrows */}
          <button
            className="carousel-arrow-btn arrow-prev"
            onClick={handlePrev}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="carousel-arrow-btn arrow-next"
            onClick={handleNext}
            aria-label="Next Slide"
          >
            <ChevronRight size={22} />
          </button>

          {/* Dots Indicator */}
          <div className="carousel-dots-wrapper">
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>

        {/* Value Plus Circular Category Ribbon (Quick Navigation) */}
        <div className="quick-category-ribbon">
          {VALUE_PLUS_CATEGORIES.map((cat) => {
            const Icon = iconMap[cat.icon] || Sparkles;
            return (
              <div
                key={cat.id}
                className="quick-cat-bubble"
                onClick={() => handleSlideCategoryClick(cat.id)}
                role="button"
                tabIndex={0}
              >
                <div className="quick-cat-circle">
                  <Icon size={24} />
                </div>
                <span className="quick-cat-label">{cat.name.split(' ')[0]}</span>
                {cat.tag && <span className="quick-cat-tag">{cat.tag}</span>}
              </div>
            );
          })}
        </div>

        {/* Value Plus Trust Guarantees Bar */}
        <div className="value-trust-bar">
          <div className="trust-cell">
            <Truck size={24} color="var(--primary)" />
            <div>
              <strong>Express Delivery</strong>
              <span>Same-Day dispatch in UP &amp; NCR</span>
            </div>
          </div>

          <div className="trust-cell">
            <ShieldCheck size={24} color="var(--accent-emerald)" />
            <div>
              <strong>100% Genuine Brands</strong>
              <span>Brand warranty with GST Invoice</span>
            </div>
          </div>

          <div className="trust-cell">
            <CreditCard size={24} color="var(--primary)" />
            <div>
              <strong>Zero-Cost EMI</strong>
              <span>Up to 24 months bank financing</span>
            </div>
          </div>

          <div className="trust-cell">
            <RotateCcw size={24} color="var(--accent-amber)" />
            <div>
              <strong>Easy 7-Day Returns</strong>
              <span>Doorstep pickup &amp; replacement</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

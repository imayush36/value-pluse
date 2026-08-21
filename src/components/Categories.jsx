import React from 'react';
import { useShop } from '../context/ShopContext';
import { VALUE_PLUS_CATEGORIES } from '../data/products';
import {
  Sparkles,
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
  Layers,
} from 'lucide-react';

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

export default function Categories() {
  const { selectedCategory, setSelectedCategory } = useShop();

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    const shopSection = document.getElementById('shop-section');
    if (shopSection) {
      const yOffset = -120;
      const y = shopSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section id="categories-section" className="section section-light">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <Layers size={14} />
            <span>Value Plus Supermarket</span>
          </div>
          <h2 className="section-title">Shop by Electronics &amp; Appliances</h2>
          <p className="section-desc">
            Explore large home appliances, cutting-edge smart LED TVs, 5G smartphones, and IT gadgets from trusted global brands.
          </p>
        </div>

        <div className="categories-grid-vp">
          {VALUE_PLUS_CATEGORIES.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Sparkles;
            const isActive = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                className={`vp-category-card ${isActive ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(cat.id)}
              >
                <div className="vp-category-icon-box">
                  <IconComponent size={28} />
                </div>
                <div className="vp-category-details">
                  <h3 className="vp-category-name">{cat.name}</h3>
                  <div className="vp-category-meta">
                    <span>{cat.count} Products</span>
                    {cat.tag && <span className="vp-cat-tag-pill">{cat.tag}</span>}
                  </div>
                </div>
                <div className="vp-cat-arrow">
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

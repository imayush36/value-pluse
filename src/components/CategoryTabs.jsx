import React from 'react';
import { useShop } from '../context/ShopContext';
import { VALUE_PLUS_CATEGORIES, PRODUCTS } from '../data/products';
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
  Flame,
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

export default function CategoryTabs() {
  const { selectedCategory, setSelectedCategory, setSearchQuery, setSelectedBrand } = useShop();

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    // clear search query if user clicks category button to show category items cleanly
    setSearchQuery('');
    setSelectedBrand('all');
  };

  const getCategoryCount = (catId) => {
    if (catId === 'all') return PRODUCTS.length;
    return PRODUCTS.filter((p) => p.category.toLowerCase() === catId.toLowerCase()).length;
  };

  const dealsCount = PRODUCTS.filter((p) => p.isDeal).length;

  return (
    <div className="category-tabs-wrapper">
      <div className="category-tabs-scroll">
        {VALUE_PLUS_CATEGORIES.map((cat) => {
          const Icon = iconMap[cat.icon] || Sparkles;
          const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
          const count = getCategoryCount(cat.id);

          return (
            <button
              key={cat.id}
              type="button"
              className={`cat-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <span className="cat-tab-icon">
                <Icon size={18} />
              </span>
              <span className="cat-tab-title">{cat.name}</span>
              <span className="cat-tab-badge">{count}</span>
            </button>
          );
        })}

        {/* Mega Deals Button Tab */}
        <button
          type="button"
          className={`cat-tab-btn cat-tab-deals ${selectedCategory === 'deals' ? 'active-deal' : ''}`}
          onClick={() => handleCategoryClick('deals')}
        >
          <span className="cat-tab-icon">
            <Flame size={18} color="#e10600" />
          </span>
          <span className="cat-tab-title">Mega Deals</span>
          <span className="cat-tab-badge badge-deal">{dealsCount}</span>
        </button>
      </div>
    </div>
  );
}

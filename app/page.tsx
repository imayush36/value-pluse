// @ts-nocheck
'use client';

'use client';

import Link from 'next/link';

const categories = [
  { name: 'Televisions', badge: '4K Smart', icon: '📺' },
  { name: 'Air', badge: '5-Star Inverter', icon: '❄️' },
  { name: 'Refrigerators', badge: 'Frost Free', icon: '🧊' },
  { name: 'Washing', badge: 'Front Load', icon: '🧺' },
];

const featureCards = [
  { title: 'Express Delivery', detail: 'Same-day dispatch in UP & NCR' },
  { title: '100% Genuine Brands', detail: 'Brand warranty with GST invoice' },
  { title: 'Zero-Cost EMI', detail: 'Up to 24 months bank financing' },
  { title: 'Easy 7-Day Returns', detail: 'Doorstep pickup & replacement' },
];

export default function HomePage() {
  return (
    <main className="landing-shell">
      <div className="mobile-frame">
        <header className="phone-topbar">
          <div className="status-left">3:56</div>
          <div className="status-icons" aria-label="Connection status">
            <span>◔</span>
            <span>📶</span>
            <span>🔋</span>
          </div>
        </header>

        <div className="browser-header">
          <div className="browser-nav">
            <span className="home-icon">⌂</span>
            <span className="browser-url">value-plus.vercel.app</span>
          </div>
          <div className="browser-actions">
            <button className="icon-button" aria-label="Add item">+</button>
            <span className="cart-badge">23</span>
            <button className="menu-button" aria-label="Menu">⋮</button>
          </div>
        </div>

        <section className="landing-header">
          <div className="auth-actions">
            <Link href="/login" className="header-auth-btn">Login</Link>
            <Link href="/register" className="header-auth-btn primary">Register</Link>
          </div>

          <h1 className="brand-title">VALUEPLUS</h1>
          <p className="brand-subtitle">ELECTRONICS MEGASTORE</p>

          <div className="search-bar">
            <span className="search-label">Search products, brands...</span>
            <span className="search-icon">⌕</span>
          </div>
        </section>

        <section className="promo-card">
          <h2>5-Star Inverter ACs &amp; Coolers</h2>
          <p>Beat the heat with Daikin, LG &amp; Voltas heavy-duty cooling appliances.</p>

          <div className="promo-offer">
            <button type="button" aria-label="Previous offer" className="offer-arrow left">‹</button>
            <div className="offer-text">
              <span className="offer-icon">🛠️</span>
              <strong>Free Standard Installation + 10-Year Inverter Compressor Warranty</strong>
            </div>
            <button type="button" aria-label="Next offer" className="offer-arrow right">›</button>
          </div>

          <div className="shop-button-row">
            <button type="button" className="shop-btn">Shop ACs &amp; Coolers <span>→</span></button>
          </div>
        </section>

        <section className="category-section">
          <div className="category-grid">
            {categories.map((category) => (
              <article className="category-item" key={category.name}>
                <div className="category-icon">{category.icon}</div>
                <div className="category-name">{category.name}</div>
                <span className="category-badge">{category.badge}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="feature-grid">
          {featureCards.map((card) => (
            <div key={card.title} className="feature-item">
              <div className="feature-icon">
                {card.title.includes('Delivery')
                  ? '📦'
                  : card.title.includes('Genuine')
                    ? '✅'
                    : card.title.includes('EMI')
                      ? '💳'
                      : '↩️'}
              </div>
              <div className="feature-text">
                <h3>{card.title}</h3>
                <p>{card.detail}</p>
              </div>
            </div>
          ))}
        </section>

        <nav className="bottom-nav" aria-label="Main navigation">
          <Link href="/" className="nav-item active"><span>⌂</span><small>Home</small></Link>
          <Link href="/login" className="nav-item"><span>▣</span><small>Login</small></Link>
          <Link href="/register" className="nav-item"><span>◉</span><small>Register</small></Link>
          <Link href="/" className="nav-item"><span>♡</span><small>Wishlist</small></Link>
          <Link href="/" className="nav-item"><span>◫</span><small>Orders</small></Link>
        </nav>
      </div>
    </main>
  );
}
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { ProductCard } from '../components/ProductCard';
import { TrendingNow } from '../components/TrendingNow';
import { Reveal } from '../components/Reveal';
import { formatCurrency, discountPercent } from '../utils/format';
import { pricing, site } from '../config/site';
import './Home.css';

export function Home() {
  const { products } = useProducts();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const categories = [...new Set(products.map(p => p.category))];

  const heroProducts = [
    products.find(p => p.name === 'Smart Watch Pro'),
    products.find(p => p.name === 'Wireless Headphones')
  ].filter(Boolean);

  const categoryCards = categories
    .map(category => {
      const product = products.find(p => p.category === category);
      const count = products.filter(p => p.category === category).length;
      return product ? { category, image: product.image, count } : null;
    })
    .filter(Boolean);

  const deals = [...products]
    .sort((a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp))
    .slice(0, 8);

  const newArrivals = [...products]
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
    .slice(0, 8);

  const bestsellers = [...products]
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, 8);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <>
      <section className="hero">
        <div className="hero-container">
          <div className="hero-copy">
            <span className="hero-eyebrow">New season · New gear</span>
            <h1>Everything you love, delivered fast.</h1>
            <p>
              Shop premium electronics, fashion, home essentials and more — free
              shipping on orders over {formatCurrency(pricing.freeShippingThreshold)}.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn-primary">Shop Now</Link>
              <Link to="/#about" className="btn-secondary">Learn More</Link>
            </div>
            <ul className="hero-perks">
              <li>Free delivery over {formatCurrency(pricing.freeShippingThreshold)}</li>
              <li>30-day returns</li>
              <li>Secure checkout</li>
            </ul>
          </div>
          <div className="hero-visual">
            {heroProducts.map((product, index) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className={`hero-product-card hero-product-card--${index + 1}`}
              >
                <img src={product.image} alt={product.name} loading="lazy" />
                <span className="hero-product-name">{product.name}</span>
                <span className="hero-product-price">{formatCurrency(product.price)}</span>
              </Link>
            ))}
            {heroProducts.length === 0 && (
              <div className="hero-visual-placeholder">Premium products, delivered</div>
            )}
          </div>
        </div>
      </section>

      <TrendingNow />

      <section className="home-section categories-section">
        <div className="home-container">
          <Reveal>
            <header className="home-section-header">
              <div>
                <h2>Shop by Category</h2>
                <p className="section-subtitle">Find exactly what you're looking for</p>
              </div>
              <Link to="/products" className="view-all">View all →</Link>
            </header>
          </Reveal>
          <div className="category-grid">
            {categoryCards.map(({ category, image, count }, index) => (
              <Reveal key={category} delay={index * 50}>
                <Link
                  to={`/products?category=${encodeURIComponent(category)}`}
                  className="category-card"
                >
                  <div className="category-image">
                    <img src={image} alt={category} loading="lazy" />
                  </div>
                  <span className="category-name">{category}</span>
                  <span className="category-count">{count} items</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section deals-section">
        <div className="home-container">
          <Reveal>
            <header className="home-section-header">
              <div>
                <h2>Deals of the Day</h2>
                <p className="section-subtitle">Biggest discounts, up to {discountPercent(deals[0]?.price, deals[0]?.mrp) || 40}% off</p>
              </div>
              <Link to="/products" className="view-all">View all →</Link>
            </header>
          </Reveal>
          <div className="home-grid">
            {deals.map((product, index) => (
              <Reveal key={product.id} delay={index * 60}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container">
          <Reveal>
            <header className="home-section-header">
              <div>
                <h2>New Arrivals</h2>
                <p className="section-subtitle">Fresh stock added this season</p>
              </div>
              <Link to="/products" className="view-all">View all →</Link>
            </header>
          </Reveal>
          <div className="home-grid">
            {newArrivals.map((product, index) => (
              <Reveal key={product.id} delay={index * 60}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section bestsellers-section">
        <div className="home-container">
          <Reveal>
            <header className="home-section-header">
              <div>
                <h2>Bestsellers</h2>
                <p className="section-subtitle">Loved by thousands of customers</p>
              </div>
              <Link to="/products" className="view-all">View all →</Link>
            </header>
          </Reveal>
          <div className="home-grid">
            {bestsellers.map((product, index) => (
              <Reveal key={product.id} delay={index * 60}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section newsletter-section">
        <div className="home-container">
          <Reveal>
            <div className="newsletter-card">
              <h2>Stay in the loop</h2>
              <p>
                Get exclusive deals, new arrivals and special offers straight to your inbox.
              </p>
              {subscribed ? (
                <p className="newsletter-success">Thanks for subscribing to {site.name}!</p>
              ) : (
                <form className="newsletter-form" onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    aria-label="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button type="submit" className="btn-primary">Subscribe</button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="about" className="home-section about-section">
        <div className="home-container">
          <header className="home-section-header">
            <h2>Why ShopEasy?</h2>
          </header>
          <div className="about-cards">
            {[
              {
                title: 'Fast, Free Shipping',
                text: `Orders over ${formatCurrency(pricing.freeShippingThreshold)} ship free, with delivery in 3-5 business days.`,
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="1" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                )
              },
              {
                title: 'Easy Returns',
                text: "Changed your mind? Return any item within 30 days, no questions asked.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                )
              },
              {
                title: 'Secure Checkout',
                text: 'Your payment details are protected with bank-grade encryption.',
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                )
              }
            ].map((card, index) => (
              <Reveal key={card.title} delay={index * 100}>
                <div className="about-card">
                  <div className="about-icon">{card.icon}</div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="home-section contact-section">
        <div className="home-container">
          <div className="contact-card">
            <h2>Get in Touch</h2>
            <p>Questions about an order? Our support team is here to help.</p>
            <div className="contact-rows">
              <span>Email</span>
              <a href="mailto:support@shopeasy.com">support@shopeasy.com</a>
              <span>Phone</span>
              <a href="tel:+18005550199">1-800-555-0199</a>
              <span>Hours</span>
              <span>Mon–Fri, 9am–6pm ET</span>
            </div>
          </div>
        </div>
      </section>

      <section id="privacy" className="home-section legal-section">
        <div className="home-container">
          <div className="legal-block">
            <h2>Privacy Policy</h2>
            <p>
              We collect only the information needed to process your orders and
              improve your shopping experience. We never sell your personal data
              to third parties.
            </p>
          </div>
          <div className="legal-block">
            <h2>Terms of Service</h2>
            <p>
              By placing an order you agree to our pricing, shipping and returns
              policies. Products may be returned within 30 days of delivery.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

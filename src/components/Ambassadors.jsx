import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Ambassadors.css';

const AMBASSADORS = [
  {
    name: 'Virat Kohli',
    role: 'Cricketer',
    tagline: 'Shop Easy. Play Hard.',
    quote: 'Every champion was once a contender. Upgrade your game with ShopEasy.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
    emoji: '🏏',
    collection: 'Sports & Fitness',
    theme: ['#2874F0', '#5C9DFF']
  },
  {
    name: 'Deepika Padukone',
    role: 'Actress',
    tagline: 'Red-carpet style, at your doorstep.',
    quote: 'Look like a star every day — without the red carpet budget.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
    emoji: '🎬',
    collection: 'Fashion',
    theme: ['#FF9F01', '#FFC24D']
  },
  {
    name: 'MS Dhoni',
    role: 'Cricketer',
    tagline: 'Stay calm. Shop smart.',
    quote: 'Finsish what you start — right down to the checkout.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
    emoji: '🏆',
    collection: 'Sports & Fitness',
    theme: ['#2563EB', '#06B6D4']
  },
  {
    name: 'Alia Bhatt',
    role: 'Actress',
    tagline: 'Fresh finds, every single day.',
    quote: 'New season, new you. ShopEasy keeps you ahead of the trend.',
    image: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=faces',
    emoji: '✨',
    collection: 'Fashion',
    theme: ['#F59E0B', '#F97316']
  },
  {
    name: 'Sachin Tendulkar',
    role: 'Cricketer',
    tagline: 'Master your every day.',
    quote: 'Small wins add up. Start with the right gear from ShopEasy.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces',
    emoji: '🏏',
    collection: 'Sports & Fitness',
    theme: ['#059669', '#10B981']
  },
  {
    name: 'Shah Rukh Khan',
    role: 'Actor',
    tagline: 'Badhti ka naam zindagi… aur ShopEasy.',
    quote: 'Big brands, better deals — the ShopEasy promise.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces',
    emoji: '🌟',
    collection: 'Electronics',
    theme: ['#8B5CF6', '#6366F1']
  },
  {
    name: 'Priyanka Chopra',
    role: 'Actress',
    tagline: 'Global glam, local prices.',
    quote: 'Carry a little bit of everywhere with ShopEasy.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces',
    emoji: '🌍',
    collection: 'Beauty & Grooming',
    theme: ['#0EA5E9', '#3B82F6']
  },
  {
    name: 'Arijit Singh',
    role: 'Singer',
    tagline: 'Music to shop by.',
    quote: 'Find your rhythm — and your next favourite gadget.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
    emoji: '🎤',
    collection: 'Electronics',
    theme: ['#F43F5E', '#FF9F01']
  }
];

export function Ambassadors() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = AMBASSADORS.length;

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setActive(prev => (prev + 1) % count), 5000);
    return () => clearInterval(timer);
  }, [paused, count]);

  const prev = () => setActive(a => (a - 1 + count) % count);
  const next = () => setActive(a => (a + 1) % count);

  return (
    <section className="home-section ambassadors-section">
      <div className="home-container">
        <header className="home-section-header">
          <div>
            <h2>Our Brand Ambassadors</h2>
            <p className="section-subtitle">Popular faces who stand by ShopEasy</p>
          </div>
          <span className="amb-sponsored-badge" title="Paid partnership">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2l2.4 7.2H22l-6.2 4.6 2.4 7.2L12 16.4 5.8 21l2.4-7.2L2 9.2h7.6z" />
            </svg>
            Sponsored
          </span>
        </header>

        <div
          className="amb-banner"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          role="region"
          aria-label="Brand ambassadors"
        >
          <div className="amb-slides">
            {AMBASSADORS.map((amb, index) => (
              <div
                key={amb.name}
                className={`amb-slide ${index === active ? 'amb-slide--active' : ''}`}
                style={{ background: `linear-gradient(120deg, ${amb.theme[0]}, ${amb.theme[1]})` }}
                aria-hidden={index !== active}
              >
                <span className="amb-orb amb-orb--1" />
                <span className="amb-orb amb-orb--2" />
                <span className="amb-shine" />
                <span className="amb-watermark">Sponsored</span>

                <div className="amb-copy">
                  <span className="amb-eyebrow">{amb.emoji} {amb.role} · ShopEasy Ambassador</span>
                  <h3 className="amb-name">{amb.name}</h3>
                  <p className="amb-tagline">{amb.tagline}</p>
                  <p className="amb-quote">“{amb.quote}”</p>
                  <div className="amb-actions">
                    <Link to={`/products?category=${encodeURIComponent(amb.collection)}`} className="amb-btn amb-btn--solid">
                      Shop {amb.collection}
                    </Link>
                    <Link to="/products" className="amb-btn amb-btn--ghost">
                      View All Products
                    </Link>
                  </div>
                </div>

                <div className="amb-photo">
                  <span className="amb-ring" />
                  <span className="amb-float-badge amb-float-badge--1">{amb.emoji}</span>
                  <span className="amb-float-badge amb-float-badge--2">🔥</span>
                  <img src={amb.image} alt={amb.name} loading="lazy" />
                </div>
              </div>
            ))}
          </div>

          <button className="amb-nav amb-nav--prev" onClick={prev} aria-label="Previous ambassador">‹</button>
          <button className="amb-nav amb-nav--next" onClick={next} aria-label="Next ambassador">›</button>

          <div className="amb-controls">
            {AMBASSADORS.map((amb, index) => (
              <button
                key={amb.name}
                className={`amb-dot ${index === active ? 'amb-dot--active' : ''}`}
                onClick={() => setActive(index)}
                aria-label={`Show ${amb.name}`}
              >
                {index === active && <span key={active} className="amb-dot-fill" />}
              </button>
            ))}
          </div>
        </div>

        <div className="amb-marquee" aria-label="More ambassadors">
          <div className="amb-marquee-track">
            {[...AMBASSADORS, ...AMBASSADORS].map((amb, index) => (
              <Link
                key={`${amb.name}-${index}`}
                to={`/products?category=${encodeURIComponent(amb.collection)}`}
                className="amb-chip"
                tabIndex={-1}
                aria-hidden="true"
              >
                <img src={amb.image} alt="" loading="lazy" />
                <div className="amb-chip-text">
                  <strong>{amb.name}</strong>
                  <span>{amb.role}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

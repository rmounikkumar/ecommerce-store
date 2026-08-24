import { useProducts } from '../context/ProductsContext';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import './TrendingNow.css';

export function TrendingNow() {
  const { products } = useProducts();

  const trending = [...products]
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, 14);

  if (trending.length < 4) return null;

  const midpoint = Math.ceil(trending.length / 2);
  const rowA = trending.slice(0, midpoint);
  const rowB = trending.slice(midpoint);

  return (
    <section className="home-section trend-section">
      <div className="home-container">
        <Reveal>
          <header className="home-section-header">
            <div>
              <h2>Trends you may like</h2>
              <p className="section-subtitle">Everyone's adding these to their cart right now</p>
            </div>
          </header>
        </Reveal>
      </div>

      <div className="trend-marquee">
        <div className="trend-row">
          <div className="trend-track">
            {[...rowA, ...rowA].map((product, i) => (
              <div className="trend-cell" key={`${product._id || product.id}-a-${i}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
        <div className="trend-row">
          <div className="trend-track trend-track--reverse">
            {[...rowB, ...rowB].map((product, i) => (
              <div className="trend-cell" key={`${product._id || product.id}-b-${i}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { SkeletonDetail } from '../components/Skeletons';
import { formatCurrency, discountPercent } from '../utils/format';
import { formatCompactCurrency, getBrand, getRating, getReviewCount, getOffer, getStockCount, getStock } from '../utils/catalog';
import { pricing } from '../config/site';
import './ProductDetail.css';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const product = products.find(p => p.id === id);
  const images = product && product.images && product.images.length
    ? product.images
    : [product?.image];
  const [activeImage, setActiveImage] = useState(0);
  const discount = product ? discountPercent(product.price, product.mrp) : 0;
  const savings = product ? Math.max(0, Number(product.mrp || 0) - Number(product.price || 0)) : 0;

  const recommendations = useMemo(() => {
    if (!product || !products.length) return [];
    const rank = (p) => Number(p.popularity || 0);
    const sameCategory = products
      .filter(p => p.id !== product.id && p.category === product.category)
      .sort((a, b) => rank(b) - rank(a));
    if (sameCategory.length >= 8) return sameCategory.slice(0, 8);
    const others = products
      .filter(p => p.id !== product.id && p.category !== product.category)
      .sort((a, b) => rank(b) - rank(a));
    return [...sameCategory, ...others].slice(0, 8);
  }, [products, product]);

  if (!product && loading) {
    return <SkeletonDetail />;
  }

  if (!product) {
    return (
      <div className="pd-page pd-page--not-found">
        <div className="container">
          <h1>Product Not Found</h1>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/products" className="pd-back-link">← Back to Products</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleBuyNow = () => {
    navigate('/checkout', { state: { buyNowProduct: product } });
  };

  return (
    <section className="pd-page">
      <div className="container">
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="pd-layout">
          <div className="pd-gallery">
            <div className="pd-main-image">
              {images.map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt={`${product.name} view ${index + 1}`}
                  className={index === activeImage ? 'pd-main-image-item pd-main-image-item--active' : 'pd-main-image-item'}
                  onError={(event) => { event.currentTarget.src = images[0]; }}
                />
              ))}
              {images.length > 1 && (
                <>
                  <button
                    className="pd-gallery-nav pd-gallery-nav--prev"
                    onClick={() => setActiveImage(prev => (prev - 1 + images.length) % images.length)}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    className="pd-gallery-nav pd-gallery-nav--next"
                    onClick={() => setActiveImage(prev => (prev + 1) % images.length)}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                  <div className="pd-gallery-dots">
                    {images.map((src, index) => (
                      <button
                        key={src}
                        className={`pd-gallery-dot ${index === activeImage ? 'pd-gallery-dot--active' : ''}`}
                        onClick={() => setActiveImage(index)}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="pd-gallery-thumbnails">
                {images.map((src, index) => (
                  <button
                    key={src}
                    className={`pd-gallery-thumb ${index === activeImage ? 'pd-gallery-thumb--active' : ''}`}
                    onClick={() => setActiveImage(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={src}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      onError={(event) => { event.currentTarget.src = images[0]; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pd-card">
            <div className="pd-card-head">
              <span className="pd-brand">{getBrand(product)}</span>
              <h1 className="pd-title">{product.name}</h1>
              <div className="pd-rating">
                <span className="fk-rating-badge">
                  {getRating(product).toFixed(1)}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2l2.9 6.26L21 9.27l-4.5 4.38L17.8 20 12 16.77 6.2 20l1.3-6.35L3 9.27l6.1-1.01z" />
                  </svg>
                </span>
                <span className="fk-reviews">({getReviewCount(product).toLocaleString('en-IN')} ratings)</span>
              </div>
            </div>

            <div className="pd-price-block">
              <div className="pd-price-row">
                <span className="pd-price-large">{formatCompactCurrency(product.price)}</span>
                {product.mrp > product.price && (
                  <>
                    <span className="fk-mrp">{formatCompactCurrency(product.mrp)}</span>
                    <span className="fk-discount">{discount}% off</span>
                  </>
                )}
              </div>
              {savings > 0 && (
                <div className="pd-savings">You save {formatCompactCurrency(savings)} on this purchase</div>
              )}
            </div>

            <div className="pd-offer-box">
              {getOffer(product)} on this product
            </div>

            <p className="pd-description">{product.description}</p>

            <div className="pd-actions">
              <button className="pd-btn-buy-now" onClick={handleBuyNow} disabled={getStock(product) === 'out'}>
                Buy Now
              </button>
              <button className="pd-btn-add-cart" onClick={handleAddToCart} disabled={getStock(product) === 'out'}>
                Add to Cart
              </button>
            </div>

            <div className="pd-services">
              <div className="pd-service">
                <span className="pd-service-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M12 7v5l4 2" />
                  </svg>
                </span>
                <span className="pd-service-text">
                  <strong>30 Days</strong>
                  Return &amp; Replacement
                </span>
              </div>
              <div className="pd-service">
                <span className="pd-service-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 17h4V5H2v12h3" />
                    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
                    <circle cx="7.5" cy="17.5" r="2.5" />
                    <circle cx="17.5" cy="17.5" r="2.5" />
                  </svg>
                </span>
                <span className="pd-service-text">
                  <strong>Free Delivery</strong>
                  on orders over {formatCurrency(pricing.freeShippingThreshold)}
                </span>
              </div>
              <div className="pd-service">
                <span className="pd-service-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </span>
                <span className="pd-service-text">
                  <strong>Cash on Delivery</strong>
                  or pay online securely
                </span>
              </div>
            </div>

            <div className="pd-highlights">
              <h3>Highlights</h3>
              <ul>
                <li>Free delivery on orders over {formatCurrency(pricing.freeShippingThreshold)}</li>
                <li>30-day easy returns</li>
                <li>Pay securely with Razorpay (UPI, cards, netbanking)</li>
                <li>Authentic products guaranteed</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pd-specs">
          <h2>Product Details</h2>
          <dl className="pd-specs-list">
            <div className="pd-spec-item">
              <dt>Category</dt>
              <dd>{product.category}</dd>
            </div>
            <div className="pd-spec-item">
              <dt>Price</dt>
              <dd>
                {formatCurrency(product.price)}
                {product.mrp > product.price && <span className="pd-spec-mrp"> M.R.P. {formatCurrency(product.mrp)}</span>}
              </dd>
            </div>
            <div className="pd-spec-item">
              <dt>Availability</dt>
              <dd className={getStock(product) === 'out' ? 'pd-stock--out' : ''}>
                {getStock(product) === 'out'
                  ? 'Out of Stock'
                  : `In Stock (${getStockCount(product)} available)`}
              </dd>
            </div>
            <div className="pd-spec-item">
              <dt>Shipping</dt>
              <dd>Free shipping on orders {formatCurrency(pricing.freeShippingThreshold)}+</dd>
            </div>
          </dl>
        </div>

        {recommendations.length > 0 && (
          <section className="pd-recommendations">
            <header className="pd-rec-header">
              <h2>Recommended for You</h2>
              <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="pd-rec-more">
                View all {product.category} →
              </Link>
            </header>
            <div className="pd-rec-grid">
              {recommendations.map(rec => (
                <ProductCard key={rec.id} product={rec} variant="flipkart" />
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

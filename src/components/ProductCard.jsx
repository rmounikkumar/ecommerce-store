import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency, discountPercent } from '../utils/format';
import { getStock } from '../utils/catalog';
import './ProductCard.css';

const WISHLIST_KEY = 'shopeasy-wishlist';

function readWishlist() {
  try {
    const raw = JSON.parse(localStorage.getItem(WISHLIST_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeWishlist(list) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

function HeartIcon({ filled }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function ProductCard({ product, variant = 'classic' }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const discount = discountPercent(product.price, product.mrp);
  const images = product.images && product.images.length ? product.images : [product.image];
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(() => readWishlist().includes(product.id));
  const outOfStock = getStock(product) === 'out';

  const prevImage = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveImage(prev => (prev - 1 + images.length) % images.length);
  };

  const nextImage = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveImage(prev => (prev + 1) % images.length);
  };

  const selectImage = (index) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveImage(index);
  };

  const handleAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart(product);
  };

  const handleBuyNow = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const added = await addToCart(product);
    if (added !== false) {
      navigate('/checkout');
    }
  };

  const toggleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setWishlisted(prev => {
      const list = readWishlist().filter(id => id !== product.id);
      if (!prev) list.push(product.id);
      writeWishlist(list);
      return !prev;
    });
  };

  return (
    <article
      className={`product-card${variant === 'flipkart' ? ' product-card--flipkart' : ''}${outOfStock ? ' is-out-of-stock' : ''}`}
    >
      <Link to={`/product/${product.id}`} className="pc-card-link" aria-label={`View ${product.name} details`}>
        <div className="product-image">
          {images.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`${product.name} view ${index + 1}`}
              loading="lazy"
              className={index === activeImage ? 'product-image-item product-image-item--active' : 'product-image-item'}
              onError={(event) => { event.currentTarget.src = images[0]; }}
            />
          ))}
          {discount > 0 && <span className="product-discount-badge">{discount}% OFF</span>}
          <button
            type="button"
            className={`pc-wish-btn${wishlisted ? ' pc-wish-btn--active' : ''}`}
            onClick={toggleWishlist}
            aria-pressed={wishlisted}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          >
            <HeartIcon filled={wishlisted} />
          </button>
          {outOfStock && <span className="pc-oos-pill">Out of Stock</span>}
          {images.length > 1 && (
            <div className="product-image-controls">
              <button className="image-nav-btn image-nav-btn--prev" onClick={prevImage} aria-label="Previous image">‹</button>
              <button className="image-nav-btn image-nav-btn--next" onClick={nextImage} aria-label="Next image">›</button>
            </div>
          )}
          {images.length > 1 && (
            <div className="image-dots">
              {images.map((src, index) => (
                <button
                  key={src}
                  className={`image-dot ${index === activeImage ? 'image-dot--active' : ''}`}
                  onClick={selectImage(index)}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        <span className="pc-name">{product.name}</span>
        <span className="pc-price">{formatCurrency(product.price)}</span>
        {variant === 'flipkart' && (
          <div className="pc-footer-actions">
            <button
              type="button"
              className="pc-action-btn pc-action-btn--primary"
              onClick={handleAdd}
              disabled={outOfStock}
              aria-label={`Add ${product.name} to cart`}
            >
              Add to Cart
            </button>
            <button
              type="button"
              className="pc-action-btn pc-action-btn--ghost"
              onClick={handleBuyNow}
              disabled={outOfStock}
              aria-label={`Buy ${product.name} now`}
            >
              Buy Now
            </button>
          </div>
        )}
      </Link>
    </article>
  );
}

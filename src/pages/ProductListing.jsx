import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { ProductCard } from '../components/ProductCard';
import { getBrand, getRating, getStock, formatCompact } from '../utils/catalog';
import { discountPercent } from '../utils/format';
import './ProductListing.css';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Popularity' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Customer Ratings' }
];

const RATING_OPTIONS = [
  { value: 0, label: 'Any rating' },
  { value: 2, label: '2★ & above' },
  { value: 3, label: '3★ & above' },
  { value: 4, label: '4★ & above' }
];

const DISCOUNT_OPTIONS = [
  { value: 0, label: 'Any discount' },
  { value: 10, label: '10% or more' },
  { value: 30, label: '30% or more' },
  { value: 50, label: '50% or more' }
];

export function ProductListing() {
  const { products, loading } = useProducts();
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const categories = useMemo(
    () => [...new Set(products.map(p => p.category))].sort(),
    [products]
  );

  const brands = useMemo(
    () => [...new Set(products.map(p => getBrand(p)))].sort(),
    [products]
  );

  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }, [products]);

  const priceBounds = useMemo(() => {
    const prices = products.map(p => Number(p.price) || 0);
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 0;
    return {
      min: Math.max(0, Math.floor(min / 100) * 100),
      max: Math.ceil(max / 100) * 100
    };
  }, [products]);

  const [searchQuery, setSearchQuery] = useState(qParam);
  const [selectedCategories, setSelectedCategories] = useState(() => categoryParam ? [categoryParam] : []);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: priceBounds.min, max: priceBounds.max });
  const [minRating, setMinRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [view, setView] = useState('grid');

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const enforceGridOnMobile = () => {
      if (mq.matches) setView('grid');
    };
    enforceGridOnMobile();
    mq.addEventListener('change', enforceGridOnMobile);
    return () => mq.removeEventListener('change', enforceGridOnMobile);
  }, []);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setSearchQuery(qParam);
  }, [qParam]);

  useEffect(() => {
    setSelectedCategories(categoryParam ? [categoryParam] : []);
  }, [categoryParam]);

  useEffect(() => {
    setPriceRange({ min: priceBounds.min, max: priceBounds.max });
  }, [priceBounds.min, priceBounds.max]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => (
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    ));
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => (
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    ));
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: priceBounds.min, max: priceBounds.max });
    setMinRating(0);
    setMinDiscount(0);
    setShowOutOfStock(false);
    setSearchQuery('');
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedBrands.length +
    (minRating > 0 ? 1 : 0) +
    (minDiscount > 0 ? 1 : 0) +
    (priceRange.min > priceBounds.min || priceRange.max < priceBounds.max ? 1 : 0);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = products.filter(p => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(getBrand(p))) return false;
      const price = Number(p.price) || 0;
      if (price < priceRange.min || price > priceRange.max) return false;
      if (getRating(p) < minRating) return false;
      if (discountPercent(p.price, p.mrp) < minDiscount) return false;
      if (!showOutOfStock && getStock(p) === 'out') return false;
      if (query
        && !p.name.toLowerCase().includes(query)
        && !p.description.toLowerCase().includes(query)
        && !p.category.toLowerCase().includes(query)) return false;
      return true;
    });

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => String(b.dateAdded).localeCompare(String(a.dateAdded)));
        break;
      case 'rating':
        result.sort((a, b) => getRating(b) - getRating(a));
        break;
      default:
        result.sort((a, b) => b.popularity - a.popularity);
    }

    return result;
  }, [products, searchQuery, selectedCategories, selectedBrands, priceRange, minRating, minDiscount, showOutOfStock, sortBy]);

  return (
    <section id="products" className="product-listing">
        <div className="pl-topbar">
          <div className="pl-container pl-topbar-inner">
            <h1 className="pl-title">All Products</h1>
          </div>
        </div>

      <div className="pl-container">
        <button
          type="button"
          className="filters-toggle"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen(open => !open)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
          Filters
          {activeFilterCount > 0 && <span className="filters-badge">{activeFilterCount}</span>}
        </button>

        <div className="pl-layout">
          <aside className={`filters-sidebar ${filtersOpen ? 'is-open' : ''}`} aria-label="Product filters">
            <div className="filter-group">
              <h2 className="filter-title">Categories</h2>
              {categories.map(category => (
                <label key={category} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  <span className="filter-option-label">{category}</span>
                  <span className="filter-count">{categoryCounts[category] || 0}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h2 className="filter-title">Price</h2>
              <div className="price-slider">
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  step={100}
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Math.min(Number(e.target.value), prev.max) }))}
                  aria-label="Minimum price"
                />
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  step={100}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Math.max(Number(e.target.value), prev.min) }))}
                  aria-label="Maximum price"
                />
              </div>
              <div className="price-labels">
                <span>₹{formatCompact(priceRange.min)}</span>
                <span>₹{formatCompact(priceRange.max)}</span>
              </div>
            </div>

            <div className="filter-group">
              <h2 className="filter-title">Brand</h2>
              {brands.map(brand => (
                <label key={brand} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                  />
                  <span className="filter-option-label">{brand}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h2 className="filter-title">Customer Ratings</h2>
              {RATING_OPTIONS.map(option => (
                <label key={option.value} className="filter-option">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === option.value}
                    onChange={() => setMinRating(option.value)}
                  />
                  <span className="filter-option-label">{option.label}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h2 className="filter-title">Discount</h2>
              {DISCOUNT_OPTIONS.map(option => (
                <label key={option.value} className="filter-option">
                  <input
                    type="radio"
                    name="discount"
                    checked={minDiscount === option.value}
                    onChange={() => setMinDiscount(option.value)}
                  />
                  <span className="filter-option-label">{option.label}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h2 className="filter-title">Availability</h2>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={showOutOfStock}
                  onChange={(e) => setShowOutOfStock(e.target.checked)}
                />
                <span className="filter-option-label">Include Out of Stock</span>
              </label>
            </div>

            {activeFilterCount > 0 && (
              <button type="button" className="clear-filters" onClick={clearFilters}>
                Clear All Filters
              </button>
            )}
          </aside>

          <div className="pl-main">
            <div className="pl-toolbar">
              <span className="result-count">{filteredProducts.length} products</span>
              <div className="toolbar-right">
                <div className="view-toggle" role="group" aria-label="View layout">
                  <button
                    type="button"
                    className={`view-btn ${view === 'grid' ? 'is-active' : ''}`}
                    onClick={() => setView('grid')}
                    aria-label="Grid view"
                    aria-pressed={view === 'grid'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`view-btn ${view === 'list' ? 'is-active' : ''}`}
                    onClick={() => setView('list')}
                    aria-label="List view"
                    aria-pressed={view === 'list'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="4" rx="1" />
                      <rect x="3" y="10" width="18" height="4" rx="1" />
                      <rect x="3" y="16" width="18" height="4" rx="1" />
                    </svg>
                  </button>
                </div>

                <div className="sort-control">
                  <label htmlFor="sort-select" className="sort-label">Sort by</label>
                  <select
                    id="sort-select"
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <p className="pl-empty">Loading products...</p>
            ) : filteredProducts.length === 0 ? (
              <div className="pl-empty">
                <p>No products match your search.</p>
                <button type="button" className="clear-filters" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className={`pl-grid ${view === 'list' ? 'pl-grid--list' : ''}`}>
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} variant="flipkart" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../api/client';
import { products as FALLBACK_PRODUCTS } from '../data/products';

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      const data = await api('/products');
      setProducts(data.products);
      setError(null);
    } catch (err) {
      if (import.meta.env.DEV) {
        setProducts(FALLBACK_PRODUCTS);
        setError(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addProduct = useCallback(async (product) => {
    const data = await api('/products', { method: 'POST', body: product });
    setProducts(prev => [data.product, ...prev]);
    return data.product;
  }, []);

  const updateProduct = useCallback(async (productId, updates) => {
    const data = await api(`/products/${productId}`, { method: 'PUT', body: updates });
    setProducts(prev => prev.map(product => (product.id === productId ? data.product : product)));
    return data.product;
  }, []);

  const deleteProduct = useCallback(async (productId) => {
    await api(`/products/${productId}`, { method: 'DELETE' });
    setProducts(prev => prev.filter(product => product.id !== productId));
  }, []);

  return (
    <ProductsContext.Provider
      value={{ products, loading, error, addProduct, updateProduct, deleteProduct }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}

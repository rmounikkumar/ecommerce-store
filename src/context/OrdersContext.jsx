import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/client';

const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    try {
      const endpoint = user.role === 'admin' ? '/orders/all' : '/orders/mine';
      const data = await api(endpoint);
      setOrders(data.orders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const addOrder = useCallback(async (order) => {
    const data = await api('/orders', { method: 'POST', body: order });
    setOrders(prev => [data.order, ...prev]);
    return { order: data.order, payment: data.payment };
  }, []);

  const verifyOrderPayment = useCallback(async (orderId, payment) => {
    const data = await api(`/orders/${orderId}/verify-payment`, { method: 'POST', body: payment });
    setOrders(prev => prev.map(order => (order.id === orderId ? data.order : order)));
    return data.order;
  }, []);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    const data = await api(`/orders/${orderId}/status`, { method: 'PATCH', body: { status } });
    setOrders(prev => prev.map(order => (order.id === orderId ? data.order : order)));
    return data.order;
  }, []);

  const cancelOrder = useCallback(async (orderId) => {
    const data = await api(`/orders/${orderId}/cancel`, { method: 'POST' });
    setOrders(prev => prev.map(order => (order.id === orderId ? data.order : order)));
    return data.order;
  }, []);

  const getOrder = useCallback(
    orderId => orders.find(order => order.id === orderId),
    [orders]
  );

  return (
    <OrdersContext.Provider value={{ orders, loading, addOrder, updateOrderStatus, cancelOrder, verifyOrderPayment, getOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}

import { Link } from 'react-router-dom';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { AccountTabs } from '../components/AccountTabs';
import { formatCurrency } from '../utils/format';
import { OrderTimeline } from '../components/OrderTimeline';
import './OrderHistory.css';

const CANCELLABLE_STATUSES = ['Pending', 'Processing'];

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function OrderHistory() {
  const { orders, cancelOrder } = useOrders();
  const { user } = useAuth();

  const userOrders = orders;

  const handleCancelOrder = async (order) => {
    const confirmed = window.confirm(
      `Cancel order #${order.orderNumber}?\n\nThe items will be returned to stock and this cannot be undone.`
    );
    if (!confirmed) return;
    try {
      await cancelOrder(order.id);
    } catch (err) {
      window.alert(err.message || 'Could not cancel the order. Please try again.');
    }
  };

  return (
    <section className="order-history">
      <div className="container">
        <header className="account-header">
          <div className="account-avatar" aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1>My Orders</h1>
            <p>Your order history</p>
          </div>
        </header>

        <AccountTabs />

        {userOrders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1 0 8" />
              </svg>
            </div>
            <h2>No orders yet</h2>
            <p>When you place an order, it will appear here.</p>
            <Link to="/products" className="orders-empty-btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <p className="orders-count">
              {userOrders.length} {userOrders.length === 1 ? 'order' : 'orders'}
            </p>
            <div className="orders-list">
              {userOrders.map(order => (
                <article key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <h3 className="order-number">
                        <Link to={`/order/${order.id}`}>#{order.orderNumber}</Link>
                      </h3>
                      <p className="order-date">Placed {formatDate(order.date)}</p>
                    </div>
                    <div className="order-status">
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.map(item => (
                      <div key={item.product} className="order-item">
                        <img src={item.image} alt={item.name} loading="lazy" />
                        <div className="order-item-info">
                          <span className="order-item-name">{item.name}</span>
                          <span className="order-item-qty">Qty: {item.quantity}</span>
                        </div>
                        <span className="order-item-price">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <OrderTimeline status={order.status} compact />

                  <div className="order-card-footer">
                    <div className="order-totals">
                      <span>Subtotal</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                      <span>Shipping</span>
                      <span>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span>
                      <strong>Total</strong>
                      <strong>{formatCurrency(order.total)}</strong>
                    </div>
                    <div className="order-actions">
                      {CANCELLABLE_STATUSES.includes(order.status) && (
                        <button
                          type="button"
                          className="order-cancel-btn"
                          onClick={() => handleCancelOrder(order)}
                        >
                          Cancel Order
                        </button>
                      )}
                      <Link to={`/order/${order.id}`} className="order-view-btn">
                        View Order
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

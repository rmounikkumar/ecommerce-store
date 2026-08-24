import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useOrders } from '../context/OrdersContext';
import { formatCurrency } from '../utils/format';
import { OrderTimeline } from '../components/OrderTimeline';
import { Confetti } from '../components/Confetti';
import { loadRazorpayScript, openRazorpayCheckout } from '../utils/razorpay';
import './OrderConfirmation.css';

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function OrderConfirmation() {
  const { id } = useParams();
  const { verifyOrderPayment } = useOrders();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api(`/orders/${id}`);
        if (mounted) {
          setOrder(data.order);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handlePayNow = useCallback(async () => {
    if (!order) return;
    setPaying(true);
    setPayError('');
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPayError('Could not load the payment gateway. Please try again.');
        return;
      }
      const response = await openRazorpayCheckout({
        payment: order.payment,
        orderNumber: order.orderNumber,
        name: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
        email: order.shippingInfo.email,
        contact: order.shippingInfo.phone || ''
      });
      if (!response) return;
      const updated = await verifyOrderPayment(order.id, {
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature
      });
      setOrder(updated);
    } catch (err) {
      setPayError(err.message);
    } finally {
      setPaying(false);
    }
  }, [order, verifyOrderPayment]);

  if (loading) {
    return null;
  }

  if (error || !order) {
    return (
      <section className="order-confirmation">
        <div className="container">
          <div className="confirmation-card">
            <h1>Order Not Found</h1>
            <p className="confirmation-message">{error || 'This order could not be loaded.'}</p>
            <div className="confirmation-actions">
              <Link to="/products" className="btn-continue">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const paid = Boolean(order.payment?.paid);
  const paymentEnabled = Boolean(order.payment?.enabled);
  const isCod = order.payment?.method === 'cod';

  return (
    <>
      <Confetti />
      <section className="order-confirmation">
        <div className="container">
          <div className="confirmation-card">
          <div className="success-icon">
            <span className="success-emoji" role="img" aria-label="Order placed">✅</span>
          </div>
          <h1>{paid ? 'Order Confirmed!' : paymentEnabled ? 'Order Placed!' : 'Order Confirmed!'}</h1>
          <p className="order-id">Order ID: <strong>#{order.orderNumber}</strong></p>
          <p className="order-placed">Placed on {formatDate(order.date)}</p>
          <p className="confirmation-message">
            {paid
              ? 'Thank you for your purchase! Your payment was successful and a confirmation has been sent to your email address.'
              : isCod
                ? `Thank you for your order! Please keep ${formatCurrency(order.total)} ready in cash — you pay when your order arrives.`
                : paymentEnabled
                  ? 'Your order is placed but your payment is still pending. Complete the payment below to start processing.'
                  : 'Thank you for your purchase! A confirmation email has been sent to your email address.'}
          </p>

          <div className="order-summary-box">
            <div className="order-summary-head">
              <h3>Order Summary</h3>
              <span className={`status-badge ${paid ? 'status-delivered' : isCod ? 'status-processing' : 'status-pending'}`}>
                {paid ? 'Paid' : isCod ? 'Cash on Delivery' : 'Payment Pending'}
              </span>
            </div>
            <ul className="order-summary-items">
              {order.items.map(item => (
                <li key={item.product} className="order-summary-item">
                  <span className="order-summary-name">
                    {item.name} <span className="order-summary-qty">× {item.quantity}</span>
                  </span>
                  <span className="order-summary-price">{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="order-summary-total">
              <span>Total</span>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
            <p className="order-shipping-to">
              Shipping to: {order.shippingInfo.firstName} {order.shippingInfo.lastName}, {order.shippingInfo.city} {order.shippingInfo.zip}
            </p>
          </div>

          <OrderTimeline status={order.status} />

          {paymentEnabled && !paid && (
            <div className="order-pay-box">
              {payError && <p className="checkout-submit-error">{payError}</p>}
              <button className="btn-pay-now" onClick={handlePayNow} disabled={paying}>
                {paying ? 'Opening payment...' : 'Pay Now'}
              </button>
              <p className="order-pay-note">Pay securely via Razorpay using UPI, cards, or netbanking.</p>
            </div>
          )}

          <div className="order-details">
            <h3>What happens next?</h3>
            <ul>
              {paid ? (
                <>
                  <li>We'll prepare your order for shipment</li>
                  <li>You'll receive tracking info via email</li>
                  <li>Expected delivery: 3-5 business days</li>
                </>
              ) : isCod ? (
                <>
                  <li>We'll start preparing your order right away</li>
                  <li>Keep the cash ready for the delivery partner</li>
                  <li>Expected delivery: 3-5 business days</li>
                </>
              ) : (
                <li>Your order will start processing once your payment is confirmed.</li>
              )}
            </ul>
          </div>
          <div className="confirmation-actions">
            <Link to="/products" className="btn-continue">
              Continue Shopping
            </Link>
            <Link to="/account/orders" className="btn-track">
              View Order History
            </Link>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}

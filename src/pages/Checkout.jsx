import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { pricing } from '../config/site';
import { formatCurrency } from '../utils/format';
import { loadRazorpayScript, openRazorpayCheckout } from '../utils/razorpay';
import './Checkout.css';

export function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { addOrder, verifyOrderPayment } = useOrders();
  const { user } = useAuth();
  const nameParts = (user?.name || '').split(' ');
  const [formData, setFormData] = useState({
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || '',
    zip: user?.zip || ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');

  const buyNowProduct = location.state?.buyNowProduct;
  const isBuyNow = !!buyNowProduct;

  const items = isBuyNow ? [buyNowProduct] : cartItems;
  const itemTotal = isBuyNow ? buyNowProduct.price : cartTotal;
  const shipping = itemTotal >= pricing.freeShippingThreshold ? 0 : pricing.shippingFee;
  const total = itemTotal + shipping;

  useEffect(() => {
    if (!isBuyNow && cartItems.length === 0) {
      navigate('/products');
    }
  }, [cartItems, navigate, isBuyNow]);

  const validateForm = () => {
    const newErrors = {};
    const required = ['firstName', 'lastName', 'email', 'address', 'city', 'zip'];
    required.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const { order, payment } = await addOrder({
        items: items.map(item => ({
          product: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          image: item.image
        })),
        shippingInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: user?.phone || '',
          address: formData.address,
          city: formData.city,
          zip: formData.zip
        },
        paymentMethod
      });
      if (!isBuyNow) {
        clearCart();
      }

      if (payment?.enabled) {
        const scriptLoaded = await loadRazorpayScript();
        if (scriptLoaded) {
          const response = await openRazorpayCheckout({
            payment,
            orderNumber: order.orderNumber,
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: user?.phone || ''
          });
          if (response) {
            try {
              await verifyOrderPayment(order.id, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });
            } catch (verifyErr) {
              console.error('Payment verification failed:', verifyErr);
            }
          }
        }
      }

      navigate(`/order/${order.id}`, { replace: true });
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isBuyNow && cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <p>Add some products before checking out.</p>
      </div>
    );
  }

  return (
    <section className="checkout">
      <div className="checkout-container">
        <h1>Checkout</h1>
        <form onSubmit={handleSubmit} className="checkout-form" noValidate>
          <div className="form-section">
            <h2>Shipping Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                  required
                  disabled={isSubmitting}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                  required
                  disabled={isSubmitting}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                required
                disabled={isSubmitting}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? 'error' : ''}
                required
                disabled={isSubmitting}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={errors.city ? 'error' : ''}
                  required
                  disabled={isSubmitting}
                />
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="zip">PIN Code *</label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  placeholder="6-digit PIN"
                  className={errors.zip ? 'error' : ''}
                  required
                  disabled={isSubmitting}
                />
                {errors.zip && <span className="error-message">{errors.zip}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Payment</h2>
            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === 'online' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  disabled={isSubmitting}
                />
                <span className="payment-option-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </span>
                <span className="payment-option-text">
                  <span className="payment-option-title">Pay Online</span>
                  <span className="payment-option-desc">UPI, Cards &amp; NetBanking via Razorpay</span>
                </span>
              </label>
              <label className={`payment-option ${paymentMethod === 'cod' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  disabled={isSubmitting}
                />
                <span className="payment-option-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <circle cx="12" cy="12" r="2.5" />
                    <path d="M6 12h.01M18 12h.01" />
                  </svg>
                </span>
                <span className="payment-option-text">
                  <span className="payment-option-title">Cash on Delivery</span>
                  <span className="payment-option-desc">Pay in cash when your order arrives</span>
                </span>
              </label>
            </div>
            <div className="payment-note">
              {paymentMethod === 'cod' ? (
                <p>Please keep the exact amount ready for our delivery partner.</p>
              ) : (
                <p>
                  You'll pay securely through <strong>Razorpay</strong> using UPI, cards, or
                  netbanking after placing your order.
                </p>
              )}
            </div>
          </div>

          {errors.submit && <p className="checkout-submit-error">{errors.submit}</p>}
          <button type="submit" className="place-order-btn" disabled={isSubmitting}>
            {isSubmitting
              ? 'Processing...'
              : paymentMethod === 'cod'
                ? `Place Order - ${formatCurrency(total)}`
                : `Pay ${formatCurrency(total)}`}
          </button>
        </form>

        <aside className="order-summary">
          <h2>Order Summary</h2>
          <ul className="summary-items">
            {items.map(item => (
              <li key={item.id} className="summary-item">
                <div>
                  <span className="summary-item-name">{item.name}</span>
                  <span className="summary-item-qty">× {item.quantity || 1}</span>
                </div>
                <span className="summary-item-price">{formatCurrency(item.price * (item.quantity || 1))}</span>
              </li>
            ))}
          </ul>
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(itemTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

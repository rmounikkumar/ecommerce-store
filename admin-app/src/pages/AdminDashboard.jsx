import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { formatCurrency } from '../utils/format';
import './AdminDashboard.css';

const emptyForm = {
  id: null,
  name: '',
  price: '',
  mrp: '',
  description: '',
  category: '',
  image: '',
  popularity: '',
  stock: ''
};

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { orders, updateOrderStatus } = useOrders();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [formError, setFormError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [productView, setProductView] = useState('list');

  const [customers, setCustomers] = useState([]);
  const [customersLoaded, setCustomersLoaded] = useState(false);
  const [customersError, setCustomersError] = useState('');

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const startAdd = () => {
    setForm(emptyForm);
    setEditing(false);
    setFormError('');
  };

  const startEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      price: String(product.price),
      mrp: product.mrp ? String(product.mrp) : '',
      description: product.description,
      category: product.category,
      image: product.image,
      popularity: String(product.popularity ?? ''),
      stock: product.stock !== undefined ? String(product.stock) : ''
    });
    setEditing(true);
    setFormError('');
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    try {
      await deleteProduct(productId);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    const mrp = form.mrp.trim() ? parseFloat(form.mrp) : null;

    if (!form.name.trim() || !form.category.trim() || !form.image.trim()) {
      setFormError('Name, category, and image URL are required.');
      return;
    }
    if (!form.price.trim() || Number.isNaN(price) || price <= 0) {
      setFormError('Price must be a positive number.');
      return;
    }
    if (form.mrp.trim() && (Number.isNaN(mrp) || mrp <= 0 || mrp < price)) {
      setFormError('MRP must be a positive number at least equal to the selling price.');
      return;
    }
    if (form.stock.trim() && (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0)) {
      setFormError('Stock must be a whole number, 0 or more.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      price,
      mrp,
      description: form.description.trim(),
      category: form.category.trim(),
      image: form.image.trim(),
      popularity: form.popularity ? parseInt(form.popularity, 10) : 50,
      stock: form.stock.trim() ? parseInt(form.stock, 10) : 50
    };

    setBusy(true);
    try {
      if (editing) {
        await updateProduct(form.id, payload);
      } else {
        await addProduct(payload);
      }
      setForm(emptyForm);
      setEditing(false);
      setFormError('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const loadCustomers = async () => {
    setCustomersError('');
    try {
      const data = await api('/users/customers');
      setCustomers(data.customers);
      setCustomersLoaded(true);
    } catch (err) {
      setCustomersError(err.message);
    }
  };

  const toggleCustomer = async (customer) => {
    try {
      const data = await api(`/users/customers/${customer.id}`, {
        method: 'PATCH',
        body: { isActive: !customer.isActive }
      });
      setCustomers(prev => prev.map(c => (c.id === customer.id ? data.customer : c)));
    } catch (err) {
      setCustomersError(err.message);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwMessage('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    setPwBusy(true);
    try {
      await api('/users/me/password', {
        method: 'PATCH',
        body: { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }
      });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwMessage('Password updated successfully.');
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwBusy(false);
    }
  };

  const openTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'customers' && !customersLoaded) {
      loadCustomers();
    }
  };

  return (
    <section className="admin-dashboard">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Signed in as {user.email} — manage the whole store</p>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </header>

        <div className="admin-tabs" role="tablist" aria-label="Admin sections">
          <button
            role="tab"
            aria-selected={activeTab === 'products'}
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => openTab('products')}
          >
            Products ({products.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'orders'}
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => openTab('orders')}
          >
            Orders ({orders.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'customers'}
            className={`admin-tab ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => openTab('customers')}
          >
            Customers ({customersLoaded ? customers.length : '…'})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'settings'}
            className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => openTab('settings')}
          >
            Settings
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="admin-panel">
            <div className="admin-section-header">
              <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
              {editing && (
                <button className="admin-link-btn" onClick={startAdd}>
                  Cancel editing
                </button>
              )}
            </div>

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="admin-name">Name *</label>
                  <input
                    id="admin-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    disabled={busy}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="admin-price">Price (₹) *</label>
                  <input
                    id="admin-price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    disabled={busy}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="admin-mrp">MRP (₹)</label>
                  <input
                    id="admin-mrp"
                    name="mrp"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.mrp}
                    onChange={handleChange}
                    disabled={busy}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="admin-category">Category *</label>
                  <input
                    id="admin-category"
                    name="category"
                    type="text"
                    value={form.category}
                    onChange={handleChange}
                    disabled={busy}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="admin-popularity">Popularity (0-100)</label>
                  <input
                    id="admin-popularity"
                    name="popularity"
                    type="number"
                    min="0"
                    max="100"
                    value={form.popularity}
                    onChange={handleChange}
                    disabled={busy}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="admin-stock">Stock (units)</label>
                  <input
                    id="admin-stock"
                    name="stock"
                    type="number"
                    min="0"
                    max="9999"
                    value={form.stock}
                    onChange={handleChange}
                    disabled={busy}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label htmlFor="admin-description">Description</label>
                  <textarea
                    id="admin-description"
                    name="description"
                    rows="2"
                    value={form.description}
                    onChange={handleChange}
                    disabled={busy}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label htmlFor="admin-image">Image URL *</label>
                  <input
                    id="admin-image"
                    name="image"
                    type="url"
                    value={form.image}
                    onChange={handleChange}
                    disabled={busy}
                  />
                </div>
              </div>

              {formError && <p className="admin-form-error">{formError}</p>}

              <button type="submit" className="admin-submit-btn" disabled={busy}>
                {busy ? 'Saving...' : editing ? 'Save Changes' : 'Add Product'}
              </button>
            </form>

            <div className="admin-view-toggle" role="group" aria-label="Product view">
              <button
                className={productView === 'list' ? 'active' : ''}
                onClick={() => setProductView('list')}
              >
                ☰ List
              </button>
              <button
                className={productView === 'grid' ? 'active' : ''}
                onClick={() => setProductView('grid')}
              >
                ▦ Grid
              </button>
            </div>

            {productView === 'grid' ? (
              <div className="admin-products-grid">
                {products.map(product => (
                  <article
                    key={product.id}
                    className={`admin-product-card ${product.stock === 0 ? 'is-out' : ''}`}
                  >
                    <div className="admin-pc-img-wrap">
                      <img src={product.image} alt={product.name} loading="lazy" />
                      {product.stock === 0 && <span className="admin-pc-oos">Out of stock</span>}
                    </div>
                    <div className="admin-pc-body">
                      <span className="admin-pc-category">{product.category}</span>
                      <h3 className="admin-pc-name">{product.name}</h3>
                      <div className="admin-pc-price-row">
                        <span className="admin-pc-price">{formatCurrency(product.price)}</span>
                        {product.mrp > product.price && (
                          <span className="admin-product-mrp">{formatCurrency(product.mrp)}</span>
                        )}
                      </div>
                      <div className="admin-pc-meta">
                        <span>Stock: {product.stock ?? '—'}</span>
                        <span>Popularity: {product.popularity ?? '—'}</span>
                        <span>{product.dateAdded ? formatDate(product.dateAdded) : ''}</span>
                      </div>
                      <div className="admin-row-actions">
                        <button
                          className="admin-edit-btn"
                          onClick={() => startEdit(product)}
                          disabled={busy}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-delete-btn"
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={busy}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {products.length === 0 && (
                  <p className="admin-table-empty">No products yet. Add one above.</p>
                )}
              </div>
            ) : (
            <div className="admin-products-table-wrap">
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Popularity</th>
                    <th>Stock</th>
                    <th>Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-product-cell">
                          <img src={product.image} alt={product.name} loading="lazy" />
                          <span className="admin-product-name">{product.name}</span>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>
                        {formatCurrency(product.price)}
                        {product.mrp > product.price && (
                          <div className="admin-product-mrp">M.R.P. {formatCurrency(product.mrp)}</div>
                        )}
                      </td>
                      <td>{product.popularity ?? '—'}</td>
                      <td className={product.stock === 0 ? 'admin-stock--out' : ''}>
                        {product.stock ?? '—'}
                        {product.stock === 0 && <span className="admin-stock-badge"> Out</span>}
                      </td>
                      <td>{product.dateAdded ? formatDate(product.dateAdded) : '—'}</td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            className="admin-edit-btn"
                            onClick={() => startEdit(product)}
                            disabled={busy}
                          >
                            Edit
                          </button>
                          <button
                            className="admin-delete-btn"
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={busy}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="6" className="admin-table-empty">
                        No products yet. Add one above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-panel">
            <div className="admin-section-header">
              <h2>All Orders</h2>
            </div>

            {orders.length === 0 ? (
              <p className="admin-empty-state">No orders have been placed yet.</p>
            ) : (
              <div className="admin-orders-list">
                {orders.map(order => {
                  const isExpanded = expandedOrder === order.id;
                  return (
                    <article key={order.id} className="admin-order-card">
                      <button
                        className="admin-order-header"
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        aria-expanded={isExpanded}
                      >
                        <div>
                          <strong>#{order.orderNumber}</strong>
                          <span className="admin-order-date">{formatDate(order.date)}</span>
                        </div>
                        <div className="admin-order-meta">
                          <span className={`status-badge status-${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                          <span className="admin-order-total">{formatCurrency(order.total)}</span>
                          <span className="admin-order-chevron">{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="admin-order-details">
                          <div className="admin-order-customer">
                            <h4>Customer</h4>
                            <p>{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                            <p>{order.shippingInfo.email}</p>
                            {order.shippingInfo.phone && <p>{order.shippingInfo.phone}</p>}
                            <p>
                              {order.shippingInfo.address}, {order.shippingInfo.city} {order.shippingInfo.zip}
                            </p>
                          </div>

                          <div className="admin-order-items">
                            <h4>Items ({order.items.length})</h4>
                            <ul>
                              {order.items.map(item => (
                                <li key={item.product}>
                                  <span className="admin-order-item-name">
                                    {item.name} <span className="admin-order-item-qty">× {item.quantity}</span>
                                  </span>
                                  <span>{formatCurrency(item.price * item.quantity)}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="admin-order-summary">
                              <span>Subtotal</span>
                              <span>{formatCurrency(order.subtotal)}</span>
                              <span>Shipping</span>
                              <span>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span>
                              <strong>Total</strong>
                              <strong>{formatCurrency(order.total)}</strong>
                            </div>
                            <label className="admin-status-label" htmlFor={`status-${order.id}`}>
                              Update status
                            </label>
                            <select
                              id={`status-${order.id}`}
                              className="admin-status-select"
                              value={order.status}
                              onChange={e => handleStatusChange(order.id, e.target.value)}
                            >
                              {ORDER_STATUSES.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="admin-panel">
            <div className="admin-section-header">
              <h2>Customers</h2>
            </div>

            {customersError && <p className="admin-form-error">{customersError}</p>}

            {customers.length === 0 ? (
              <p className="admin-empty-state">
                {customersError ? 'Could not load customers.' : 'No customers have registered yet.'}
              </p>
            ) : (
              <div className="admin-products-table-wrap">
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th>Joined</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(customer => (
                      <tr key={customer.id}>
                        <td>
                          <span className="admin-product-name">{customer.name}</span>
                        </td>
                        <td>
                          {customer.email || '—'}
                          {customer.phone && <div className="admin-customer-phone">{customer.phone}</div>}
                        </td>
                        <td>{formatDate(customer.createdAt)}</td>
                        <td>
                          <span className={`status-badge status-${customer.isActive ? 'delivered' : 'cancelled'}`}>
                            {customer.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={customer.isActive ? 'admin-delete-btn' : 'admin-edit-btn'}
                            onClick={() => toggleCustomer(customer)}
                          >
                            {customer.isActive ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="admin-panel">
            <div className="admin-section-header">
              <h2>Change Password</h2>
            </div>

            <form className="admin-form" onSubmit={handlePasswordSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="pw-current">Current Password *</label>
                  <input
                    id="pw-current"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={pwForm.currentPassword}
                    onChange={handlePwChange}
                    disabled={pwBusy}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pw-new">New Password *</label>
                  <input
                    id="pw-new"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={pwForm.newPassword}
                    onChange={handlePwChange}
                    disabled={pwBusy}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pw-confirm">Confirm New Password *</label>
                  <input
                    id="pw-confirm"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={pwForm.confirmPassword}
                    onChange={handlePwChange}
                    disabled={pwBusy}
                  />
                </div>
              </div>

              {pwError && <p className="admin-form-error">{pwError}</p>}
              {pwMessage && <p className="admin-form-success">{pwMessage}</p>}

              <button type="submit" className="admin-submit-btn" disabled={pwBusy}>
                {pwBusy ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

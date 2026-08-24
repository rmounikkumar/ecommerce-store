import { useState } from 'react';
import { useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminUrl } from '../config/site';
import './auth.css';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from && location.state.from !== '/login' ? location.state.from : '/';
  const { user, login, logout } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await login(formData);
      if (result?.user?.role === 'admin') {
        await logout();
        if (adminUrl) {
          window.location.href = adminUrl;
        } else {
          setError('This is an admin account. Manage the store from the Admin Panel instead.');
        }
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth">
      <div className="auth-card">
        <div className="auth-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1>Sign In</h1>
        <p>Log in to your account to view orders and manage your profile.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="current-password"
              disabled={isSubmitting}
              required
            />
          </div>
          {error && <span className="auth-error">{error}</span>}
          <button type="submit" className="auth-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          New to ShopEasy? <Link to="/register">Create an account</Link>
        </p>
        <p className="auth-switch">
          Or <Link to="/otp">sign in with a one-time code by email</Link>
        </p>
      </div>
    </section>
  );
}

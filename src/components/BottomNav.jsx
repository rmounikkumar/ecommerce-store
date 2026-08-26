import { useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './BottomNav.css';

export function BottomNav() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('has-bottom-nav');
    const buzz = (e) => {
      if (!e.target.closest?.('.bottom-nav-item')) return;
      if (typeof navigator.vibrate === 'function') {
        try { navigator.vibrate(12); } catch { /* ignore */ }
      }
    };
    document.addEventListener('pointerdown', buzz);
    return () => {
      document.body.classList.remove('has-bottom-nav');
      document.removeEventListener('pointerdown', buzz);
    };
  }, []);

  const accountPath = user ? '/account/profile' : '/login';
  const accountActive = ['/account', '/login', '/register', '/otp'];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const goSearch = () => {
    const el = document.getElementById('header-search');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    try {
      el.focus({ preventScroll: true });
    } catch {
      el.focus();
    }
  };

  return (
    <nav className="bottom-nav" aria-label="Mobile quick navigation">
      <NavLink to="/" end className="bottom-nav-item" aria-label="Home">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
        <span>Home</span>
      </NavLink>

      <NavLink to="/products" end className="bottom-nav-item" aria-label="Products">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span>Products</span>
      </NavLink>

      <button type="button" className="bottom-nav-item bottom-nav-search" onClick={goSearch} aria-label="Search">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.5" y2="16.5" />
        </svg>
        <span>Search</span>
      </button>

      <NavLink to="/cart" end className="bottom-nav-item" aria-label="Shopping cart">
        <span className="bottom-nav-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1 0 8" />
          </svg>
          {cartCount > 0 && <span className="bottom-nav-badge">{cartCount}</span>}
        </span>
        <span>Cart</span>
      </NavLink>

      <NavLink to={accountPath} className={`bottom-nav-item ${accountActive.includes(location.pathname) ? 'active' : ''}`} aria-label="Account">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>{user ? 'Account' : 'Sign In'}</span>
      </NavLink>

      {user && (
        <button type="button" className="bottom-nav-item bottom-nav-logout" onClick={handleLogout} aria-label="Log out">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Logout</span>
        </button>
      )}
    </nav>
  );
}

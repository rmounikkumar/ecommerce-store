import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LiveSearch } from './LiveSearch';
import { site, layout, nav } from '../config/site';
import './Header.css';

export function Header() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState(() => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'));
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* storage unavailable */
    }
    setTheme(next);
  };

  const closeAll = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  useEffect(() => {
    closeAll();
  }, [location]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onPointerDown = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [userMenuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const goToProducts = (value) => {
    closeAll();
    const q = value.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const q = query;
    setQuery('');
    goToProducts(q);
  };

  const handleLogout = () => {
    closeAll();
    logout();
  };

  const currentRole = user?.role ?? 'guest';
  const visibleLinks = nav.links.filter(link => !link.roles || link.roles.includes(currentRole));
  const visibleAccountLinks = nav.account.filter(link => !link.roles || link.roles.includes(currentRole));

  const firstName = user?.name?.trim().split(/\s+/)[0] || '';
  const initial = (user?.name?.trim()[0] || '?').toUpperCase();

  const renderLink = (link, className) => {
    const key = link.label;
    if (link.external) {
      return (
        <a key={key} href={link.to} target="_blank" rel="noopener noreferrer" className={className} onClick={closeAll}>
          {link.label}
        </a>
      );
    }
    if (link.to.startsWith('/#')) {
      return (
        <Link key={key} to={link.to} className={className} onClick={closeAll}>
          {link.label}
        </Link>
      );
    }
    return (
      <NavLink key={key} to={link.to} className={className} onClick={closeAll} end>
        {link.label}
      </NavLink>
    );
  };

  const headerClass = [
    'header',
    layout.sticky ? '' : 'header--static',
    layout.compact ? 'header--compact' : ''
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClass} style={{ '--header-max-width': layout.maxWidth }}>
      <div className="header-content">
        <Link to="/" className="logo" aria-label={`${site.name} Home`}>
          {site.logo}
        </Link>

        {layout.showSearch && (
          <form className="search-form" role="search" onSubmit={handleSearch}>
            <LiveSearch
              value={query}
              onChange={setQuery}
              onSubmit={() => {
                const q = query;
                setQuery('');
                goToProducts(q);
              }}
              placeholder={layout.searchPlaceholder}
              ariaLabel={layout.searchPlaceholder}
              inputId="header-search"
            />
          </form>
        )}

        {visibleLinks.length > 0 && (
          <nav className="nav" aria-label="Main navigation">
            {visibleLinks.map(link => renderLink(link))}
          </nav>
        )}

        <div className="header-actions">
          {layout.showAccount && user && (
            <div className="account-area" ref={userMenuRef}>
              <button
                className="account-toggle"
                onClick={() => setUserMenuOpen(prev => !prev)}
                aria-label="Account menu"
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                <span className="avatar">{initial}</span>
                {firstName && <span className="account-name">Hi, {firstName}</span>}
              </button>
              {userMenuOpen && (
                <div className="dropdown" role="menu">
                  {visibleAccountLinks.map(link => renderLink(link, 'dropdown-link'))}
                  <button className="dropdown-logout" role="menuitem" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}

          {layout.showAccount && !user && (
            <div className="guest-actions">
              {nav.guest.map(link =>
                link.variant === 'primary' ? (
                  <Link key={link.label} to={link.to} className="btn-login" onClick={closeAll}>
                    {link.label}
                  </Link>
                ) : (
                  <Link key={link.label} to={link.to} className="btn-register" onClick={closeAll}>
                    {link.label}
                  </Link>
                )
              )}
            </div>
          )}

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {layout.showCart && (
            <Link to="/cart" className="cart-button" aria-label="Shopping cart">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1 0 8" />
              </svg>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </Link>
          )}

          {layout.showHamburger && (
            <button
              className="hamburger"
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation">
          {layout.showAccount && user && (
            <div className="mobile-account">
              <span className="mobile-greeting">Hi, {user.name}</span>
              {visibleAccountLinks.map(link => renderLink(link))}
              <button className="mobile-logout" onClick={handleLogout}>Log Out</button>
            </div>
          )}

          {layout.showAccount && !user && (
            <div className="mobile-account">
              {nav.guest.map(link => renderLink(link))}
            </div>
          )}

          {visibleLinks.map(link => renderLink(link))}
        </nav>
      )}
    </header>
  );
}

import { useState } from 'react';
import { useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validateName, passwordChecks } from '../utils/validation';
import './auth.css';

const passwordRules = [
  { key: 'length', label: 'At least 8 characters' },
  { key: 'upper', label: 'One uppercase letter' },
  { key: 'lower', label: 'One lowercase letter' },
  { key: 'number', label: 'One number' },
  { key: 'special', label: 'One special character' }
];

export function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from && location.state.from !== '/register' ? location.state.from : '/';
  const { user, register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
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
    if (!validateName(formData.name)) {
      setError('Please enter your name (2-60 characters).');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.password.length > 72) {
      setError('Password must be 72 characters or fewer.');
      return;
    }
    if (!Object.values(passwordChecks(formData.password)).every(Boolean)) {
      setError('Password does not meet all requirements.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checks = passwordChecks(formData.password);
  const metCount = Object.values(checks).filter(Boolean).length;

  return (
    <section className="auth">
      <div className="auth-card">
        <div className="auth-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        </div>
        <h1>Create Account</h1>
        <p>Sign up to track orders and save your details.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              autoComplete="name"
              maxLength="60"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              maxLength="254"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              maxLength="72"
              required
            />
            {formData.password && (
              <>
                <div className="strength-track">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${(metCount / passwordRules.length) * 100}%`,
                      backgroundColor: metCount < 3 ? '#F87171' : metCount < 5 ? '#FFC24D' : '#22D3EE'
                    }}
                  />
                </div>
                <ul className="strength-checks">
                  {passwordRules.map(rule => (
                    <li key={rule.key} className={checks[rule.key] ? 'met' : ''}>
                      <span className="strength-check-icon">{checks[rule.key] ? '✓' : '•'}</span>
                      {rule.label}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="register-confirm">Confirm Password</label>
            <input
              id="register-confirm"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              autoComplete="new-password"
              maxLength="72"
              required
            />
          </div>
          {error && <span className="auth-error">{error}</span>}
          <button type="submit" className="auth-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}

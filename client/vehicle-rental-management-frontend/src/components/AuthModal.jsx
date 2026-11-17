import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/api';

function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        res = await registerUser(formData);
      } else {
        res = await loginUser({
          email: formData.email,
          password: formData.password,
        });
      }

      // Store in localStorage
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));

      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for demonstration purposes
  const handleQuickFill = (role) => {
    setIsRegister(false);
    if (role === 'admin') {
      setFormData({
        name: '',
        email: 'admin@rental.com',
        phone: '',
        password: 'admin123',
      });
    } else {
      setFormData({
        name: '',
        email: 'john@example.com',
        phone: '',
        password: 'user123',
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isRegister ? 'Create Account' : 'Sign In'}</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        {/* Demo Quick-Fill Buttons */}
        <div className="demo-credentials-box">
          <span className="demo-label">Demo Logins:</span>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn btn-outline-sm"
              onClick={() => handleQuickFill('admin')}
            >
              Fill Admin (admin@rental.com)
            </button>
            <button
              type="button"
              className="btn btn-outline-sm"
              onClick={() => handleQuickFill('user')}
            >
              Fill User (john@example.com)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          {isRegister && (
            <>
              <div className="form-group">
                <label htmlFor="auth-name">Full Name</label>
                <input
                  type="text"
                  id="auth-name"
                  name="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="auth-phone">Phone Number</label>
                <input
                  type="tel"
                  id="auth-phone"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="auth-address">Delivery Address</label>
                <input
                  type="text"
                  id="auth-address"
                  name="address"
                  placeholder="e.g. 42 MG Road, Indiranagar, Bengaluru"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              type="email"
              id="auth-email"
              name="email"
              placeholder="e.g. user@domain.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              type="password"
              id="auth-password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
            >
              {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : isRegister ? 'Register' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;

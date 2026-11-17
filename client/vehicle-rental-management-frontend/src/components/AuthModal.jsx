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
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Validate an individual field and return error message string (or empty if valid)
  const validateField = (field, value, allData = formData) => {
    switch (field) {
      case 'name':
        if (!value || !value.trim()) {
          return 'Full name is required.';
        }
        if (value.trim().length < 2) {
          return 'Full name must be at least 2 characters.';
        }
        if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) {
          return 'Full name should only contain letters and spaces.';
        }
        return '';

      case 'email':
        if (!value || !value.trim()) {
          return 'Email address is required.';
        }
        // RFC 5322 compliant standard email regex
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim())) {
          return 'Please enter a valid email address (e.g. name@domain.com).';
        }
        return '';

      case 'phone': {
        if (!value || !value.trim()) {
          return 'Phone number is required.';
        }
        // Strip spaces, dashes, parentheses and optional leading +91 / 91
        const digits = value.replace(/[\s\-\(\)\+]/g, '').replace(/^91/, '');
        if (!/^\d+$/.test(digits)) {
          return 'Phone number must contain only numeric digits.';
        }
        if (digits.length !== 10) {
          return `Phone number must be exactly 10 digits (currently ${digits.length}).`;
        }
        if (!/^[6-9]\d{9}$/.test(digits)) {
          return 'Phone number must start with 6, 7, 8, or 9 (standard mobile format).';
        }
        return '';
      }

      case 'address':
        if (!value || !value.trim()) {
          return 'Delivery address is required for doorstep vehicle delivery.';
        }
        if (value.trim().length < 8) {
          return 'Please provide a complete address with street, area, and city (min 8 characters).';
        }
        return '';

      case 'password':
        if (!value) {
          return 'Password is required.';
        }
        if (value.length < 6) {
          return 'Password must be at least 6 characters long.';
        }
        return '';

      case 'confirmPassword':
        if (isRegister) {
          if (!value) {
            return 'Please confirm your password.';
          }
          if (value !== allData.password) {
            return 'Passwords do not match.';
          }
        }
        return '';

      default:
        return '';
    }
  };

  // Validate all fields relevant to current mode (login vs register)
  const validateForm = (data = formData) => {
    const fieldsToValidate = isRegister
      ? ['name', 'email', 'phone', 'address', 'password', 'confirmPassword']
      : ['email', 'password'];

    const newErrors = {};
    let isValid = true;

    for (const field of fieldsToValidate) {
      const err = validateField(field, data[field], data);
      if (err) {
        newErrors[field] = err;
        isValid = false;
      }
    }

    return { isValid, newErrors };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    // If field has already been touched or had an error, validate on the fly
    if (touched[name] || errors[name]) {
      const fieldError = validateField(name, value, updatedData);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }

    // If changing password, also re-validate confirmPassword if touched
    if (name === 'password' && touched.confirmPassword && isRegister) {
      const confirmErr = validateField('confirmPassword', formData.confirmPassword, updatedData);
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmErr,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value, formData);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Trigger full validation
    const { isValid, newErrors } = validateForm();
    if (!isValid) {
      setErrors(newErrors);
      // Mark all relevant fields as touched
      const fields = isRegister
        ? ['name', 'email', 'phone', 'address', 'password', 'confirmPassword']
        : ['email', 'password'];
      const allTouched = fields.reduce((acc, f) => ({ ...acc, [f]: true }), {});
      setTouched(allTouched);
      return;
    }

    setLoading(true);

    try {
      let res;
      if (isRegister) {
        // Sanitize phone number to standard 10 digits before dispatching to backend
        const cleanPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '').replace(/^91/, '');
        res = await registerUser({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: cleanPhone,
          address: formData.address.trim(),
          password: formData.password,
        });
      } else {
        res = await loginUser({
          email: formData.email.trim().toLowerCase(),
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
    setErrors({});
    setTouched({});
    setError('');
    if (role === 'admin') {
      setFormData({
        name: '',
        email: 'admin@rental.com',
        phone: '',
        address: '',
        password: 'admin123',
        confirmPassword: '',
      });
    } else {
      setFormData({
        name: '',
        email: 'john@example.com',
        phone: '',
        address: '',
        password: 'user123',
        confirmPassword: '',
      });
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setErrors({});
    setTouched({});
    setError('');
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

        <form onSubmit={handleSubmit} className="vehicle-form" noValidate>
          {isRegister && (
            <>
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="auth-name">Full Name *</label>
                <input
                  type="text"
                  id="auth-name"
                  name="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.name ? 'input-error' : ''}
                  autoComplete="name"
                />
                {errors.name && <span className="field-error-text">{errors.name}</span>}
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="auth-phone">Mobile Phone Number *</label>
                  <span className="field-counter" style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    10 digits
                  </span>
                </div>
                <input
                  type="tel"
                  id="auth-phone"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.phone ? 'input-error' : ''}
                  autoComplete="tel"
                />
                {errors.phone ? (
                  <span className="field-error-text">{errors.phone}</span>
                ) : (
                  <span className="field-hint-text">Used for delivery dispatch & order confirmations.</span>
                )}
              </div>

              {/* Delivery Address */}
              <div className="form-group">
                <label htmlFor="auth-address">Default Delivery Address *</label>
                <textarea
                  id="auth-address"
                  name="address"
                  rows={2}
                  placeholder="e.g. 42 MG Road, Indiranagar, Bengaluru, Karnataka 560038"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.address ? 'input-error' : ''}
                  autoComplete="street-address"
                />
                {errors.address ? (
                  <span className="field-error-text">{errors.address}</span>
                ) : (
                  <span className="field-hint-text">Address where vehicles will be delivered to you.</span>
                )}
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="auth-email">Email Address *</label>
            <input
              type="email"
              id="auth-email"
              name="email"
              placeholder="e.g. user@domain.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.email ? 'input-error' : ''}
              autoComplete="email"
            />
            {errors.email && <span className="field-error-text">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="auth-password">Password *</label>
              <button
                type="button"
                className="btn-toggle-password-inline"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide Password' : 'Show Password'}
              </button>
            </div>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                id="auth-password"
                name="password"
                placeholder={isRegister ? 'Minimum 6 characters' : 'Enter your password'}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.password ? 'input-error' : ''}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </div>
            {errors.password ? (
              <span className="field-error-text">{errors.password}</span>
            ) : isRegister ? (
              <span className="field-hint-text">Minimum 6 characters.</span>
            ) : null}
          </div>

          {/* Confirm Password (Registration Only) */}
          {isRegister && (
            <div className="form-group">
              <label htmlFor="auth-confirm-password">Confirm Password *</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="auth-confirm-password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.confirmPassword ? 'input-error' : ''}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && (
                <span className="field-error-text">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={toggleMode}
            >
              {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;

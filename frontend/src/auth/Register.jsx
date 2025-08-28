import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { register } from '../utils/api.js';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="card" style={{ width: '100%', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <div className="card__body">
            <div style={{ marginBottom: '24px' }}>
              <FiShield style={{ fontSize: '48px', color: 'var(--color-success)' }} />
            </div>
            <h2 style={{ marginBottom: '16px' }}>Account Created!</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Your account has been created successfully. You will be redirected to the login page shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: 560, margin: '0 auto' }}>
        <div className="card__body">
          <h1 className="mb-8">Create your SecureBank account</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            Join SecureBank for modern banking services
          </p>

          {error && (
            <div className="status status--error mb-8">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-control"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-control"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn--outline"
                  style={{ position: 'absolute', right: '8px', top: '4px' }}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-control"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="btn btn--outline"
                  style={{ position: 'absolute', right: '8px', top: '4px' }}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button className="btn btn--primary btn--full-width" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-8" style={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>

          <div className="mt-8" style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            <FiShield style={{ marginRight: '4px' }} />
            Secure Registration
            <br />
            Your information is protected with bank-grade encryption and security protocols.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

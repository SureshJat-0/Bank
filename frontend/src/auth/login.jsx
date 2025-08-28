import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff, FiMail, FiCreditCard } from 'react-icons/fi';
import useAuthStore from '../store/authStore.jsx';
import { login } from '../utils/api.js';

const Login = () => {
  const [loginType, setLoginType] = useState('email');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    accountNumber: '',
    pin: '',
  });

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let loginData;
      if (loginType === 'email') {
        loginData = { 
          email: formData.email.trim(), 
          password: formData.password 
        };
      } else {
        loginData = { 
          accountNumber: formData.accountNumber.trim(), 
          pin: formData.pin 
        };
      }

      console.log('Attempting login with:', loginData);
      const response = await login(loginData);
      console.log('Login successful:', response);
      
      const { token, user } = response;
      
      setAuth({
        token,
        role: user.role,
        userId: user.id,
        name: user.name,
        email: user.email
      });

      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { 
      name: 'Admin User', 
      email: 'admin@securebank.com', 
      password: 'admin123', 
      type: 'admin' 
    },
    { 
      name: 'Rajesh Kumar', 
      email: 'rajesh@securebank.com', 
      password: 'user123', 
      accountNumber: '1234567890', 
      pin: '1234' 
    },
    { 
      name: 'Priya Sharma', 
      email: 'priya@securebank.com', 
      password: 'user123', 
      accountNumber: '2345678901', 
      pin: '5678' 
    },
  ];

  const handleDemoLogin = (demo) => {
    if (loginType === 'email') {
      setFormData({ 
        ...formData, 
        email: demo.email, 
        password: demo.password 
      });
    } else if (demo.accountNumber) {
      setFormData({ 
        ...formData, 
        accountNumber: demo.accountNumber, 
        pin: demo.pin 
      });
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: 560, margin: '0 auto' }}>
        <div className="card__body">
          <h1 style={{ marginBottom: '8px' }}>Sign in to SecureBank</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            Sign in to access your banking services
          </p>

          {error && (
            <div className="status status--error" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`btn ${loginType === 'email' ? 'btn--primary' : 'btn--secondary'}`}
                onClick={() => setLoginType('email')}
              >
                <FiMail style={{ marginRight: '8px' }} />
                Email Login
              </button>
              <button
                type="button"
                className={`btn ${loginType === 'banking' ? 'btn--primary' : 'btn--secondary'}`}
                onClick={() => setLoginType('banking')}
              >
                <FiCreditCard style={{ marginRight: '8px' }} />
                Banking Login
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {loginType === 'email' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="admin@securebank.com"
                    required
                    autoComplete="email"
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
                      placeholder="admin123"
                      required
                      autoComplete="current-password"
                      style={{ paddingRight: '50px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn btn--outline"
                      style={{ 
                        position: 'absolute', 
                        right: '8px', 
                        top: '4px',
                        minWidth: '36px',
                        height: '36px',
                        padding: '8px'
                      }}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Account Number</label>
                  <input
                    className="form-control"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="1234567890"
                    required
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PIN</label>
                  <input
                    className="form-control"
                    type="password"
                    name="pin"
                    value={formData.pin}
                    onChange={handleInputChange}
                    placeholder="1234"
                    required
                    autoComplete="off"
                    maxLength="4"
                  />
                </div>
              </>
            )}

            <button 
              className="btn btn--primary btn--full-width" 
              disabled={loading}
              type="submit"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ marginBottom: '12px', color: 'var(--color-text-secondary)' }}>
              Quick Demo Login:
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {demoAccounts.map((demo, index) => (
                <button
                  key={index}
                  className="btn btn--outline"
                  onClick={() => handleDemoLogin(demo)}
                  style={{ fontSize: '12px' }}
                  type="button"
                >
                  {demo.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            New to SecureBank?{' '}
            <Link to="/register">Create an account</Link>
          </div>

          <div style={{ 
            marginTop: '24px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '12px', 
            color: 'var(--color-text-secondary)' 
          }}>
            <div>
              <FiLock style={{ marginRight: '4px' }} />
              Bank-grade Security
            </div>
            <div>
              <FiUser style={{ marginRight: '4px' }} />
              AI-Powered Assistant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff, FiMail, FiCreditCard, FiHome } from 'react-icons/fi';
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

      // Enhanced redirect logic - all users first go to dashboard
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard'); // User dashboard instead of direct chat
      }

    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { name: 'Admin User', email: 'admin@securebank.com', password: 'admin123', type: 'admin' },
    { name: 'Rajesh Kumar', email: 'rajesh@securebank.com', password: 'user123', accountNumber: '1234567890', pin: '1234' },
    { name: 'Priya Sharma', email: 'priya@securebank.com', password: 'user123', accountNumber: '2345678901', pin: '5678' },
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '28px',
            color: 'white'
          }}>
            <FiHome size={32} />
          </div>
          <h2 style={{ margin: '0 0 8px', color: '#1a202c', fontSize: '28px', fontWeight: '700' }}>
            SecureBank
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>
            Sign in to access your banking services
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Login Type Selector */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => setLoginType('email')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              background: loginType === 'email' ? 'white' : 'transparent',
              color: loginType === 'email' ? '#1a202c' : '#64748b',
              fontWeight: loginType === 'email' ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FiMail size={16} />
            Email Login
          </button>
          <button
            type="button"
            onClick={() => setLoginType('banking')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              background: loginType === 'banking' ? 'white' : 'transparent',
              color: loginType === 'banking' ? '#1a202c' : '#64748b',
              fontWeight: loginType === 'banking' ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FiCreditCard size={16} />
            Banking Login
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {loginType === 'email' ? (
            <>
              {/* Email Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#374151',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <FiMail style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }} size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#374151',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <FiLock style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }} size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Account Number Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#374151',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Account Number
                </label>
                <div style={{ position: 'relative' }}>
                  <FiCreditCard style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }} size={18} />
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  />
                </div>
              </div>

              {/* PIN Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#374151',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  PIN
                </label>
                <div style={{ position: 'relative' }}>
                  <FiLock style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }} size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="pin"
                    value={formData.pin}
                    onChange={handleInputChange}
                    placeholder="Enter your PIN"
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Signing in...
              </>
            ) : (
              <>
                <FiUser size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px'
        }}>
          <p style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            Quick Demo Login:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {demoAccounts.map((demo, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDemoLogin(demo)}
                style={{
                  padding: '8px 12px',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#374151',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.background = '#f0f4ff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.background = 'white';
                }}
              >
                <strong>{demo.name}</strong> ({demo.type}) 
                {demo.email && ` - ${demo.email}`}
                {demo.accountNumber && ` - A/c: ${demo.accountNumber}`}
              </button>
            ))}
          </div>
        </div>

        {/* Register Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>

      {/* Add spinning animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Login;

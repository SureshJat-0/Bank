import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiMessageCircle, FiUser, FiCreditCard, FiDollarSign, 
  FiPieChart, FiSettings, FiLogOut, FiSun, FiMoon,
  FiMapPin, FiPhone, FiHelpCircle, FiTrendingUp,
  FiShield, FiClock, FiArrowRight, FiActivity, FiHome
} from 'react-icons/fi';
import useAuthStore from '../store/authStore.jsx';

const UserDashboard = () => {
  const { name, email, clearAuth } = useAuthStore();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Theme management
  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  const startChat = () => {
    navigate('/chat');
  };

  // Quick actions data
  const quickActions = [
    {
      title: 'Start AI Chat',
      description: 'Chat with our intelligent banking assistant',
      icon: FiMessageCircle,
      color: '#667eea',
      bgColor: '#f0f4ff',
      action: startChat,
      primary: true
    },
    {
      title: 'Account Balance',
      description: 'Check your current balance',
      icon: FiDollarSign,
      color: '#10b981',
      bgColor: '#ecfdf5',
      action: startChat
    },
    {
      title: 'Transfer Money',
      description: 'Send money to accounts',
      icon: FiArrowRight,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      action: startChat
    },
    {
      title: 'Apply for Loan',
      description: 'Get instant loan approvals',
      icon: FiTrendingUp,
      color: '#8b5cf6',
      bgColor: '#faf5ff',
      action: startChat
    },
    {
      title: 'Card Services',
      description: 'Manage your cards',
      icon: FiCreditCard,
      color: '#ef4444',
      bgColor: '#fef2f2',
      action: startChat
    },
    {
      title: 'Find Branches',
      description: 'Locate nearest branches',
      icon: FiMapPin,
      color: '#06b6d4',
      bgColor: '#ecfeff',
      action: startChat
    }
  ];

  const bankingFeatures = [
    {
      title: 'Enhanced Security',
      description: 'Bank-grade security with ML-powered fraud detection',
      icon: FiShield,
      stats: '99.9% Uptime'
    },
    {
      title: 'Instant Processing',
      description: '24/7 automated banking services',
      icon: FiClock,
      stats: '<2s Response'
    },
    {
      title: 'Smart Analytics',
      description: 'AI-powered insights and recommendations',
      icon: FiActivity,
      stats: '95% Accuracy'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: theme === 'light' 
        ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' 
        : 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
      color: theme === 'light' ? '#1a202c' : '#f7fafc'
    }}>
      {/* Header */}
      <div style={{
        background: theme === 'light' ? 'white' : '#2d3748',
        borderBottom: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: 'white'
          }}>
            <FiHome size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              SecureBank Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
              Welcome to your banking portal
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleTheme}
            style={{
              padding: '8px',
              border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`,
              background: 'transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              color: theme === 'light' ? '#4a5568' : '#cbd5e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
          </button>
          
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: '#ef4444',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '24px' }}>
        {/* Welcome Section */}
        <div style={{
          background: theme === 'light' ? 'white' : '#2d3748',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '28px', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {greeting}, {name}!
              </h2>
              <p style={{ 
                margin: '0 0 16px 0', 
                fontSize: '16px', 
                opacity: 0.7 
              }}>
                Your intelligent banking assistant is ready to help you with all your financial needs.
              </p>
              <div style={{ 
                fontSize: '14px', 
                opacity: 0.6,
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <span>👤 {email}</span>
                <span>⏰ {new Date().toLocaleString()}</span>
              </div>
            </div>
            
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={action.action}
              style={{
                background: theme === 'light' ? 'white' : '#2d3748',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`,
                boxShadow: action.primary ? '0 8px 25px rgba(102, 126, 234, 0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
                transform: action.primary ? 'translateY(-2px)' : 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = action.primary 
                  ? '0 12px 35px rgba(102, 126, 234, 0.25)' 
                  : '0 6px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = action.primary ? 'translateY(-2px)' : 'none';
                e.currentTarget.style.boxShadow = action.primary 
                  ? '0 8px 25px rgba(102, 126, 234, 0.15)' 
                  : '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: action.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <action.icon size={24} color={action.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: action.primary ? action.color : 'inherit'
                  }}>
                    {action.title}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    opacity: 0.7,
                    lineHeight: '1.5'
                  }}>
                    {action.description}
                  </p>
                </div>
                <FiArrowRight 
                  size={20} 
                  style={{ 
                    opacity: 0.5,
                    transition: 'transform 0.2s ease'
                  }} 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Banking Features */}
        <div style={{
          background: theme === 'light' ? 'white' : '#2d3748',
          borderRadius: '16px',
          padding: '32px',
          border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            margin: '0 0 24px 0',
            fontSize: '20px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Why Choose SecureBank AI?
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {bankingFeatures.map((feature, index) => (
              <div
                key={index}
                style={{
                  textAlign: 'center',
                  padding: '20px'
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'white'
                }}>
                  <feature.icon size={28} />
                </div>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  {feature.title}
                </h4>
                <p style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  opacity: 0.7,
                  lineHeight: '1.4'
                }}>
                  {feature.description}
                </p>
                <div style={{
                  fontSize: '12px',
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  {feature.stats}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          padding: '20px',
          opacity: 0.7,
          fontSize: '14px'
        }}>
          <p style={{ margin: 0 }}>
            SecureBank © 2025 | Enhanced ML-Powered Banking Experience
          </p>
          <p style={{ margin: '8px 0 0 0' }}>
            🔒 Your data is protected with bank-grade security
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

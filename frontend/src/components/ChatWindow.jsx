import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FiLogOut, FiHelpCircle, FiMoon, FiSun, FiSettings, 
  FiUser, FiAlertTriangle, FiArrowLeft, FiHome 
} from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import useAuthStore from "../store/authStore.jsx";
import FaqList from "./FaqList.jsx";
import { createSession, getSessionMessages, sendMessage } from "../utils/api.js";

const ChatWindow = () => {
  const { sessionId: urlSessionId } = useParams();
  const [sessionId, setSessionId] = useState(urlSessionId || null);
  const [showFaqs, setShowFaqs] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const { name, clearAuth } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loadingBot, setLoadingBot] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(5);
  const [conversationFlow, setConversationFlow] = useState(null);
  const [slotFilling, setSlotFilling] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Theme management
  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Initialize chat session
  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const sessionData = await createSession();
        currentSessionId = sessionData.sessionId;
        setSessionId(currentSessionId);
        navigate(`/chat/${currentSessionId}`, { replace: true });
      }
      await fetchMessages(currentSessionId);
    } catch (error) {
      console.error('Error initializing chat:', error);
      handleConnectionError();
    }
  };

  const fetchMessages = async (sid = sessionId) => {
    try {
      const messages = await getSessionMessages(sid);
      setMessages(messages);
      setConnectionError(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      handleConnectionError();
    }
  };

  const handleConnectionError = () => {
    setConnectionError(true);
    let count = 5;
    setRetryCountdown(count);
    const timer = setInterval(() => {
      count -= 1;
      setRetryCountdown(count);
      if (count === 0) {
        clearInterval(timer);
        setConnectionError(false);
        if (sessionId) {
          fetchMessages();
        }
      }
    }, 1000);
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !sessionId) return;

    const userMsg = {
      sender: "user",
      text: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setMessageText("");

    setTimeout(() => {
      setLoadingBot(true);
    }, 300);

    try {
      const response = await sendMessage({
        sessionId,
        messageText,
        userId: null
      });

      // Handle slot filling
      if (response.bot.needs_slot_filling) {
        setSlotFilling({
          intent: response.bot.intent,
          pending_slots: response.bot.pending_slots,
          filled_slots: response.bot.filled_slots
        });
      } else {
        setSlotFilling(null);
      }

      // Set conversation flow context if needed
      if (response.bot.intent && response.bot.confidence > 0.8) {
        setConversationFlow({
          intent: response.bot.intent,
          confidence: response.bot.confidence,
          entities: response.bot.entities
        });
      }

      // Simulate realistic bot response delay
      const delay = Math.floor(Math.random() * 2000) + 1000;
      setTimeout(() => {
        setMessages(prev => [...prev, response.bot]);
        setLoadingBot(false);
      }, delay);

    } catch (error) {
      console.error('Error sending message:', error);
      setLoadingBot(false);
      handleConnectionError();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  // Enhanced quick action messages
  const quickActions = [
    "Check my balance",
    "Transfer money",
    "Apply for loan",
    "Block my card",
    "Find branch",
    "Account information"
  ];

  const sendQuickAction = (action) => {
    setMessageText(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  // Render slot filling prompts
  const renderSlotFillingPrompt = () => {
    if (!slotFilling || !slotFilling.pending_slots) return null;

    const pendingSlots = Object.keys(slotFilling.pending_slots);
    if (pendingSlots.length === 0) return null;

    return (
      <div className="slot-filling-prompt" style={{
        background: theme === 'light' ? '#fef3c7' : '#44403c',
        border: `1px solid ${theme === 'light' ? '#f59e0b' : '#a16207'}`,
        borderRadius: '8px',
        padding: '12px',
        margin: '12px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <FiAlertTriangle style={{ color: theme === 'light' ? '#f59e0b' : '#fbbf24', flexShrink: 0 }} />
        <div>
          <strong>Additional Information Needed</strong>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
            Please provide: {pendingSlots.join(', ')}
          </p>
        </div>
      </div>
    );
  };

  // Render conversation context
  const renderConversationContext = () => {
    if (!conversationFlow) return null;

    return (
      <div className="conversation-context" style={{
        background: theme === 'light' ? '#dbeafe' : '#1e3a8a',
        border: `1px solid ${theme === 'light' ? '#3b82f6' : '#60a5fa'}`,
        borderRadius: '8px',
        padding: '8px 12px',
        margin: '8px 0',
        fontSize: '12px',
        color: theme === 'light' ? '#1e40af' : '#93c5fd'
      }}>
        🤖 Context: {conversationFlow.intent} ({(conversationFlow.confidence * 100).toFixed(0)}% confidence)
        {conversationFlow.entities.length > 0 && (
          <span> • Detected: {conversationFlow.entities.map(e => e.label).join(', ')}</span>
        )}
      </div>
    );
  };

  if (connectionError) {
    return (
      <div className="error-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
        background: theme === 'light' ? '#f8fafc' : '#1a202c',
        color: theme === 'light' ? '#1a202c' : '#f7fafc'
      }}>
        <div className="error-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
        <h2>Connection Issue</h2>
        <p>Unable to connect to banking services. Retrying in {retryCountdown} seconds...</p>
        <div className="retry-progress" style={{
          width: '200px',
          height: '4px',
          background: theme === 'light' ? '#e2e8f0' : '#4a5568',
          borderRadius: '2px',
          overflow: 'hidden',
          marginTop: '16px'
        }}>
          <div style={{
            width: `${((5 - retryCountdown) / 5) * 100}%`,
            height: '100%',
            background: '#667eea',
            transition: 'width 1s ease'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container" style={{
      display: 'flex',
      height: '100vh',
      background: theme === 'light' ? '#f8fafc' : '#1a202c'
    }}>
      {/* Sidebar */}
      <div className="sidebar" style={{
        width: '280px',
        background: theme === 'light' ? 'white' : '#2d3748',
        borderRight: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* User info */}
        <div className="user-info" style={{
          padding: '20px',
          borderBottom: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: '600', color: theme === 'light' ? '#1a202c' : '#f7fafc' }}>
                {name || 'User'}
              </div>
              <div style={{ fontSize: '12px', color: theme === 'light' ? '#64748b' : '#a0aec0' }}>
                SecureBank Customer
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="navigation" style={{ padding: '20px' }}>
          <button
            onClick={goToDashboard}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}
          >
            <FiHome size={16} />
            Back to Dashboard
          </button>
        </div>

        {/* Quick actions */}
        <div className="quick-actions" style={{ padding: '0 20px' }}>
          <h3 style={{ 
            marginBottom: '12px', 
            fontSize: '14px', 
            fontWeight: '600',
            color: theme === 'light' ? '#374151' : '#e2e8f0'
          }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => sendQuickAction(action)}
                style={{
                  padding: '8px 12px',
                  background: theme === 'light' ? '#f8fafc' : '#374151',
                  border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  color: theme === 'light' ? '#374151' : '#e2e8f0'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = theme === 'light' ? '#f0f4ff' : '#4a5568';
                  e.target.style.borderColor = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = theme === 'light' ? '#f8fafc' : '#374151';
                  e.target.style.borderColor = theme === 'light' ? '#e2e8f0' : '#4a5568';
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="controls" style={{
          marginTop: 'auto',
          padding: '20px',
          borderTop: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={toggleTheme}
              style={{
                padding: '8px',
                background: 'none',
                border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme === 'light' ? '#64748b' : '#a0aec0'
              }}
            >
              {theme === 'light' ? <FiMoon /> : <FiSun />}
            </button>
            <button
              onClick={() => setShowFaqs(!showFaqs)}
              style={{
                padding: '8px',
                background: 'none',
                border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme === 'light' ? '#64748b' : '#a0aec0'
              }}
            >
              <FiHelpCircle />
            </button>
            <button
              onClick={logout}
              style={{
                padding: '8px',
                background: 'none',
                border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}
            >
              <FiLogOut />
            </button>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="chat-main" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div className="chat-header" style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`,
          background: theme === 'light' ? 'white' : '#2d3748'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '600',
            color: theme === 'light' ? '#1a202c' : '#f7fafc'
          }}>
            🏦 SecureBank AI Assistant
          </h1>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '14px', 
            color: theme === 'light' ? '#64748b' : '#a0aec0' 
          }}>
            Enhanced with ML-powered conversation flows
          </p>
        </div>

        {/* Messages area */}
        <div className="messages-area" style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          background: theme === 'light' ? '#f8fafc' : '#1a202c'
        }}>
          {/* Conversation context */}
          {renderConversationContext()}
          
          {/* Slot filling prompt */}
          {renderSlotFillingPrompt()}

          {/* Messages */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender}`}
              style={{
                display: 'flex',
                marginBottom: '16px',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: message.sender === 'user' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : theme === 'light' ? 'white' : '#2d3748',
                  color: message.sender === 'user' 
                    ? 'white' 
                    : theme === 'light' ? '#1a202c' : '#f7fafc',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: message.sender === 'bot' ? `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}` : 'none'
                }}
              >
                {message.text}
                {message.sender === 'bot' && message.confidence && (
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.7,
                    marginTop: '4px'
                  }}>
                    {message.method} • {(message.confidence * 100).toFixed(0)}% confidence
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loadingBot && (
            <div className="message bot" style={{
              display: 'flex',
              marginBottom: '16px',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: theme === 'light' ? 'white' : '#2d3748',
                color: theme === 'light' ? '#64748b' : '#a0aec0',
                border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`
              }}>
                <div className="typing-dots">
                  <span>●</span><span>●</span><span>●</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="input-area" style={{
          padding: '20px',
          borderTop: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`,
          background: theme === 'light' ? 'white' : '#2d3748'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }}>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your banking query here..."
              style={{
                flex: 1,
                minHeight: '44px',
                maxHeight: '120px',
                padding: '12px 16px',
                border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`,
                borderRadius: '12px',
                background: theme === 'light' ? '#f8fafc' : '#374151',
                color: theme === 'light' ? '#1a202c' : '#f7fafc',
                resize: 'vertical',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none'
              }}
              disabled={loadingBot}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || loadingBot}
              style={{
                padding: '12px',
                background: messageText.trim() && !loadingBot 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : theme === 'light' ? '#e2e8f0' : '#4a5568',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: messageText.trim() && !loadingBot ? 'pointer' : 'not-allowed',
                opacity: messageText.trim() && !loadingBot ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}
            >
              <IoSend />
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Panel */}
      {showFaqs && (
        <div className="faq-panel" style={{
          width: '320px',
          background: theme === 'light' ? 'white' : '#2d3748',
          borderLeft: `1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'}`
        }}>
          <FaqList visible={showFaqs} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;

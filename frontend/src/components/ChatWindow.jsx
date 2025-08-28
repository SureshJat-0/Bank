import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiLogOut, FiHelpCircle, FiMoon, FiSun, FiSettings, FiUser } from "react-icons/fi";
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

  // Quick action messages
  const quickActions = [
    "Check my balance",
    "Show transaction history", 
    "Help with money transfer",
    "Loan information",
    "Block my card"
  ];

  const sendQuickAction = (action) => {
    setMessageText(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  if (connectionError) {
    return (
      <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <div className="card" style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}>
          <div className="card__body" style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, margin: "0 auto 24px", backgroundColor: "var(--color-error)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiSettings style={{ color: "white", fontSize: "24px" }} />
            </div>
            <h3>Connection Error</h3>
            <p style={{ marginTop: "16px", color: "var(--color-text-secondary)" }}>
              Unable to connect to banking services. Retrying in {retryCountdown} seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-background)" }}>
      {/* Header */}
      <header className="px-16 py-16" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))", borderRadius: "50%" }} />
          <div>
            <h3 style={{ margin: 0 }}>SecureBank Assistant</h3>
            <span style={{ fontSize: "12px", color: "var(--color-success)" }}>● Online</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button className="btn btn--outline" onClick={toggleTheme}>
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
          <div className="btn btn--outline" style={{ cursor: "default" }}>
            <FiUser style={{ marginRight: "6px" }} /> 
            {name || 'User'}
          </div>
          <button className="btn btn--outline" onClick={() => setShowFaqs(!showFaqs)}>
            <FiHelpCircle />
          </button>
          <button className="btn btn--outline" onClick={logout}>
            <FiLogOut />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: "16px"
            }}
          >
            <div
              style={{
                maxWidth: "720px",
                padding: "12px 16px",
                borderRadius: "12px",
                backgroundColor: msg.sender === 'user' ? 'var(--color-primary)' : 'var(--color-surface)',
                color: msg.sender === 'user' ? 'var(--color-btn-primary-text)' : 'var(--color-text)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--color-border)',
                whiteSpace: "pre-wrap"
              }}
            >
              <div>{msg.text}</div>
              {msg.intent && msg.sender === 'bot' && (
                <div style={{ marginTop: "8px", fontSize: "12px", opacity: 0.7 }}>
                  Intent: {msg.intent}
                </div>
              )}
              <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "4px" }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {loadingBot && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
            <div className="card" style={{ padding: "12px 16px" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Assistant is typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-16 py-16" style={{ borderTop: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "12px" }}>
            Quick actions to get started:
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {quickActions.map((action) => (
              <button
                key={action}
                className="btn btn--outline"
                onClick={() => sendQuickAction(action)}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="px-16 py-16" style={{ borderTop: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
          <textarea
            rows={1}
            className="form-control"
            placeholder="Type your banking question..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loadingBot}
            style={{ flex: 1, resize: "none", minHeight: "44px" }}
          />
          <button
            className="btn btn--primary"
            onClick={handleSendMessage}
            disabled={!messageText.trim() || loadingBot}
            style={{ height: "44px", minWidth: "44px" }}
          >
            <IoSend />
          </button>
        </div>
      </div>

      {/* FAQ Sidebar */}
      {showFaqs && (
        <div style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: "360px",
          borderLeft: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          zIndex: 1000
        }}>
          <button
            className="btn btn--outline"
            onClick={() => setShowFaqs(false)}
            style={{ position: "absolute", top: "16px", right: "16px", zIndex: 1001 }}
          >
            ×
          </button>
          <FaqList visible={showFaqs} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;

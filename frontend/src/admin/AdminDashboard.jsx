import React, { useEffect, useState } from "react";
import { FiRefreshCw, FiDownload, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore.jsx";
import Faqs from "./Faqs.jsx";
import { getAdminLogs, refreshAnalytics, downloadLogs } from "../utils/api.js";

const AdminDashboard = () => {
  const { name, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const [userMessages, setUserMessages] = useState([]);
  const [botMessages, setBotMessages] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalQueries: 0,
    successRate: 0,
    intentsCount: 0,
    entitiesCount: 0
  });
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [logsData, analyticsData] = await Promise.all([
        getAdminLogs(),
        refreshAnalytics()
      ]);
      
      setUserMessages(logsData.UserMessages || []);
      setBotMessages(logsData.BotMessages || []);
      setQueries(logsData.UserMessages || []);
      
      setAnalytics({
        totalQueries: analyticsData.queries || 0,
        successRate: (analyticsData.success || 0) * 100,
        intentsCount: analyticsData.intents || 0,
        entitiesCount: analyticsData.entity || 0
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "dashboard" || activeTab === "userQueries") {
      fetchAllData();
    }
  }, [activeTab]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleExportLogs = async () => {
    try {
      const blob = await downloadLogs();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat_logs_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading logs:', error);
    }
  };

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="container" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div className="px-16 py-16" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)" }}>
        <div>
          <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
          <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>Welcome back, {name}</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className={`btn ${activeTab === 'dashboard' ? 'btn--primary' : 'btn--outline'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Analytics
          </button>
          <button
            className={`btn ${activeTab === 'userQueries' ? 'btn--primary' : 'btn--outline'}`}
            onClick={() => setActiveTab('userQueries')}
          >
            User Queries
          </button>
          <button
            className={`btn ${activeTab === 'faqs' ? 'btn--primary' : 'btn--outline'}`}
            onClick={() => setActiveTab('faqs')}
          >
            FAQs
          </button>
          <button className="btn btn--outline" onClick={logout}>
            <FiLogOut style={{ marginRight: "8px" }} />
            Logout
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="px-16 py-16">
          <h3 style={{ marginBottom: "24px" }}>Analytics Overview</h3>
          
          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            <div className="card">
              <div className="card__body" style={{ textAlign: "center" }}>
                <h4 style={{ color: "var(--color-text-secondary)", fontSize: "14px", margin: "0 0 8px 0" }}>Total Queries</h4>
                <h2 style={{ color: "var(--color-primary)", margin: 0 }}>{analytics.totalQueries}</h2>
              </div>
            </div>
            <div className="card">
              <div className="card__body" style={{ textAlign: "center" }}>
                <h4 style={{ color: "var(--color-text-secondary)", fontSize: "14px", margin: "0 0 8px 0" }}>Success Rate</h4>
                <h2 style={{ color: "var(--color-success)", margin: 0 }}>{analytics.successRate.toFixed(1)}%</h2>
              </div>
            </div>
            <div className="card">
              <div className="card__body" style={{ textAlign: "center" }}>
                <h4 style={{ color: "var(--color-text-secondary)", fontSize: "14px", margin: "0 0 8px 0" }}>Unique Intents</h4>
                <h2 style={{ color: "var(--color-warning)", margin: 0 }}>{analytics.intentsCount}</h2>
              </div>
            </div>
            <div className="card">
              <div className="card__body" style={{ textAlign: "center" }}>
                <h4 style={{ color: "var(--color-text-secondary)", fontSize: "14px", margin: "0 0 8px 0" }}>Entities Detected</h4>
                <h2 style={{ color: "var(--color-info)", margin: 0 }}>{analytics.entitiesCount}</h2>
              </div>
            </div>
          </div>

          {/* Recent User Queries */}
          <div className="card">
            <div className="card__body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Recent User Queries</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn--outline" onClick={fetchAllData}>
                  <FiRefreshCw style={{ marginRight: "8px" }} />
                  Refresh
                </button>
                <button className="btn btn--outline" onClick={handleExportLogs}>
                  <FiDownload style={{ marginRight: "8px" }} />
                  Export CSV
                </button>
              </div>
            </div>
            <div className="px-16 py-16">
              {loading ? (
                <div>Loading queries...</div>
              ) : queries.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                        <th style={{ padding: "12px", textAlign: "left" }}>Query</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Intent</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Confidence</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queries.slice(0, 10).map((q, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <td style={{ padding: "12px" }}>{q.text || 'N/A'}</td>
                          <td style={{ padding: "12px" }}>{botMessages[i]?.intent || 'unknown'}</td>
                          <td style={{ padding: "12px" }}>
                            {botMessages[i]?.confidence 
                              ? `${(botMessages[i].confidence * 100).toFixed(1)}%`
                              : 'N/A'
                            }
                          </td>
                          <td style={{ padding: "12px", color: "var(--color-text-secondary)" }}>
                            {formatDate(q.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                  No queries found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All User Queries */}
      {activeTab === 'userQueries' && (
        <div className="px-16 py-16">
          <h3 style={{ marginBottom: "24px" }}>All User Queries</h3>
          <div className="card">
            <div className="px-16 py-16">
              {loading ? (
                <div>Loading queries...</div>
              ) : queries.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                        <th style={{ padding: "12px", textAlign: "left" }}>Query</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queries.map((q, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <td style={{ padding: "12px" }}>{q.text}</td>
                          <td style={{ padding: "12px", color: "var(--color-text-secondary)" }}>
                            {formatDate(q.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                  No queries found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FAQs Management */}
      {activeTab === 'faqs' && <Faqs />}
    </div>
  );
};

export default AdminDashboard;

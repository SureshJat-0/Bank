import React, { useState } from "react";
import { FiSearch, FiTarget, FiTag, FiCpu, FiTrendingUp, FiActivity } from "react-icons/fi";
import { analyzeQuery } from "../utils/api.js";

const IntentEntityRecognizer = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState({
    intent: "",
    confidence: 0,
    entities: [],
    method: "",
    all_probabilities: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!query.trim()) {
      setError("Please enter a query to analyze");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await analyzeQuery(query);
      setResponse(result);
    } catch (err) {
      console.error("Error analyzing query:", err);
      setError("Failed to analyze query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'var(--color-success)';
    if (confidence >= 0.6) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getMethodIcon = (method) => {
    if (method === 'ml') return <FiCpu style={{ color: 'var(--color-primary)' }} />;
    if (method === 'rule') return <FiTrendingUp style={{ color: 'var(--color-warning)' }} />;
    return <FiActivity />;
  };

  const getMethodBadge = (method) => {
    const badges = {
      'ml': { text: 'Machine Learning', color: 'var(--color-success)', bg: 'var(--color-bg-3)' },
      'rule': { text: 'Rule-based', color: 'var(--color-warning)', bg: 'var(--color-bg-2)' },
      'fallback': { text: 'Fallback', color: 'var(--color-info)', bg: 'var(--color-bg-1)' }
    };
    const badge = badges[method] || badges.fallback;
    
    return (
      <span style={{
        backgroundColor: badge.bg,
        color: badge.color,
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {getMethodIcon(method)}
        {badge.text}
      </span>
    );
  };

  const sampleQueries = [
    "What's my account balance?",
    "Transfer ₹5000 to account 123456789", 
    "I lost my credit card, please block it",
    "Apply for home loan of 20 lakhs",
    "Where is the nearest branch?",
    "Show my transaction history for last month",
    "I need a personal loan urgently",
    "Block my ATM card immediately",
    "What are the interest rates for car loan?",
    "Create a new savings account"
  ];

  return (
    <div className="container" style={{ minHeight: "100vh", paddingTop: "32px", paddingBottom: "32px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <FiCpu style={{ color: "var(--color-primary)" }} />
            ML-Powered Intent Analysis
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "18px" }}>
            Advanced AI model trained on 1000+ banking queries for accurate intent recognition
          </p>
        </div>

        <div className="card" style={{ marginBottom: "32px" }}>
          <div className="card__body">
            <div className="form-group">
              <label className="form-label">Enter banking query to analyze</label>
              <div style={{ display: "flex", gap: "12px" }}>
                <textarea
                  rows={2}
                  className="form-control"
                  placeholder="Type a banking query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ flex: 1, fontSize: "16px" }}
                />
                <button
                  className="btn btn--primary"
                  onClick={handleAnalyze}
                  disabled={loading || !query.trim()}
                  style={{ alignSelf: "flex-start", minWidth: "140px", height: "48px" }}
                >
                  <FiSearch style={{ marginRight: "8px" }} />
                  {loading ? "Analyzing..." : "Analyze"}
                </button>
              </div>
            </div>

            {error && (
              <div className="status status--error">{error}</div>
            )}

            <div style={{ marginTop: "16px" }}>
              <p style={{ marginBottom: "12px", fontWeight: "500", color: "var(--color-text)" }}>
                Sample queries to test:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {sampleQueries.map((sample, index) => (
                  <button
                    key={index}
                    className="btn btn--outline"
                    onClick={() => setQuery(sample)}
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: "24px", marginBottom: "32px" }}>
          {/* Intent Analysis */}
          <div className="card">
            <div className="card__body">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <FiTarget style={{ color: "var(--color-primary)" }} />
                <h3 style={{ margin: 0 }}>Intent Detection</h3>
              </div>
              
              {response.intent ? (
                <div>
                  <div style={{ marginBottom: "16px" }}>
                    <span style={{ 
                      backgroundColor: "var(--color-secondary)",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "var(--color-primary)"
                    }}>
                      {response.intent}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ fontWeight: "500" }}>Confidence:</span>
                      <span style={{ 
                        color: getConfidenceColor(response.confidence),
                        fontWeight: "700",
                        fontSize: "18px"
                      }}>
                        {(response.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    {/* Confidence bar */}
                    <div style={{ 
                      width: "100%", 
                      height: "8px", 
                      backgroundColor: "var(--color-border)", 
                      borderRadius: "4px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${response.confidence * 100}%`,
                        height: "100%",
                        backgroundColor: getConfidenceColor(response.confidence),
                        transition: "width 0.3s ease"
                      }} />
                    </div>
                  </div>
                  
                  {response.method && (
                    <div style={{ marginTop: "12px" }}>
                      {getMethodBadge(response.method)}
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>
                  No intent detected yet. Try analyzing a query above.
                </p>
              )}
            </div>
          </div>

          {/* Entity Extraction */}
          <div className="card">
            <div className="card__body">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <FiTag style={{ color: "var(--color-primary)" }} />
                <h3 style={{ margin: 0 }}>Entity Extraction</h3>
              </div>
              
              {response.entities && response.entities.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {response.entities.map((entity, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: "var(--color-bg-1)",
                        border: "1px solid var(--color-border)",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        fontSize: "14px"
                      }}
                    >
                      <div style={{ 
                        fontWeight: "600", 
                        color: "var(--color-primary)", 
                        fontSize: "12px",
                        marginBottom: "4px"
                      }}>
                        {entity.label}
                      </div>
                      <div style={{ fontWeight: "500", fontSize: "16px" }}>
                        {entity.value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>
                  No entities detected yet. Try queries with amounts, account numbers, or card types.
                </p>
              )}
            </div>
          </div>

          {/* Model Stats */}
          <div className="card">
            <div className="card__body">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <FiTrendingUp style={{ color: "var(--color-primary)" }} />
                <h3 style={{ margin: 0, fontSize: "18px" }}>Model Info</h3>
              </div>
              
              <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Training Data:</strong><br />1000+ queries
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Intents:</strong><br />15 categories
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Algorithm:</strong><br />Logistic Regression
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Features:</strong><br />TF-IDF + N-grams
                </div>
                <div>
                  <strong>Accuracy:</strong><br />
                  <span style={{ color: "var(--color-success)", fontWeight: "600" }}>~85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Probability Distribution */}
        {response.all_probabilities && Object.keys(response.all_probabilities).length > 0 && (
          <div className="card" style={{ marginBottom: "32px" }}>
            <div className="card__body">
              <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FiActivity style={{ color: "var(--color-primary)" }} />
                Intent Probability Distribution
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                {Object.entries(response.all_probabilities)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 8)
                  .map(([intent, prob]) => (
                    <div key={intent} style={{ 
                      padding: "12px",
                      backgroundColor: intent === response.intent ? "var(--color-bg-3)" : "var(--color-bg-1)",
                      borderRadius: "8px",
                      border: intent === response.intent ? "2px solid var(--color-success)" : "1px solid var(--color-border)"
                    }}>
                      <div style={{ fontWeight: "500", fontSize: "12px", marginBottom: "4px" }}>
                        {intent}
                      </div>
                      <div style={{ fontWeight: "600", color: "var(--color-primary)" }}>
                        {(prob * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Information Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div className="card">
            <div className="card__body">
              <h4 style={{ marginBottom: "16px", color: "var(--color-primary)" }}>Supported Banking Intents</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "14px" }}>
                <div>• Balance inquiry</div>
                <div>• Money transfers</div>
                <div>• Loan applications</div>
                <div>• Card services</div>
                <div>• Branch locations</div>
                <div>• Account information</div>
                <div>• Transaction history</div>
                <div>• Card blocking</div>
                <div>• Interest rates</div>
                <div>• Account opening</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__body">
              <h4 style={{ marginBottom: "16px", color: "var(--color-primary)" }}>Entity Types Detected</h4>
              <ul style={{ color: "var(--color-text-secondary)", fontSize: "14px", margin: 0, paddingLeft: "20px" }}>
                <li><strong>AMOUNT</strong> - Currency values (₹, Rs, rupees)</li>
                <li><strong>ACCOUNT_NUMBER</strong> - Bank account IDs</li>
                <li><strong>CARD_TYPE</strong> - Credit, debit, ATM cards</li>
                <li><strong>ACCOUNT_TYPE</strong> - Savings, current, etc.</li>
                <li><strong>LOAN_TYPE</strong> - Home, car, personal loans</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntentEntityRecognizer;

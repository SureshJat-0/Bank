import React, { useState, useEffect } from "react";
import { FiChevronDown, FiChevronUp, FiHelpCircle } from "react-icons/fi";
import { getUserFaqs } from "../utils/api.js";

const FaqList = ({ visible }) => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchFaqs();
    }
  }, [visible]);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await getUserFaqs();
      setFaqs(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      setError("Failed to load FAQs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!visible) return null;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="px-16 py-16" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiHelpCircle style={{ color: "var(--color-teal-600)" }} />
          <h3 style={{ margin: 0 }}>Frequently Asked Questions</h3>
        </div>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "8px", margin: 0 }}>
          Quick answers to common banking questions
        </p>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
        {loading ? (
          <div>Loading FAQs...</div>
        ) : error ? (
          <div className="status status--error">{error}</div>
        ) : faqs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {faqs.map((faq, index) => (
              <div key={faq._id || index} className="card">
                <button
                  className="btn btn--outline btn--full-width"
                  onClick={() => toggleFaq(index)}
                  style={{ textAlign: "left", justifyContent: "space-between" }}
                >
                  <span>{faq.question}</span>
                  {openIndex === index ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openIndex === index && (
                  <div className="px-16 py-16" style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
            No FAQs available at the moment.
          </div>
        )}

        <div className="card" style={{ marginTop: "24px" }}>
          <div className="card__body" style={{ textAlign: "center" }}>
            <FiHelpCircle style={{ fontSize: "24px", color: "var(--color-primary)", marginBottom: "8px" }} />
            <p style={{ margin: 0, fontSize: "14px", color: "var(--color-text-secondary)" }}>
              Need more help? Contact our support team for personalized assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqList;

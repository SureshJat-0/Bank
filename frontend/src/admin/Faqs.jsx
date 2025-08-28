import React, { useEffect, useState } from "react";
import { FiTrash2, FiPlus, FiSave, FiX, FiHelpCircle } from "react-icons/fi";
import { getAdminFaqs, createFaq, deleteFaq } from "../utils/api.js";

const Faqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await getAdminFaqs();
      setFaqs(data);
    } catch (err) {
      console.error("Error fetching FAQs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      alert("Please fill in both question and answer fields.");
      return;
    }

    try {
      setSubmitting(true);
      const createdFaq = await createFaq(newFaq);
      setFaqs((prev) => [...prev, createdFaq]);
      setNewFaq({ question: "", answer: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding FAQ", err);
      alert("Failed to create FAQ. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      await deleteFaq(id);
      setFaqs((prev) => prev.filter((faq) => faq._id !== id));
    } catch (err) {
      console.error("Error deleting FAQ", err);
      alert("Failed to delete FAQ. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="px-16 py-16">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h3 style={{ margin: 0 }}>FAQ Management</h3>
          <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
            Manage frequently asked questions for users
          </p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => setShowAddForm(true)}
        >
          <FiPlus style={{ marginRight: "8px" }} />
          Add FAQ
        </button>
      </div>

      {/* Add FAQ Form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card__body">
            <h4 style={{ marginBottom: "16px" }}>Add New FAQ</h4>
            <div className="form-group">
              <label className="form-label">Question</label>
              <input
                className="form-control"
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                placeholder="Enter the question..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Answer</label>
              <textarea
                className="form-control"
                rows="4"
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                placeholder="Enter the answer..."
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn btn--primary"
                onClick={handleAddFaq}
                disabled={submitting}
              >
                <FiSave style={{ marginRight: "8px" }} />
                {submitting ? "Saving..." : "Save FAQ"}
              </button>
              <button
                className="btn btn--outline"
                onClick={() => {
                  setShowAddForm(false);
                  setNewFaq({ question: "", answer: "" });
                }}
              >
                <FiX style={{ marginRight: "8px" }} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQs Table */}
      <div className="card">
        <div className="px-16 py-16">
          {loading ? (
            <div>Loading FAQs...</div>
          ) : faqs.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                    <th style={{ padding: "12px", textAlign: "left" }}>Question</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Answer</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Created</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.map((faq) => (
                    <tr key={faq._id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={{ padding: "12px", fontWeight: "500" }}>{faq.question}</td>
                      <td style={{ padding: "12px", color: "var(--color-text-secondary)", maxWidth: "300px" }}>
                        {faq.answer.length > 100 ? `${faq.answer.substring(0, 100)}...` : faq.answer}
                      </td>
                      <td style={{ padding: "12px", color: "var(--color-text-secondary)" }}>
                        {formatDate(faq.created_at)}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button
                          className="btn btn--outline"
                          onClick={() => handleDeleteFaq(faq._id)}
                          style={{ color: "var(--color-error)" }}
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px", color: "var(--color-text-secondary)" }}>
              <FiHelpCircle style={{ fontSize: "48px", marginBottom: "16px" }} />
              <h4>No FAQs found</h4>
              <p>Create your first FAQ to help users with common questions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Faqs;

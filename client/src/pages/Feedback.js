import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { feedbackAPI } from "../utils/api";
import "../styles/Feedback.css";

export const Feedback = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("submit");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myFeedback, setMyFeedback] = useState([]);
  const [formData, setFormData] = useState({
    type: "general",
    subject: "",
    message: "",
    predictionId: ""
  });
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) navigate("/login");
    else if (activeTab === "history") loadMyFeedback();
  }, [token, navigate, activeTab]);

  const loadMyFeedback = async () => {
    setLoading(true);
    try {
      const res = await feedbackAPI.getMyFeedback();
      setMyFeedback(res.data.data || []);
    } catch (err) {
      console.error("Error loading feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      return;
    }

    setSubmitting(true);
    try {
      await feedbackAPI.submitFeedback({
        type: formData.type,
        subject: formData.subject,
        message: formData.message,
        predictionId: formData.predictionId || null
      });
      setSuccess("Thank you! Your feedback has been submitted successfully.");
      setFormData({
        type: "general",
        subject: "",
        message: "",
        predictionId: ""
      });
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("Error submitting feedback:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "status-pending",
      reviewed: "status-reviewed",
      resolved: "status-resolved",
      dismissed: "status-dismissed"
    };
    return badges[status] || "status-pending";
  };

  const getTypeLabel = (type) => {
    const labels = {
      general: "General Feedback",
      bug: "Bug Report",
      feature: "Feature Request",
      prediction_error: "Prediction Error",
      other: "Other"
    };
    return labels[type] || type;
  };

  if (!token) return null;

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        <header className="feedback-header">
          <h1>Feedback & Support</h1>
          <p>We value your input! Share your thoughts, report issues, or request features.</p>
        </header>

        <div className="feedback-tabs">
          <button
            className={`tab-btn ${activeTab === "submit" ? "active" : ""}`}
            onClick={() => setActiveTab("submit")}
          >
            Submit Feedback
          </button>
          <button
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            My Feedback History
          </button>
        </div>

        {activeTab === "submit" && (
          <div className="feedback-form-section">
            <form onSubmit={handleSubmit} className="feedback-form">
              <div className="form-group">
                <label>Feedback Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="general">General Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="prediction_error">Prediction Error</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Subject <span className="required">*</span></label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief description of your feedback"
                  maxLength={200}
                  required
                />
                <small>{formData.subject.length}/200 characters</small>
              </div>

              <div className="form-group">
                <label>Message <span className="required">*</span></label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please provide detailed information..."
                  rows="8"
                  maxLength={2000}
                  required
                />
                <small>{formData.message.length}/2000 characters</small>
              </div>

              <div className="form-group">
                <label>Related Prediction ID (optional)</label>
                <input
                  type="text"
                  name="predictionId"
                  value={formData.predictionId}
                  onChange={handleChange}
                  placeholder="If this feedback relates to a specific prediction"
                />
              </div>

              {success && (
                <div className="success-message">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !formData.subject || !formData.message}
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "history" && (
          <div className="feedback-history-section">
            {loading ? (
              <div className="loading-state">Loading your feedback...</div>
            ) : myFeedback.length === 0 ? (
              <div className="empty-state">
                <p>You haven't submitted any feedback yet.</p>
              </div>
            ) : (
              <div className="feedback-list">
                {myFeedback.map((item) => (
                  <div key={item._id} className="feedback-item">
                    <div className="feedback-item-header">
                      <div className="feedback-item-meta">
                        <span className={`type-badge type-${item.type}`}>
                          {getTypeLabel(item.type)}
                        </span>
                        <span className={`status-badge ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <span className="feedback-date">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="feedback-subject">{item.subject}</h3>
                    <p className="feedback-message">{item.message}</p>
                    {item.adminNotes && (
                      <div className="admin-response">
                        <strong>Admin Response:</strong>
                        <p>{item.adminNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;


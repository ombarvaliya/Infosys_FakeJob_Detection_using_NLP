import React, { useState, useEffect } from "react";
import { adminAPI, predictionsAPI } from "../utils/api";
import "../styles/JobDetailsModal.css";

const JobDetailsModal = ({ jobId, isOpen, onClose }) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && jobId) {
      loadJobDetails();
    }
  }, [isOpen, jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      // Try to get from predictions first (user dashboard)
      // Fall back to admin endpoint if not found
      try {
        const response = await predictionsAPI.getDetails(jobId);
        setJobDetails(response.data.data || response.data);
        setError(null);
      } catch (err) {
        // Fall back to admin endpoint
        const response = await adminAPI.getJobDetails(jobId);
        setJobDetails(response.data.data);
        setError(null);
      }
    } catch (err) {
      console.error("Error loading job details:", err);
      setError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Job Details</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading job details...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={loadJobDetails} className="btn-retry">Retry</button>
            </div>
          )}

          {jobDetails && !loading && (
            <div className="details-content">
              {/* User Info */}
              <div className="details-section">
                <h3>User Information</h3>
                <div className="detail-row">
                  <span className="label">User:</span>
                  <span className="value">{jobDetails.userId?.fullName || "Unknown"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="value">{jobDetails.userId?.email || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Submitted:</span>
                  <span className="value">{new Date(jobDetails.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Job Info */}
              <div className="details-section">
                <h3>Job Information</h3>
                <div className="detail-row">
                  <span className="label">Job Title:</span>
                  <span className="value">{jobDetails.jobTitle}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Company:</span>
                  <span className="value">{jobDetails.company || "Not specified"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Input Method:</span>
                  <span className="value">
                    <span className={`badge ${jobDetails.inputMethod}`}>
                      {jobDetails.inputMethod === "text" ? "Text Input" : "Image Upload"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Job Description */}
              <div className="details-section">
                <h3>Job Description</h3>
                <div className="description-box">
                  {jobDetails.jobDescription}
                </div>
              </div>

              {/* Raw Details (if available) */}
              {jobDetails.rawDetails && (
                <div className="details-section">
                  <h3>Raw Job Posting</h3>
                  <div className="description-box">
                    {jobDetails.rawDetails}
                  </div>
                </div>
              )}

              {/* Image Data (if available) */}
              {jobDetails.imageData && (
                <div className="details-section">
                  <h3>Uploaded Image</h3>
                  <img 
                    src={jobDetails.imageData} 
                    alt="Job posting" 
                    className="job-image"
                  />
                </div>
              )}

              {/* Prediction Results */}
              <div className="details-section">
                <h3>Analysis Results</h3>
                <div className="prediction-grid">
                  <div className="prediction-card">
                    <span className="label">Prediction:</span>
                    <span className={`badge ${jobDetails.prediction?.isFake ? "fake" : "real"}`}>
                      {jobDetails.prediction?.isFake ? "Likely Fake" : "Likely Real"}
                    </span>
                  </div>
                  <div className="prediction-card">
                    <span className="label">Confidence:</span>
                    <span className="value">{jobDetails.prediction?.confidence || 0}%</span>
                  </div>
                  <div className="prediction-card">
                    <span className="label">Risk Level:</span>
                    <span className={`badge ${jobDetails.prediction?.riskLevel || "low"}`}>
                      {(jobDetails.prediction?.riskLevel || "low").charAt(0).toUpperCase() + (jobDetails.prediction?.riskLevel || "low").slice(1)}
                    </span>
                  </div>
                </div>

                {jobDetails.prediction?.realPercentage !== undefined && (
                  <div className="prediction-bars">
                    <div className="bar-group">
                      <span className="label">Real Job Probability</span>
                      <div className="progress-bar">
                        <div className="progress-fill real" style={{ width: `${jobDetails.prediction.realPercentage}%` }}></div>
                      </div>
                      <span className="percentage">{jobDetails.prediction.realPercentage}%</span>
                    </div>
                    <div className="bar-group">
                      <span className="label">Fake Job Probability</span>
                      <div className="progress-bar">
                        <div className="progress-fill fake" style={{ width: `${jobDetails.prediction.fakePercentage}%` }}></div>
                      </div>
                      <span className="percentage">{jobDetails.prediction.fakePercentage}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Red Flags */}
              {jobDetails.flags && jobDetails.flags.length > 0 && (
                <div className="details-section">
                  <h3>Detected Red Flags</h3>
                  <div className="flags-list">
                    {jobDetails.flags.map((flag, index) => (
                      <div key={index} className="flag-item">
                        <span className="flag-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                        </span>
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Flag Info */}
              {jobDetails.userFlagged && (
                <div className="details-section flagged-section">
                  <h3>User Flag</h3>
                  <div className="detail-row">
                    <span className="label">Flagged At:</span>
                    <span className="value">{new Date(jobDetails.flaggedAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Reason:</span>
                    <span className="value">{jobDetails.flaggedReason || "No reason provided"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Admin Status:</span>
                    <span className={`badge ${jobDetails.adminStatus}`}>
                      {jobDetails.adminStatus.charAt(0).toUpperCase() + jobDetails.adminStatus.slice(1)}
                    </span>
                  </div>
                  {jobDetails.adminNotes && (
                    <div className="detail-row">
                      <span className="label">Admin Notes:</span>
                      <span className="value">{jobDetails.adminNotes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;

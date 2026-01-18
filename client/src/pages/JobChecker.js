import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { predictionsAPI, feedbackAPI } from "../utils/api";
import "../styles/Checker.css";

export const JobChecker = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("text");
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    jobDescription: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [predictionId, setPredictionId] = useState(null);
  const [error, setError] = useState("");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagging, setFlagging] = useState(false);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const simulateProgress = () => {
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    const progressInterval = simulateProgress();

    try {
      const response = await predictionsAPI.predict({
        ...formData,
        inputMethod: "text"
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (response.data.success) {
        setTimeout(() => {
          setResult(response.data.prediction);
          setPredictionId(response.data.predictionId);
          setFormData({ jobTitle: "", company: "", jobDescription: "" });
          setAnalysisProgress(0);
        }, 300);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setAnalysisProgress(0);
      setError(err.response?.data?.message || "Prediction failed. Please try again.");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    
    // Get file directly from input element to ensure it's fresh
    const fileInput = imageInputRef.current;
    let fileToUpload = imageFile;
    
    // If we have an input ref and it has files, use that instead
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      fileToUpload = fileInput.files[0];
    }
    
    if (!fileToUpload) {
      setError("Please select an image");
      return;
    }

    // Verify it's a File object
    if (!(fileToUpload instanceof File)) {
      console.error("File type:", typeof fileToUpload, fileToUpload);
      setError("Invalid file object. Please select a valid image file.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);
    const progressInterval = simulateProgress();

    try {
      // Create FormData and append the file
      const formDataImage = new FormData();
      formDataImage.append("image", fileToUpload);

      const response = await predictionsAPI.predictImage(formDataImage);

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (response.data.success || response.data.job_status) {
        setTimeout(() => {
          setResult({
            isFake: response.data.job_status === "FAKE",
            message: response.data.job_status === "FAKE" 
              ? "This posting appears to be fraudulent" 
              : "This posting appears to be real",
            confidence: Math.round((response.data.confidence || 0.5) * 100),
            fakePercentage: response.data.job_status === "FAKE" ? 75 : 25,
            realPercentage: response.data.job_status === "FAKE" ? 25 : 75,
            riskLevel: response.data.job_status === "FAKE" ? "high" : "low"
          });
          setImageFile(null);
          setImagePreview(null);
          setAnalysisProgress(0);
        }, 300);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setAnalysisProgress(0);
      setError(err.response?.data?.message || "Image analysis failed. Please try again.");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const handleClear = () => {
    setFormData({ jobTitle: "", company: "", jobDescription: "" });
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError("");
  };

  const handleNewCheck = () => {
    setResult(null);
    setPredictionId(null);
    setError("");
    setFormData({ jobTitle: "", company: "", jobDescription: "" });
    setImageFile(null);
    setImagePreview(null);
    setShowFlagModal(false);
    setFlagReason("");
  };

  const handleFlagPrediction = async () => {
    if (!predictionId) return;
    
    setFlagging(true);
    try {
      await feedbackAPI.flagPrediction(predictionId, flagReason || "User reported incorrect prediction");
      setShowFlagModal(false);
      setFlagReason("");
      alert("Thank you for your feedback! Our team will review this prediction.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to flag prediction");
    } finally {
      setFlagging(false);
    }
  };

  return (
    <div className="checker-container">
      <div className="checker-wrapper">
        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <span className="error-icon"></span>
            <span>{error}</span>
            <button className="error-close" onClick={() => setError("")}>×</button>
          </div>
        )}

        {/* Main Content */}
        <div className="checker-content">
          {/* Input Section */}
          <div className="input-section">
            <div className="section-header">
              <h2>Input Job Details</h2>
              <p>Choose your preferred method to analyze the job posting</p>
            </div>

            {/* Tab Navigation */}
            <div className="tab-buttons">
              <button 
                className={`tab-btn ${activeTab === "text" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("text");
                  setError("");
                }}
              >
                <span className="tab-icon"></span>
                <span>Text Analysis</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === "image" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("image");
                  setError("");
                }}
              >
                <span className="tab-icon"></span>
                <span>Image Analysis</span>
              </button>
            </div>

            {/* Text Analysis Form */}
            {activeTab === "text" && (
              <form onSubmit={handleTextSubmit} className="form-section">
                <div className="form-group">
                  <label>
                    <span className="label-icon"></span>
                    Job Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g., Senior Software Developer"
                    required
                    disabled={loading}
                  />
                  <small className="form-help">The position title from the job posting</small>
                </div>

                <div className="form-group">
                  <label>
                    <span className="label-icon"></span>
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g., TechCorp Inc"
                    disabled={loading}
                  />
                  <small className="form-help">The hiring company name (optional but recommended)</small>
                </div>

                <div className="form-group">
                  <label>
                    <span className="label-icon"></span>
                    Job Description <span className="required">*</span>
                  </label>
                  <textarea
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleChange}
                    placeholder="Paste the complete job posting details here..."
                    rows="12"
                    required
                    disabled={loading}
                  />
                  <small className="form-help">Full job description, responsibilities, and requirements</small>
                  <div className="char-count">
                    {formData.jobDescription.length} characters
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClear}
                    disabled={loading}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !formData.jobTitle || !formData.jobDescription}
                  >
                    {loading ? (
                      <>
                        <span className="btn-spinner"></span>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon"></span>
                        Analyze Posting
                      </>
                    )}
                  </button>
                </div>

                {loading && (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${analysisProgress}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">Analyzing... {analysisProgress}%</div>
                  </div>
                )}
              </form>
            )}

            {/* Image Analysis Form */}
            {activeTab === "image" && (
              <form onSubmit={handleImageSubmit} className="form-section">
                <div className="image-upload-area">
                  <label htmlFor="image-input" className="upload-label">
                    {imagePreview ? (
                      <div className="image-preview-container">
                        <img src={imagePreview} alt="Preview" className="image-preview" />
                        <div className="image-overlay">
                          <span className="overlay-text">Click to change image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <div className="upload-icon"></div>
                        <p>Click to upload job posting image</p>
                        <span>Supported formats: JPG, PNG, GIF (Max 10MB)</span>
                      </div>
                    )}
                    <input
                      ref={imageInputRef}
                      id="image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                      disabled={loading}
                    />
                  </label>
                </div>

                {imageFile && (
                  <div className="file-info">
                    <span className="file-icon"></span>
                    <span className="file-name">{imageFile.name}</span>
                    <span className="file-size">
                      {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      type="button"
                      className="file-remove"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClear}
                    disabled={loading}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !imageFile}
                  >
                    {loading ? (
                      <>
                        <span className="btn-spinner"></span>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon"></span>
                        Analyze Image
                      </>
                    )}
                  </button>
                </div>

                {loading && (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${analysisProgress}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">Analyzing image... {analysisProgress}%</div>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Result Section */}
          {result && (
            <div className="result-section">
              <div className="result-header">
                <h2 className="result-title">Analysis Results</h2>
                <button className="result-close" onClick={handleNewCheck}>×</button>
              </div>
              
              <div className={`result-card ${result.isFake ? "fake" : "real"}`}>
                {/* Animated Background Elements */}
                <div className="result-background-glow"></div>
                <div className="result-particles">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="particle" style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${3 + Math.random() * 2}s`
                    }}></div>
                  ))}
                </div>

                {/* Status Badge with Animation */}
                <div className="result-status-wrapper">
                  <span className={`status-badge ${result.isFake ? "fraudulent" : "real"}`}>
                    <span className="badge-icon"></span>
                    <span className="badge-text">
                    {result.isFake ? "Fraudulent Posting" : "Real Posting"}
                    </span>
                    <span className="badge-pulse"></span>
                  </span>
                </div>

                {/* Main Icon with Animation */}
                <div className="result-icon-wrapper">
                  <div className={`result-icon ${result.isFake ? "icon-warning" : "icon-success"}`}>
                    <div className="icon-ring"></div>
                    <div className="icon-ring ring-2"></div>
                  </div>
                </div>

                {/* Main Message */}
                <h2 className="result-message">
                  {result.isFake 
                    ? "This job posting shows signs of fraud" 
                  : "This job posting appears real"}
                </h2>

                <p className="result-description">
                  {result.isFake
                    ? "Our analysis detected multiple warning signs that suggest this is not a genuine job opportunity. Please exercise caution."
                    : "Based on our analysis, this posting contains characteristics typical of real job listings. However, always verify with the company directly before proceeding."}
                </p>

                {/* Enhanced Confidence Section */}
                <div className="confidence-section">
                  <div className="confidence-header">
                    <div className="confidence-label-wrapper">
                      <span className="confidence-icon"></span>
                      <span className="confidence-label">Detection Confidence</span>
                    </div>
                    <div className="confidence-value-wrapper">
                      <span className="confidence-value">{result.confidence}%</span>
                      <span className="confidence-indicator"></span>
                    </div>
                  </div>
                  <div className="confidence-bar-container">
                    <div className="confidence-bar">
                      <div
                        className="confidence-fill"
                        style={{
                          width: `${result.confidence}%`,
                        }}
                      >
                        <div className="confidence-shine"></div>
                      </div>
                    </div>
                    <div className="confidence-markers">
                      <span className="marker marker-low">0%</span>
                      <span className="marker marker-medium">50%</span>
                      <span className="marker marker-high">100%</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Statistics Grid */}
                <div className="percentage-grid">
                  <div className="percentage-item real-bg" style={{ animationDelay: '0.1s' }}>
                    <div className="percentage-icon-wrapper">
                      <div className="percentage-icon icon-check"></div>
                      <div className="icon-glow"></div>
                    </div>
                    <div className="percentage-value-wrapper">
                      <span className="percentage-value">{result.realPercentage}%</span>
                      <div className="percentage-bar">
                        <div 
                          className="percentage-bar-fill" 
                          style={{ width: `${result.realPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="percentage-label">Real</div>
                  </div>
                  <div className="percentage-item fake-bg" style={{ animationDelay: '0.2s' }}>
                    <div className="percentage-icon-wrapper">
                      <div className="percentage-icon icon-warning"></div>
                      <div className="icon-glow"></div>
                    </div>
                    <div className="percentage-value-wrapper">
                      <span className="percentage-value">{result.fakePercentage}%</span>
                      <div className="percentage-bar">
                        <div 
                          className="percentage-bar-fill" 
                          style={{ width: `${result.fakePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="percentage-label">Fraudulent</div>
                  </div>
                  <div className="risk-item" style={{ animationDelay: '0.3s' }}>
                    <div className="risk-icon-wrapper">
                      <div className="risk-icon icon-target"></div>
                      <div className="icon-glow"></div>
                    </div>
                    <div className="risk-label">Risk Level</div>
                    <div className={`risk-badge risk-${result.riskLevel}`}>
                      <span className="risk-badge-text">{result.riskLevel.toUpperCase()}</span>
                      <span className="risk-badge-pulse"></span>
                    </div>
                  </div>
                </div>

                {/* Safety Recommendations (only for real) */}
                {!result.isFake && (
                  <div className="result-tips success-tips">
                    <h4>
                      <span className="tips-icon"></span>
                      Safety Recommendations
                    </h4>
                    <ul>
                      <li>Verify company details through official channels</li>
                      <li>Research the company website independently</li>
                      <li>Never provide payment for job opportunities</li>
                      <li>Protect your personal information</li>
                      <li>Trust your instincts about the opportunity</li>
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="result-actions">
                  <button className="btn btn-secondary" onClick={handleNewCheck}>
                    <span className="btn-icon"></span>
                    New Analysis
                  </button>
                  {predictionId && (
                    <button 
                      className="btn btn-warning" 
                      onClick={() => setShowFlagModal(true)}
                      title="Report incorrect prediction"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "8px" }}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      Flag Result
                    </button>
                  )}
                  <button 
                    className="btn btn-primary" 
                    onClick={() => navigate("/dashboard")}
                  >
                    <span className="btn-icon"></span>
                    View Dashboard
                  </button>
                </div>

                {/* Flag Modal */}
                {showFlagModal && (
                  <div className="modal-overlay" onClick={() => setShowFlagModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header">
                        <h3>Flag Incorrect Prediction</h3>
                        <button className="modal-close" onClick={() => setShowFlagModal(false)}>×</button>
                      </div>
                      <div className="modal-body">
                        <p>Help us improve! If you believe this prediction is incorrect, please let us know why.</p>
                        <div className="form-group">
                          <label>Reason (optional)</label>
                          <textarea
                            value={flagReason}
                            onChange={(e) => setFlagReason(e.target.value)}
                            placeholder="e.g., This is actually a legitimate job posting from a known company..."
                            rows="4"
                            maxLength={500}
                          />
                          <small>{flagReason.length}/500 characters</small>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => setShowFlagModal(false)}
                          disabled={flagging}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn btn-warning" 
                          onClick={handleFlagPrediction}
                          disabled={flagging}
                        >
                          {flagging ? "Submitting..." : "Submit Flag"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State - When no result */}
          {!result && !loading && (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h3>Ready to Analyze</h3>
              <p>Fill in the job details above and click "Analyze Posting" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobChecker;

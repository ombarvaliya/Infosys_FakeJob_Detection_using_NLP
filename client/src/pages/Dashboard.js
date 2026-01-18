import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { predictionsAPI, usersAPI } from "../utils/api";
import { exportToExcel, exportToPDF, formatDate as formatUtilsDate } from "../utils/exportUtils";
import JobDetailsModal from "../components/JobDetailsModal";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import "../styles/Dashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend);

export const Dashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Theme-aware colors for chart
  const legendColor = theme === "light" ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)";
  const tooltipBg = theme === "light" ? "rgba(255, 255, 255, 1)" : "rgba(15, 23, 42, 0.98)";
  const tooltipTextColor = theme === "light" ? "rgba(15, 23, 42, 1)" : "rgba(255, 255, 255, 1)";
  const tooltipBorderColor = theme === "light" ? "rgba(99, 102, 241, 0.8)" : "rgba(99, 102, 241, 0.5)";

  useEffect(() => {
    if (!token) navigate("/login");
    else loadData();
  }, [token, navigate]);

  const loadData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      const [statsRes, historyRes] = await Promise.all([
        usersAPI.getStats(),
        predictionsAPI.getHistory()
      ]);
      setStats(statsRes.data.stats);
      setHistory(historyRes.data.data || []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadData(true);
  };

  const handleExport = (format) => {
    const columns = [
      { key: "jobTitle", header: "Job Title" },
      { key: "company", header: "Company" },
      { key: "prediction", header: "Result", formatter: (p) => p.isFake ? "Fake" : "Real" },
      { key: "prediction", header: "Confidence", formatter: (p) => `${p.confidence}%` },
      { key: "prediction", header: "Risk Level", formatter: (p) => p.riskLevel.toUpperCase() },
      { key: "createdAt", header: "Date", formatter: formatUtilsDate }
    ];

    if (format === "excel") {
      exportToExcel(history, `my_history_${new Date().toISOString().split('T')[0]}`, columns);
    } else {
      exportToPDF(history, `my_history_${new Date().toISOString().split('T')[0]}`, "My Analysis History", columns);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#3b82f6";
    }
  };

  const getRiskLabel = (riskLevel) => {
    switch (riskLevel) {
      case "high":
        return "High Risk";
      case "medium":
        return "Medium Risk";
      case "low":
        return "Low Risk";
      default:
        return "Unknown";
    }
  };

  const handleViewDetails = (jobId) => {
    setSelectedJobId(jobId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJobId(null);
  };

  const filteredHistory = history.filter((prediction) => {
    if (filter === "all") return true;
    if (filter === "real") return !prediction.prediction.isFake;
    if (filter === "fake") return prediction.prediction.isFake;
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Get local date components (ignoring time)
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const dateDay = date.getDate();
    
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth();
    const nowDay = now.getDate();
    
    // Create date objects at midnight for accurate day comparison
    const dateMidnight = new Date(dateYear, dateMonth, dateDay);
    const nowMidnight = new Date(nowYear, nowMonth, nowDay);
    
    // Calculate difference in days
    const diffTime = nowMidnight - dateMidnight;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const fakeCount = stats?.fakeDetected || 0;
  const realCount = stats?.realDetected || 0;
  const totalCount = stats?.totalPredictions || 0;
  const fakePercentage = totalCount > 0 ? Math.round((fakeCount / totalCount) * 100) : 0;
  const realPercentage = totalCount > 0 ? Math.round((realCount / totalCount) * 100) : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-background">
        <div className="bg-gradient-1"></div>
        <div className="bg-gradient-2"></div>
        <div className="bg-gradient-3"></div>
      </div>

      <div className="dashboard-container">
        {/* Header Section */}
        <header className="dashboard-header">
          <div className="header-main">
            <div className="header-title-section">
              <h1 className="dashboard-title">Dashboard</h1>
              <p className="dashboard-subtitle">Welcome back, {user?.fullName || "User"}</p>
            </div>
            <div className="header-actions">
              <button 
                className={`action-btn refresh-btn ${refreshing ? "spinning" : ""}`}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
              <Link to="/checker" className="action-btn primary-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>New Check</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Main Stats Grid - Top Section */}
          <div className="dashboard-main-grid">
            {/* Left Column - Stats Cards */}
            <div className="stats-column">
          <div className="stats-overview-grid">
            <div className="stat-overview-card stat-card-total">
              <div className="stat-card-glow"></div>
              <div className="stat-card-content">
                <div className="stat-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="20" x2="12" y2="10"></line>
                    <line x1="18" y1="20" x2="18" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="16"></line>
                  </svg>
                </div>
                <div className="stat-info">
                  <div className="stat-label">Total Checks</div>
                  <div className="stat-number">{totalCount}</div>
                      <div className="stat-description">All time analyses</div>
                </div>
              </div>
            </div>

            <div className="stat-overview-card stat-card-success">
              <div className="stat-card-glow"></div>
              <div className="stat-card-content">
                <div className="stat-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="stat-info">
                      <div className="stat-label">Real Jobs</div>
                  <div className="stat-number">{realCount}</div>
                  <div className="stat-percentage">{realPercentage}%</div>
                </div>
              </div>
            </div>

            <div className="stat-overview-card stat-card-danger">
              <div className="stat-card-glow"></div>
              <div className="stat-card-content">
                <div className="stat-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
                <div className="stat-info">
                  <div className="stat-label">Fake Detected</div>
                  <div className="stat-number">{fakeCount}</div>
                  <div className="stat-percentage">{fakePercentage}%</div>
                </div>
              </div>
                </div>
              </div>
            </div>

            {/* Right Column - Chart */}
            <div className="chart-column">
              {totalCount > 0 ? (
                <div className="chart-card chart-card-pie">
                  <div className="chart-header">
                    <div className="chart-header-content">
                      <div>
                        <h3 className="chart-title">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline-block", marginRight: "8px", verticalAlign: "middle" }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                          </svg>
                          Distribution Analysis
                        </h3>
                        <p className="chart-subtitle">Real vs Fake breakdown</p>
                      </div>
                    </div>
                  </div>
                  <div className="chart-container">
                    <Pie
                      data={{
                        labels: ["Real Jobs", "Fake Jobs"],
                        datasets: [
                          {
                            label: "Job Analysis",
                            data: [realCount, fakeCount],
                            backgroundColor: [
                              "rgba(16, 185, 129, 0.85)",
                              "rgba(239, 68, 68, 0.85)"
                            ],
                            borderColor: [
                              "rgba(16, 185, 129, 1)",
                              "rgba(239, 68, 68, 1)"
                            ],
                            borderWidth: 3,
                            hoverOffset: 12,
                            hoverBorderWidth: 4
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: {
                            position: "bottom",
                            align: "center",
                            labels: {
                              padding: 25,
                              font: {
                                size: 14,
                                weight: "600",
                                family: "'Inter', sans-serif"
                              },
                              color: legendColor,
                              usePointStyle: true,
                              pointStyle: "circle",
                              boxWidth: 10,
                              boxHeight: 10
                            }
                          },
                          tooltip: {
                            backgroundColor: tooltipBg,
                            padding: 16,
                            titleColor: tooltipTextColor,
                            bodyColor: tooltipTextColor,
                            titleFont: {
                              size: 15,
                              weight: "700",
                              family: "'Inter', sans-serif"
                            },
                            bodyFont: {
                              size: 14,
                              weight: "500",
                              family: "'Inter', sans-serif"
                            },
                            borderColor: tooltipBorderColor,
                            borderWidth: 2,
                            cornerRadius: 8,
                            displayColors: true,
                            titleSpacing: 4,
                            bodySpacing: 4,
                            boxPadding: 6,
                            callbacks: {
                              label: function(context) {
                                const label = context.label || "";
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                              }
                            }
                          }
                        },
                        animation: {
                          animateRotate: true,
                          animateScale: true,
                          duration: 1000,
                          easing: "easeInOutQuart"
                        }
                      }}
                    />
                  </div>
                  <div className="chart-footer">
                    <div className="chart-stat-item">
                      <div className="chart-stat-dot real"></div>
                      <span className="chart-stat-label">Real</span>
                      <span className="chart-stat-value">{realCount}</span>
                    </div>
                    <div className="chart-stat-item">
                      <div className="chart-stat-dot fake"></div>
                      <span className="chart-stat-label">Fake</span>
                      <span className="chart-stat-value">{fakeCount}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="chart-card chart-card-pie chart-empty">
                  <div className="chart-header">
                    <h3 className="chart-title">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline-block", marginRight: "8px", verticalAlign: "middle" }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                      Distribution Analysis
                    </h3>
                    <p className="chart-subtitle">Start analyzing jobs to see your statistics</p>
                  </div>
                  <div className="chart-empty-state">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, marginBottom: "1rem" }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <p>No data available yet</p>
                    <Link to="/checker" className="empty-state-button" style={{ marginTop: "1rem" }}>
                      Start Your First Check
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* History Section */}
          <div className="history-container">
            <div className="history-header">
              <div className="history-title-section">
                <h2 className="history-title">Recent Analysis</h2>
                <p className="history-subtitle">
                  {filteredHistory.length} {filteredHistory.length === 1 ? "result" : "results"} found
                </p>
              </div>
              <div className="history-filters">
                <div className="history-export-btns" style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
                  <button className="btn-export-mini btn-excel" onClick={() => handleExport('excel')} title="Export History to Excel">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Excel
                  </button>
                  <button className="btn-export-mini btn-pdf" onClick={() => handleExport('pdf')} title="Export History to PDF">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    PDF
                  </button>
                </div>
                <button
                  className={`filter-button ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  All
                </button>
                <button
                  className={`filter-button ${filter === "real" ? "active" : ""}`}
                  onClick={() => setFilter("real")}
                >
                  Real
                </button>
                <button
                  className={`filter-button ${filter === "fake" ? "active" : ""}`}
                  onClick={() => setFilter("fake")}
                >
                  Fake
                </button>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="empty-state-container">
                <div className="empty-state-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
                <h3 className="empty-state-title">No Analysis Found</h3>
                <p className="empty-state-text">
                  {filter === "all"
                    ? "You haven't analyzed any job postings yet. Start by checking a job posting!"
                  : `No ${filter === "real" ? "real" : "fake"} postings found.`}
                </p>
                {filter === "all" && (
                  <Link to="/checker" className="empty-state-button">
                    Start Your First Check
                  </Link>
                )}
              </div>
            ) : (
              <div className="history-table-container">
                <div className="table-wrapper">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Result</th>
                        <th>Confidence</th>
                        <th>Risk Level</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((prediction, index) => (
                        <tr key={prediction._id} style={{ animationDelay: `${index * 0.05}s` }}>
                          <td>
                            <div className="table-cell-content">
                              <span className="cell-text">{prediction.jobTitle || "Unknown"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="table-cell-content">
                              <span className="cell-text">{prediction.company || "N/A"}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`result-badge ${prediction.prediction.isFake ? "badge-fake" : "badge-real"}`}>
                              {prediction.prediction.isFake ? "Fake" : "Real"}
                            </span>
                          </td>
                          <td>
                            <div className="confidence-cell">
                              <div className="confidence-bar-wrapper">
                                <div 
                                  className="confidence-bar-fill"
                                  style={{
                                    width: `${prediction.prediction.confidence}%`,
                                    backgroundColor: getRiskColor(prediction.prediction.riskLevel)
                                  }}
                                ></div>
                              </div>
                              <span className="confidence-value">{prediction.prediction.confidence}%</span>
                            </div>
                          </td>
                          <td>
                            <span className={`risk-badge risk-${prediction.prediction.riskLevel || "unknown"}`}>
                              {getRiskLabel(prediction.prediction.riskLevel || "unknown")}
                            </span>
                          </td>
                          <td>
                            <div className="date-cell">
                              <span className="date-main">{formatDate(prediction.createdAt)}</span>
                              <span className="date-time">
                                {new Date(prediction.createdAt).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                          </td>
                          <td>
                            <button 
                              className="btn-table-details"
                              onClick={() => handleViewDetails(prediction._id)}
                              title="View full job details"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && selectedJobId && (
        <JobDetailsModal
          jobId={selectedJobId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Dashboard;

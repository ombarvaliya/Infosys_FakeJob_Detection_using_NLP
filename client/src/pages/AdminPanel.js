import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { adminAPI } from "../utils/api";
import { exportToExcel, exportToPDF, exportMultipleToExcel, exportMultipleToPDF, formatDate, formatBoolean, formatStatus } from "../utils/exportUtils";
import JobDetailsModal from "../components/JobDetailsModal";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import "../styles/AdminPanel.css";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

export const AdminPanel = () => {
  const { user, token } = useContext(AuthContext);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Set initial state based on screen size
    if (typeof window !== 'undefined') {
      return window.innerWidth > 768;
    }
    return true;
  });
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Theme-aware colors for charts
  const legendColor = theme === "light" ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)";
  const tooltipBg = theme === "light" ? "rgba(255, 255, 255, 1)" : "rgba(15, 23, 42, 0.98)";
  const tooltipTextColor = theme === "light" ? "rgba(15, 23, 42, 1)" : "rgba(255, 255, 255, 1)";
  const tooltipBorderColor = theme === "light" ? "rgba(99, 102, 241, 0.8)" : "rgba(99, 102, 241, 0.5)";
  const gridColor = theme === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)";
  const tickColor = theme === "light" ? "rgba(15, 23, 42, 0.7)" : "rgba(255, 255, 255, 0.7)";

  // Update body class for sidebar state
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.remove("sidebar-closed");
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
      document.body.classList.add("sidebar-closed");
    }
    return () => {
      document.body.classList.remove("sidebar-open", "sidebar-closed");
    };
  }, [sidebarOpen]);

  // Handle window resize to auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768 && sidebarOpen) {
        setSidebarOpen(false);
      } else if (window.innerWidth > 768 && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      navigate("/login");
    } else {
      loadData();
    }
  }, [token, user, navigate]);

  const handleViewDetails = (jobId) => {
    setSelectedJobId(jobId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJobId(null);
  };

  const loadData = async () => {
    try {
      const [statsRes, usersRes, activityRes, dailyRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getUsers(),
        adminAPI.getRecentActivity(),
        adminAPI.getDailyStats(30)
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.data || []);
      setActivity(activityRes.data.data || []);
      setDailyStats(dailyRes.data.data || []);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFlaggedPosts = async () => {
    try {
      const status = filterStatus !== "all" ? filterStatus : null;
      const res = await adminAPI.getFlaggedPosts(status);
      setFlaggedPosts(res.data.data || []);
    } catch (err) {
      console.error("Error loading flagged posts:", err);
    }
  };

  const loadFeedback = async () => {
    try {
      const res = await adminAPI.getFeedback();
      setFeedback(res.data.data || []);
    } catch (err) {
      console.error("Error loading feedback:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "flagged") {
      loadFlaggedPosts();
    } else if (activeTab === "feedback") {
      loadFeedback();
    }
  }, [activeTab, filterStatus]);

  const handleUserAction = async (userId, action) => {
    try {
      if (action === "deactivate") {
        await adminAPI.deactivateUser(userId);
      } else if (action === "activate") {
        await adminAPI.activateUser(userId);
      } else if (action === "promote") {
        await adminAPI.promoteUser(userId);
      } else if (action === "demote") {
        await adminAPI.demoteUser(userId);
      }
      loadData();
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  // Comprehensive Export Function - Includes Dashboard, Users, and Activity
  const exportComprehensive = (format) => {
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Dashboard Statistics
    const statsData = [{
      'Metric': 'Total Users',
      'Value': stats?.totalUsers || 0
    }, {
      'Metric': 'Active Users',
      'Value': stats?.activeUsers || 0
    }, {
      'Metric': 'Total Predictions',
      'Value': stats?.totalPredictions || 0
    }, {
      'Metric': 'Real Predictions',
      'Value': stats?.realPredictions || 0
    }, {
      'Metric': 'Fake Predictions',
      'Value': stats?.fakePredictions || 0
    }, {
      'Metric': 'Detection Rate',
      'Value': `${stats?.detectionRate || 0}%`
    }];

    const dashboardColumns = [
      { key: 'Metric', header: 'Metric' },
      { key: 'Value', header: 'Value' }
    ];

    // Users Data
    const userColumns = [
      { key: 'fullName', header: 'Full Name' },
      { key: 'email', header: 'Email' },
      { key: 'role', header: 'Role', formatter: formatStatus },
      { key: 'isActive', header: 'Status', formatter: (val) => val ? 'Active' : 'Inactive' },
      { key: 'createdAt', header: 'Created At', formatter: formatDate }
    ];

    // Activity Data
    const activityColumns = [
      { key: 'userId', header: 'User', formatter: (item) => item?.userId?.fullName || 'Unknown' },
      { key: 'userId', header: 'Email', formatter: (item) => item?.userId?.email || 'N/A' },
      { key: 'jobTitle', header: 'Job Title' },
      { key: 'company', header: 'Company' },
      { key: 'prediction', header: 'Result', formatter: (item) => item?.prediction?.isFake ? 'Fake' : 'Real' },
      { key: 'prediction', header: 'Confidence', formatter: (item) => item?.prediction?.confidence ? `${item.prediction.confidence}%` : 'N/A' },
      { key: 'createdAt', header: 'Date', formatter: formatDate }
    ];

    if (format === 'excel') {
      // Export to Excel with multiple sheets
      const sheets = [
        {
          name: 'Dashboard',
          data: statsData,
          columns: dashboardColumns
        },
        {
          name: 'Users',
          data: users,
          columns: userColumns
        },
        {
          name: 'Activity',
          data: activity,
          columns: activityColumns
        }
      ];
      exportMultipleToExcel(sheets, `complete_report_${dateStr}`);
    } else {
      // Export to PDF with multiple sections
      const sections = [
        {
          title: 'Dashboard Statistics',
          data: statsData,
          columns: dashboardColumns
        },
        {
          title: 'User Data',
          data: users,
          columns: userColumns
        },
        {
          title: 'All Activity',
          data: activity,
          columns: activityColumns
        }
      ];
      exportMultipleToPDF(sections, `complete_report_${dateStr}`, 'Complete Admin Report');
    }
  };

  // Individual Export Functions (kept for backward compatibility if needed)
  const exportUsers = (format) => {
    const columns = [
      { key: 'fullName', header: 'Full Name' },
      { key: 'email', header: 'Email' },
      { key: 'role', header: 'Role', formatter: formatStatus },
      { key: 'isActive', header: 'Status', formatter: (val) => val ? 'Active' : 'Inactive' },
      { key: 'createdAt', header: 'Created At', formatter: formatDate }
    ];

    if (format === 'excel') {
      exportToExcel(users, `users_export_${new Date().toISOString().split('T')[0]}`, columns);
    } else {
      exportToPDF(users, `users_export_${new Date().toISOString().split('T')[0]}`, 'Users Export', columns);
    }
  };

  const exportActivity = (format) => {
    const columns = [
      { key: 'userId', header: 'User', formatter: (item) => item?.userId?.fullName || 'Unknown' },
      { key: 'userId', header: 'Email', formatter: (item) => item?.userId?.email || 'N/A' },
      { key: 'jobTitle', header: 'Job Title' },
      { key: 'company', header: 'Company' },
      { key: 'prediction', header: 'Result', formatter: (item) => item?.prediction?.isFake ? 'Fake' : 'Real' },
      { key: 'prediction', header: 'Confidence', formatter: (item) => item?.prediction?.confidence ? `${item.prediction.confidence}%` : 'N/A' },
      { key: 'createdAt', header: 'Date', formatter: formatDate }
    ];

    if (format === 'excel') {
      exportToExcel(activity, `activity_export_${new Date().toISOString().split('T')[0]}`, columns);
    } else {
      exportToPDF(activity, `activity_export_${new Date().toISOString().split('T')[0]}`, 'Activity Export', columns);
    }
  };

  const exportFlaggedPosts = (format) => {
    const columns = [
      { key: 'jobTitle', header: 'Job Title' },
      { key: 'company', header: 'Company' },
      { key: 'flaggedBy', header: 'Flagged By', formatter: (item) => item?.flaggedBy?.fullName || 'Unknown' },
      { key: 'flaggedReason', header: 'Reason' },
      { key: 'adminStatus', header: 'Status', formatter: formatStatus },
      { key: 'prediction', header: 'Prediction', formatter: (item) => item?.prediction?.isFake ? 'Fake' : 'Real' },
      { key: 'flaggedAt', header: 'Flagged On', formatter: formatDate }
    ];

    if (format === 'excel') {
      exportToExcel(flaggedPosts, `flagged_posts_export_${new Date().toISOString().split('T')[0]}`, columns);
    } else {
      exportToPDF(flaggedPosts, `flagged_posts_export_${new Date().toISOString().split('T')[0]}`, 'Flagged Posts Export', columns);
    }
  };

  const exportFeedback = (format) => {
    const columns = [
      { key: 'userId', header: 'User', formatter: (item) => item?.userId?.fullName || 'Unknown' },
      { key: 'type', header: 'Type', formatter: formatStatus },
      { key: 'subject', header: 'Subject' },
      { key: 'message', header: 'Message' },
      { key: 'status', header: 'Status', formatter: formatStatus },
      { key: 'createdAt', header: 'Created At', formatter: formatDate }
    ];

    if (format === 'excel') {
      exportToExcel(feedback, `feedback_export_${new Date().toISOString().split('T')[0]}`, columns);
    } else {
      exportToPDF(feedback, `feedback_export_${new Date().toISOString().split('T')[0]}`, 'Feedback Export', columns);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}
        onMouseEnter={() => {
          if (window.innerWidth > 768 && !sidebarOpen) {
            setSidebarOpen(true);
          }
        }}
        onMouseLeave={() => {
          if (window.innerWidth > 768 && sidebarOpen) {
            setSidebarOpen(false);
          }
        }}
      >
        <div className="sidebar-header" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: 'pointer' }}>
          <div className="sidebar-logo-wrapper">
            <div className={`sidebar-logo-icon ${!sidebarOpen ? 'rotated' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="3" strokeLinecap="round"/>
                <path d="M9 9h6M9 15h6M12 3v18" strokeLinecap="round"/>
              </svg>
            </div>
            {sidebarOpen && (
              <div className="sidebar-logo-text">
                <span className="logo-main">JobCheck</span>
                <span className="logo-subtitle">Admin Panel</span>
              </div>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("dashboard");
              if (window.innerWidth <= 768) setSidebarOpen(false);
            }}
          >
            <div className="nav-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            {sidebarOpen && <span className="nav-text">Dashboard</span>}
            {activeTab === "dashboard" && <div className="nav-indicator"></div>}
          </button>
          
          <button
            className={`nav-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("users");
              if (window.innerWidth <= 768) setSidebarOpen(false);
            }}
          >
            <div className="nav-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            {sidebarOpen && <span className="nav-text">Users</span>}
            {activeTab === "users" && <div className="nav-indicator"></div>}
          </button>
          
          <button
            className={`nav-item ${activeTab === "activity" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("activity");
              if (window.innerWidth <= 768) setSidebarOpen(false);
            }}
          >
            <div className="nav-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            {sidebarOpen && <span className="nav-text">Activity</span>}
            {activeTab === "activity" && <div className="nav-indicator"></div>}
          </button>
          
          <button
            className={`nav-item ${activeTab === "flagged" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("flagged");
              if (window.innerWidth <= 768) setSidebarOpen(false);
            }}
          >
            <div className="nav-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            {sidebarOpen && <span className="nav-text">Flagged Posts</span>}
            {activeTab === "flagged" && <div className="nav-indicator"></div>}
          </button>
          
          <button
            className={`nav-item ${activeTab === "feedback" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("feedback");
              if (window.innerWidth <= 768) setSidebarOpen(false);
            }}
          >
            <div className="nav-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            {sidebarOpen && <span className="nav-text">Feedback</span>}
            {activeTab === "feedback" && <div className="nav-indicator"></div>}
          </button>
        </nav>

        {sidebarOpen && (
          <div className="sidebar-footer">
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                {user?.fullName?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="sidebar-user-details">
                <div className="sidebar-user-name">{user?.fullName || "Admin"}</div>
                <div className="sidebar-user-role">Administrator</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Content Area */}
      <div className="admin-content">
        {activeTab === "dashboard" && (
          <div className="dashboard-view">
            <div className="view-actions-bar">
              <h2 className="view-title">Dashboard Overview</h2>
              <div className="export-buttons">
                <button className="btn-export btn-export-excel" onClick={() => exportComprehensive('excel')} title="Export Complete Report to Excel">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Excel
                </button>
                <button className="btn-export btn-export-pdf" onClick={() => exportComprehensive('pdf')} title="Export Complete Report to PDF">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  PDF
                </button>
              </div>
            </div>
            {/* Statistics Cards */}
              <div className="stats-grid">
                <div className="stat-card stat-primary">
                  <div className="stat-icon-wrapper">
                                    <div className="stat-icon">
                                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                          </svg>
                                        </div>
            </div>
                  <div className="stat-content">
                <div className="stat-label">Total Users</div>
                    <div className="stat-value">{stats?.totalUsers || 0}</div>
                    <div className="stat-change positive">All registered users</div>
                  </div>
                </div>

                <div className="stat-card stat-success">
                  <div className="stat-icon-wrapper">
                    <div className="stat-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
              </div>
                  <div className="stat-content">
                <div className="stat-label">Active Users</div>
                    <div className="stat-value">{stats?.activeUsers || 0}</div>
                    <div className="stat-change positive">Currently active</div>
                  </div>
                </div>

                <div className="stat-card stat-info">
                  <div className="stat-icon-wrapper">
                    <div className="stat-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                      </svg>
                    </div>
              </div>
                  <div className="stat-content">
                <div className="stat-label">Total Predictions</div>
                    <div className="stat-value">{stats?.totalPredictions || 0}</div>
                    <div className="stat-change positive">Jobs analyzed</div>
                  </div>
                </div>

                <div className="stat-card stat-danger">
                  <div className="stat-icon-wrapper">
                    <div className="stat-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    </div>
              </div>
                  <div className="stat-content">
                <div className="stat-label">Fake Detected</div>
                    <div className="stat-value">{stats?.fakePredictions || 0}</div>
                    <div className="stat-change negative">Fraudulent postings</div>
                  </div>
                </div>

                <div className="stat-card stat-success">
                  <div className="stat-icon-wrapper">
                    <div className="stat-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                    </div>
              </div>
                  <div className="stat-content">
                <div className="stat-label">Real Confirmed</div>
                    <div className="stat-value">{stats?.realPredictions || 0}</div>
                    <div className="stat-change positive">Real postings</div>
                  </div>
                </div>

                <div className="stat-card stat-warning">
                  <div className="stat-icon-wrapper">
                    <div className="stat-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </div>
              </div>
                  <div className="stat-content">
                <div className="stat-label">Detection Rate</div>
                    <div className="stat-value">{stats?.detectionRate || 0}%</div>
                    <div className="stat-change positive">Accuracy rate</div>
                  </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="admin-charts-section">
              {/* Daily Analysis Chart */}
              <div className="admin-chart-card chart-card-large">
                <div className="admin-chart-header">
                  <div className="chart-header-content">
                    <div>
                      <h3 className="admin-chart-title">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline-block", marginRight: "8px", verticalAlign: "middle" }}>
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        Daily Analysis Requests
                      </h3>
                      <p className="admin-chart-subtitle">Tracking job analysis activity over the last 30 days</p>
                    </div>
                    <div className="chart-stats-summary">
                      <div className="summary-item">
                        <span className="summary-label">Total</span>
                        <span className="summary-value">{dailyStats.reduce((sum, item) => sum + item.total, 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="admin-chart-container">
                  {dailyStats.length > 0 ? (
                    <Line
                      data={{
                        labels: dailyStats.map(item => {
                          const date = new Date(item.date);
                          return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        }),
                        datasets: [
                          {
                            label: "Total Requests",
                            data: dailyStats.map(item => item.total),
                            borderColor: "rgba(99, 102, 241, 1)",
                            backgroundColor: "rgba(99, 102, 241, 0.15)",
                            fill: true,
                            tension: 0.5,
                            borderWidth: 3,
                            pointRadius: 5,
                            pointHoverRadius: 8,
                            pointBackgroundColor: "rgba(99, 102, 241, 1)",
                            pointBorderColor: "#ffffff",
                            pointBorderWidth: 3,
                            pointHoverBackgroundColor: "rgba(99, 102, 241, 1)",
                            pointHoverBorderColor: "#ffffff",
                            pointHoverBorderWidth: 4
                          },
                          {
                            label: "Real Jobs",
                            data: dailyStats.map(item => item.real),
                            borderColor: "rgba(16, 185, 129, 1)",
                            backgroundColor: "rgba(16, 185, 129, 0.15)",
                            fill: true,
                            tension: 0.5,
                            borderWidth: 3,
                            pointRadius: 5,
                            pointHoverRadius: 8,
                            pointBackgroundColor: "rgba(16, 185, 129, 1)",
                            pointBorderColor: "#ffffff",
                            pointBorderWidth: 3,
                            pointHoverBackgroundColor: "rgba(16, 185, 129, 1)",
                            pointHoverBorderColor: "#ffffff",
                            pointHoverBorderWidth: 4
                          },
                          {
                            label: "Fake Jobs",
                            data: dailyStats.map(item => item.fake),
                            borderColor: "rgba(239, 68, 68, 1)",
                            backgroundColor: "rgba(239, 68, 68, 0.15)",
                            fill: true,
                            tension: 0.5,
                            borderWidth: 3,
                            pointRadius: 5,
                            pointHoverRadius: 8,
                            pointBackgroundColor: "rgba(239, 68, 68, 1)",
                            pointBorderColor: "#ffffff",
                            pointBorderWidth: 3,
                            pointHoverBackgroundColor: "rgba(239, 68, 68, 1)",
                            pointHoverBorderColor: "#ffffff",
                            pointHoverBorderWidth: 4
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: {
                            position: "top",
                            align: "end",
                            labels: {
                              padding: 20,
                              font: {
                                size: 13,
                                weight: "600",
                                family: "'Inter', sans-serif"
                              },
                              color: legendColor,
                              usePointStyle: true,
                              pointStyle: "circle",
                              boxWidth: 8,
                              boxHeight: 8
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
                            mode: "index",
                            intersect: false,
                            titleSpacing: 4,
                            bodySpacing: 4,
                            boxPadding: 6,
                            callbacks: {
                              label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} requests`;
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            grid: {
                              color: gridColor,
                              drawBorder: false,
                              lineWidth: 1
                            },
                            ticks: {
                              color: tickColor,
                              font: {
                                size: 12,
                                weight: "500"
                              },
                              maxRotation: 45,
                              minRotation: 0,
                              padding: 10
                            }
                          },
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: gridColor,
                              drawBorder: false,
                              lineWidth: 1
                            },
                            ticks: {
                              color: tickColor,
                              font: {
                                size: 12,
                                weight: "500"
                              },
                              padding: 10,
                              stepSize: 1,
                              callback: function(value) {
                                return Number.isInteger(value) ? value : "";
                              }
                            }
                          }
                        },
                        interaction: {
                          mode: "nearest",
                          axis: "x",
                          intersect: false
                        },
                        animation: {
                          duration: 1000,
                          easing: "easeInOutQuart"
                        }
                      }}
                    />
                  ) : (
                    <div className="chart-empty-state">
                      <p>No data available for the selected period</p>
                      <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", opacity: 0.7 }}>Data will appear here once users start analyzing jobs</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Real vs Fake Pie Chart */}
              {stats && stats.totalPredictions > 0 && (
                <div className="admin-chart-card chart-card-pie">
                  <div className="admin-chart-header">
                    <div className="chart-header-content">
                      <div>
                        <h3 className="admin-chart-title">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline-block", marginRight: "8px", verticalAlign: "middle" }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                          </svg>
                          Real vs Fake Distribution
                        </h3>
                        <p className="admin-chart-subtitle">Overall platform analysis breakdown</p>
                      </div>
                      <div className="chart-stats-summary">
                        <div className="summary-item summary-success">
                          <span className="summary-label">Real</span>
                          <span className="summary-value">{stats.realPredictions || 0}</span>
                        </div>
                        <div className="summary-item summary-danger">
                          <span className="summary-label">Fake</span>
                          <span className="summary-value">{stats.fakePredictions || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="admin-chart-container">
                    <Pie
                      data={{
                        labels: ["Real Jobs", "Fake Jobs"],
                        datasets: [
                          {
                            label: "Job Analysis",
                            data: [stats.realPredictions || 0, stats.fakePredictions || 0],
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
                                return `${label}: ${value.toLocaleString()} (${percentage}%)`;
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
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="users-view">
            <div className="view-actions-bar">
              <h2 className="view-title">User Management</h2>
              {users.length > 0 && (
                <div className="export-buttons">
                  <button className="btn-export btn-export-excel" onClick={() => exportComprehensive('excel')} title="Export Users to Excel">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Excel
                  </button>
                  <button className="btn-export btn-export-pdf" onClick={() => exportComprehensive('pdf')} title="Export Users to PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    PDF
                  </button>
                </div>
              )}
            </div>
            <div className="table-container">
                <div className="users-table">
                  <div className="table-header">
                    <div className="col">Name</div>
                    <div className="col">Email</div>
                    <div className="col">Role</div>
                    <div className="col">Predictions</div>
                    <div className="col">Status</div>
                    <div className="col">Joined</div>
                    <div className="col">Actions</div>
                  </div>
                  <div className="table-body">
                    {users.map((userItem, index) => (
                      <div className="table-row" key={userItem._id} style={{ animationDelay: `${index * 0.05}s` }}>
                        <div className="col">
                          <div className="user-cell">
                            <div className="user-avatar-small">
                              {userItem.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <strong>{userItem.fullName}</strong>
                          </div>
                        </div>
                        <div className="col">{userItem.email}</div>
                        <div className="col">
                          <span className={`role-badge ${userItem.role === "admin" ? "admin" : "user"}`}>
                            {userItem.role === "admin" ? "Admin" : "User"}
                          </span>
                        </div>
                        <div className="col">
                          <span className="prediction-count">{userItem.predictionCount || 0}</span>
                        </div>
                        <div className="col">
                          <span className={`status-badge ${userItem.isActive ? "active" : "inactive"}`}>
                            {userItem.isActive ? (
                              <>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Active
                              </>
                            ) : (
                              <>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                                </svg>
                                Inactive
                              </>
                            )}
                          </span>
                        </div>
                        <div className="col">{new Date(userItem.createdAt).toLocaleDateString()}</div>
                        <div className="col">
                          <div className="action-buttons">
                            {userItem.role === "admin" ? (
                              <button
                                className="btn-action btn-demote"
                                onClick={() => handleUserAction(userItem._id, "demote")}
                                title="Demote to User"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 5v14M19 12l-7 7-7-7"/>
                                </svg>
                              </button>
                            ) : (
                              <button
                                className="btn-action btn-promote"
                                onClick={() => handleUserAction(userItem._id, "promote")}
                                title="Promote to Admin"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 19V5M5 12l7-7 7 7"/>
                                </svg>
                              </button>
                            )}
                            {userItem.isActive ? (
                              <button
                                className="btn-action btn-deactivate"
                                onClick={() => handleUserAction(userItem._id, "deactivate")}
                                title="Deactivate"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                              </button>
                            ) : (
                              <button
                                className="btn-action btn-activate"
                                onClick={() => handleUserAction(userItem._id, "activate")}
                                title="Activate"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                  <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="activity-view">
            <div className="view-actions-bar">
              <h2 className="view-title">Recent Activity</h2>
              {activity && activity.length > 0 && (
                <div className="export-buttons">
                  <button className="btn-export btn-export-excel" onClick={() => exportComprehensive('excel')} title="Export Activity to Excel">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Excel
                  </button>
                  <button className="btn-export btn-export-pdf" onClick={() => exportComprehensive('pdf')} title="Export Activity to PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    PDF
                  </button>
                </div>
              )}
            </div>
            {activity && activity.length > 0 ? (
              <div className="activity-list">
                  {activity.map((item, index) => (
                    <div 
                      key={item._id} 
                      className="activity-card"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="activity-card-top">
                        <div className="activity-avatar">
                          {item.userId?.fullName?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="activity-info">
                          <span className="activity-user-name">{item.userId?.fullName || "Unknown User"}</span>
                          <span className="activity-user-email">{item.userId?.email || "N/A"}</span>
                        </div>
                      </div>
                      
                      <div className="activity-card-body">
                        <div className="activity-job-title">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--admin-secondary)' }}>
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                          </svg>
                          {item.jobTitle || "Unknown Job"}
                        </div>
                        <div className="activity-meta">
                          {item.prediction?.isFake ? (
                            <span className="ai-prediction-wrapper fake">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                              </svg>
                              Fake
                            </span>
                          ) : (
                            <span className="ai-prediction-wrapper real">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                              </svg>
                              Real
                            </span>
                          )}
                          <span className="confidence-badge">
                            {item.prediction?.confidence || 0}% Confidence
                          </span>
                        </div>
                      </div>

                      <div className="activity-card-footer">
                        <span className="activity-date">
                          {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button 
                          className="btn-details-mini"
                          onClick={() => handleViewDetails(item._id)}
                          title="View Job Details"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-content">
                  <h3>No Activity Yet</h3>
                  <p>Activities will appear here as users make predictions</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "flagged" && (
          <div className="flagged-view">
            <div className="view-actions-bar">
              <h2 className="view-title">Flagged Posts</h2>
              {flaggedPosts.length > 0 && (
                <div className="export-buttons">
                  <button className="btn-export btn-export-excel" onClick={() => exportFlaggedPosts('excel')} title="Export Flagged to Excel">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Excel
                  </button>
                  <button className="btn-export btn-export-pdf" onClick={() => exportFlaggedPosts('pdf')} title="Export Flagged to PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    PDF
                  </button>
                </div>
              )}
            </div>
            <div className="admin-actions-bar">
              <div className="filter-buttons">
                <button
                  className={`btn ${filterStatus === "all" ? "btn-filter-active" : ""}`}
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </button>
                <button
                  className={`btn ${filterStatus === "pending" ? "btn-filter-active" : ""}`}
                  onClick={() => setFilterStatus("pending")}
                >
                  Pending
                </button>
                <button
                  className={`btn ${filterStatus === "reviewed" ? "btn-filter-active" : ""}`}
                  onClick={() => setFilterStatus("reviewed")}
                >
                  Reviewed
                </button>
                <button
                  className={`btn ${filterStatus === "resolved" ? "btn-filter-active" : ""}`}
                  onClick={() => setFilterStatus("resolved")}
                >
                  Resolved
                </button>
              </div>
            </div>

            {flaggedPosts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-content">
                  <h3>No Flagged Posts</h3>
                  <p>No posts have been flagged yet</p>
                </div>
              </div>
            ) : (
              <div className="flagged-list">
                {flaggedPosts.map((post, index) => (
                  <div key={post._id} className="flagged-card" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="flagged-card-header">
                      <div className="flagged-card-title">
                        <h3>{post.jobTitle}</h3>
                        <span className="flagged-card-subtitle">{post.company}</span>
                      </div>
                      <span className={`status-badge status-${post.adminStatus || "pending"}`}>
                        {post.adminStatus === "resolved" || post.adminStatus === "reviewed" ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : post.adminStatus === "pending" ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                            <circle cx="12" cy="12" r="10"></circle>
                          </svg>
                        ) : null}
                        {post.adminStatus || "pending"}
                      </span>
                    </div>

                    <div className="flagged-card-body">
                      <div className="flagged-info-row">
                        <div className="flagged-info-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <div className="flagged-info-content">
                          <span className="flagged-info-label">Flagged By</span>
                          <span className="flagged-info-value">{post.flaggedBy?.fullName || "Unknown User"}</span>
                        </div>
                      </div>

                      <div className="flagged-info-row">
                        <div className="flagged-info-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                        </div>
                        <div className="flagged-info-content">
                          <span className="flagged-info-label">Reason</span>
                          <span className="flagged-info-value">{post.flaggedReason || "No reason provided"}</span>
                        </div>
                      </div>

                      <div className="flagged-info-row">
                        <div className="flagged-info-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                            <circle cx="12" cy="5" r="2"></circle>
                            <path d="M12 7v4"></path>
                            <line x1="8" y1="16" x2="8" y2="16"></line>
                            <line x1="16" y1="16" x2="16" y2="16"></line>
                          </svg>
                        </div>
                        <div className="flagged-info-content">
                          <span className="flagged-info-label">AI Prediction</span>
                          <span className="flagged-info-value">
                            {post.prediction?.isFake ? (
                              <span className="ai-prediction-wrapper fake">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                  <line x1="12" y1="9" x2="12" y2="13"></line>
                                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                Fake
                              </span>
                            ) : (
                              <span className="ai-prediction-wrapper real">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                Real
                              </span>
                            )} ({post.prediction?.confidence}% Confidence)
                          </span>
                        </div>
                      </div>

                      <div className="flagged-info-row">
                        <div className="flagged-info-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>
                        <div className="flagged-info-content">
                          <span className="flagged-info-label">Flagged Date</span>
                          <span className="flagged-info-value">{new Date(post.flaggedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flagged-card-footer">
                      <button 
                        className="btn-details-secondary"
                        onClick={() => handleViewDetails(post._id)}
                      >
                        View Full Details
                      </button>
                      <select
                        className="status-select"
                        value={post.adminStatus || "pending"}
                        onChange={async (e) => {
                          try {
                            await adminAPI.updateFlaggedPostStatus(post._id, {
                              status: e.target.value
                            });
                            loadFlaggedPosts();
                          } catch (err) {
                            console.error("Error updating status:", err);
                          }
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="feedback-view">
            <div className="view-actions-bar">
              <h2 className="view-title">User Feedback</h2>
              {feedback.length > 0 && (
                <div className="export-buttons">
                  <button className="btn-export btn-export-excel" onClick={() => exportFeedback('excel')} title="Export Feedback to Excel">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Excel
                  </button>
                  <button className="btn-export btn-export-pdf" onClick={() => exportFeedback('pdf')} title="Export Feedback to PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    PDF
                  </button>
                </div>
              )}
            </div>
            {feedback.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-content">
                  <h3>No Feedback</h3>
                  <p>No feedback has been submitted yet</p>
                </div>
              </div>
            ) : (
              <div className="feedback-list">
                {feedback.map((item, index) => (
                  <div key={item._id} className="feedback-card" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="feedback-card-header">
                      <span className={`type-badge type-${item.type}`}>{item.type}</span>
                      <span className={`status-badge status-${item.status}`}>
                        {item.status === "resolved" || item.status === "reviewed" ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : item.status === "pending" ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                            <circle cx="12" cy="12" r="10"></circle>
                          </svg>
                        ) : null}
                        {item.status}
                      </span>
                    </div>

                    <div className="feedback-card-body">
                      <h3 className="feedback-subject">{item.subject}</h3>
                      <p className="feedback-message">{item.message}</p>
                      
                      <div className="feedback-user-info">
                        <div className="feedback-user-avatar">
                          {item.userId?.fullName?.charAt(0).toUpperCase() || (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          )}
                        </div>
                        <div className="feedback-user-details">
                          <span className="feedback-user-name">{item.userId?.fullName || "Unknown User"}</span>
                          <span className="feedback-user-email">{item.userId?.email || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="feedback-card-footer">
                      <span className="activity-date">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <div className="feedback-actions">
                        <select
                          className="status-select"
                          value={item.status}
                          onChange={async (e) => {
                            try {
                              await adminAPI.updateFeedbackStatus(item._id, {
                                status: e.target.value
                              });
                              loadFeedback();
                            } catch (err) {
                              console.error("Error updating status:", err);
                            }
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="resolved">Resolved</option>
                          <option value="dismissed">Dismissed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </main>
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

export default AdminPanel;

import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "../styles/Navigation.css";

export const Navigation = () => {
  const { user, token, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  // Don't show navigation on auth pages
  if (["/login", "/register"].includes(location.pathname)) {
    return null;
  }

  const isActive = (path) => location.pathname === path;
  const isAdminPage = location.pathname === "/admin";

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isAdminPage ? "admin-page" : ""}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={handleLinkClick}>
          <div className="logo-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"></rect>
              <path d="M9 9h6M9 15h6M12 3v18"></path>
              <circle cx="12" cy="12" r="2" fill="currentColor"></circle>
            </svg>
          </div>
          <span className="logo-text">JobCheck</span>
        </Link>

        {/* Mobile Hamburger Menu */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>

        {token && user ? (
          <div className={`nav-menu-center ${mobileMenuOpen ? "mobile-open" : ""}`}>
            {user.role === "admin" ? (
              <Link 
                to="/admin" 
                className={`nav-link ${isActive("/admin") ? "active" : ""}`}
                onClick={handleLinkClick}
              >
                Admin Panel
              </Link>
            ) : (
              <>
                <Link 
                  to="/checker" 
                  className={`nav-link ${isActive("/checker") ? "active" : ""}`}
                  onClick={handleLinkClick}
                >
                  Check Job
                </Link>
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
                  onClick={handleLinkClick}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/feedback" 
                  className={`nav-link ${isActive("/feedback") ? "active" : ""}`}
                  onClick={handleLinkClick}
                >
                  Feedback
                </Link>
              </>
            )}
          </div>
        ) : null}

        <div className={`nav-menu-right ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
            {theme === "dark" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
          {token && user && (
            <div className="nav-user-section" onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }} style={{ cursor: "pointer" }}>
              <div className="user-avatar">{user.fullName.charAt(0).toUpperCase()}</div>
              <span className="nav-user-name">{user.fullName}</span>
              {user.role === "admin" && (
                <span className="nav-role-badge">Admin</span>
              )}
            </div>
          )}
          {token && user ? (
            <button className="nav-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="nav-login-btn" onClick={handleLinkClick}>
                Login
              </Link>
              <Link to="/register" className="nav-register-btn" onClick={handleLinkClick}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

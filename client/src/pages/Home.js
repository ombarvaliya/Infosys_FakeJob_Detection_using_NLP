import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Home.css";

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </span>
              <span>AI-Powered Fraud Protection</span>
            </div>
            <h1 className="hero-title">
              Protect Your Career from
              <span className="gradient-text"> Fraudulent Job Scams</span>
            </h1>
            <p className="hero-description">
              JobCheck uses advanced machine learning and AI algorithms to instantly detect 
              fake job postings and protect job seekers from employment scams. Get accurate, 
              real-time analysis in seconds.
            </p>
            <div className="hero-buttons">
              {user ? (
                <>
                  <button
                    className="btn-hero btn-primary-hero"
                    onClick={() => navigate(user.role === "admin" ? "/admin" : "/checker")}
                  >
                    <span>{user.role === "admin" ? "Admin Dashboard" : "Start Checking Jobs"}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                  <button
                    className="btn-hero btn-secondary-hero"
                    onClick={() => navigate("/dashboard")}
                  >
                    View Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn-hero btn-primary-hero"
                    onClick={() => navigate("/register")}
                  >
                    <span>Get Started Free</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                  <button
                    className="btn-hero btn-secondary-hero"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="visual-card">
              <div className="card-header">
                <div className="card-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="card-content">
                <div className="holo-visual">
                  <div className="holo-grid"></div>
                  <div className="holo-ring ring-1"></div>
                  <div className="holo-ring ring-2"></div>
                  <div className="holo-ring ring-3"></div>
                  <div className="holo-pulse"></div>
                  <div className="holo-dots">
                    <span className="dot dot-1"></span>
                    <span className="dot dot-2"></span>
                    <span className="dot dot-3"></span>
                    <span className="dot dot-4"></span>
                  </div>
                  <div className="holo-orbits">
                    <span className="orbit orbit-1"></span>
                    <span className="orbit orbit-2"></span>
                    <span className="orbit orbit-3"></span>
                  </div>
                  <div className="holo-beam"></div>
                </div>
              </div>
            </div>
            <div className="floating-elements">
              <div className="float-element float-1"></div>
              <div className="float-element float-2"></div>
              <div className="float-element float-3"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

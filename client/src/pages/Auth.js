import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { authAPI } from "../utils/api";
import "../styles/Auth.css";

export const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear form on component mount
    setFormData({ email: "", password: "" });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      if (response.data.success) {
        login(response.data.user, response.data.token);
        navigate(response.data.user.role === "admin" ? "/admin" : "/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="back-button" onClick={() => navigate("/")} title="Back to Home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1>JobCheck</h1>
        <p className="subtitle">Detect Fake Job Postings</p>
        <h2>Login</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              autoComplete="off"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <Link to="/forgot-password" style={{ color: "var(--primary)", textDecoration: "none", fontSize: "14px" }}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export const Register = () => {
  const [step, setStep] = useState("form"); // form, verification
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear form on component mount
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
    setStep("form");
    setError("");
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Request verification
      const response = await authAPI.registerRequest(formData);
      if (response.data.success) {
        setStep("verification");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 2: Verify code and complete registration
      const response = await authAPI.register({
        email: formData.email,
        code: verificationCode
      });
      if (response.data.success) {
        login(response.data.user, response.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="back-button" onClick={() => navigate("/")} title="Back to Home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1>JobCheck</h1>
        <p className="subtitle">Detect Fake Job Postings</p>
        <h2>{step === "form" ? "Create Account" : "Verify Email"}</h2>

        {error && <div className="error-message">{error}</div>}

        {step === "form" ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                autoComplete="off"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                autoComplete="off"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Sending verification code..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerificationSubmit}>
            <div style={{ 
              marginBottom: "20px",
              backgroundColor: "#f0f9ff",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #bfdbfe"
            }}>
              <p style={{ color: "#1e40af", marginBottom: "10px", fontWeight: "600" }}>
                Verification Code Sent
              </p>
              <p style={{ color: "#6b7280", marginBottom: "0" }}>
                A verification code has been sent to <strong>{formData.email}</strong>. Check your inbox and enter the code below.
              </p>
            </div>

            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                maxLength="6"
                required
                style={{ textAlign: "center", fontSize: "20px", letterSpacing: "8px" }}
              />
              <small style={{ color: "#9ca3af", marginTop: "8px", display: "block" }}>
                Code expires in 10 minutes
              </small>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setStep("form");
                setVerificationCode("");
                setError("");
              }}
              style={{ marginTop: "10px" }}
              disabled={loading}
            >
              Back to Registration
            </button>
          </form>
        )}

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export const ForgotPassword = () => {
  const [step, setStep] = useState("email"); // email, code, reset
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Clear form on component mount
    setFormData({
      email: "",
      code: "",
      newPassword: "",
      confirmPassword: ""
    });
    setStep("email");
    setError("");
    setSuccess("");
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email: formData.email });
      if (response.data.success) {
        setSuccess("Reset code sent to your email");
        setStep("code");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Just validate code format, then move to reset step
      if (formData.code.length !== 6) {
        setError("Please enter a valid 6-digit code");
        setLoading(false);
        return;
      }
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.resetPassword({
        email: formData.email,
        code: formData.code,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      if (response.data.success) {
        setSuccess("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>JobCheck</h1>
        <p className="subtitle">Detect Fake Job Postings</p>
        <h2>Reset Password</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                autoComplete="off"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Sending reset code..." : "Send Reset Code"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/login")}
              style={{ marginTop: "10px" }}
              disabled={loading}
            >
              Back to Login
            </button>
          </form>
        ) : step === "code" ? (
          <form onSubmit={handleCodeSubmit}>
            <div style={{ 
              marginBottom: "20px",
              backgroundColor: "#f0f9ff",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #bfdbfe"
            }}>
              <p style={{ color: "#1e40af", marginBottom: "10px", fontWeight: "600" }}>
                Reset Code Sent
              </p>
              <p style={{ color: "#6b7280", marginBottom: "0" }}>
                A password reset code has been sent to <strong>{formData.email}</strong>. Check your inbox and enter the code below.
              </p>
            </div>

            <div className="form-group">
              <label>Reset Code</label>
              <input
                type="text"
                name="code"
                placeholder="Enter 6-digit code"
                value={formData.code}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 6).replace(/\D/g, "");
                  setFormData({ ...formData, code: value });
                }}
                maxLength="6"
                required
                style={{ textAlign: "center", fontSize: "20px", letterSpacing: "8px" }}
              />
              <small style={{ color: "#9ca3af", marginTop: "8px", display: "block" }}>
                Code expires in 10 minutes
              </small>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setStep("email");
                setFormData({ ...formData, code: "" });
                setError("");
              }}
              style={{ marginTop: "10px" }}
              disabled={loading}
            >
              Back
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                autoComplete="new-password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                minLength="6"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Resetting password..." : "Reset Password"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setStep("code");
                setFormData({ ...formData, newPassword: "", confirmPassword: "" });
                setError("");
              }}
              style={{ marginTop: "10px" }}
              disabled={loading}
            >
              Back
            </button>
          </form>
        )}

        <p className="auth-link">
          Remember your password? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navigation from "./components/Navigation";
import { Home } from "./pages/Home";
import { Login, Register, ForgotPassword } from "./pages/Auth";
import JobChecker from "./pages/JobChecker";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import Feedback from "./pages/Feedback";
import "./styles/global.css";

const PrivateRoute = ({ element, requiredRole }) => {
  return (
    <AuthContext.Consumer>
      {({ user, token }) => {
        if (!token) {
          return <Navigate to="/login" replace />;
        }
        if (requiredRole && user?.role !== requiredRole) {
          return <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />;
        }
        return element;
      }}
    </AuthContext.Consumer>
  );
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
      <AuthProvider>
        <Navigation />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* User Routes */}
          <Route
            path="/checker"
            element={<PrivateRoute element={<JobChecker />} />}
          />
          <Route
            path="/dashboard"
            element={<PrivateRoute element={<Dashboard />} />}
          />
            <Route
              path="/profile"
              element={<PrivateRoute element={<Profile />} />}
            />
            <Route
              path="/feedback"
              element={<PrivateRoute element={<Feedback />} />}
            />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={<PrivateRoute element={<AdminPanel />} requiredRole="admin" />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

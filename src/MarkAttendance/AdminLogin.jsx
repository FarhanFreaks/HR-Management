import React, { useState } from "react";
// Optional: Import useNavigate if you are using react-router-dom for navigation
import { useNavigate } from "react-router-dom"; 
import "./AdminLogin.css";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // <-- Added state for error feedback

  // const navigate = useNavigate(); // <-- Initialize routing hook if applicable

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error message on new attempt

    // Strict credential check condition
    if (adminId === "AD101" && password === "AD101PW") {
      navigate("/attendanceLogin"); // Option A: If using React Router, route them to your dashboard path
      // Option A: If using React Router, route them to your dashboard path:
      // navigate("/dashboard"); 
      
      // Option B: Direct window redirect fallback:
      // window.location.href = "/dashboard";
    } else {
      // Clear password field on failure and show an error message
      setPassword("");
      setErrorMessage("Invalid Admin ID or Password. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo" aria-hidden="true">🔐</div>
          <h1>Admin Portal</h1>
          <p>Please enter your secure credentials to manage the dashboard.</p>
        </div>

        {/* Error message display section */}
        {errorMessage && (
          <div className="login-error-alert" role="alert">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Admin ID Field */}
          <div className="form-group">
            <label htmlFor="adminId">Admin ID</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true"></span>
              <input
                type="text"
                id="adminId"
                className="form-input"
                placeholder="e.g., AD101"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true"></span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="login-submit-btn">
            Sign In to Dashboard
          </button>
        </form>

        <footer className="login-footer">
          <p>Authorized personnel only. All login attempts are monitored.</p>
        </footer>
      </div>
    </div>
  );
}
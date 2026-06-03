import React, { useState } from "react";
import "./EmployeeLogin.css";

export default function EmployeeLogin() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();


    const currentTimeString = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "medium",
    });

   
    console.log("=== Employee Authentication Payload ===");
    console.log("Employee ID: ", employeeId);
    console.log("Password:    ", password);
    console.log("Logged Time: ", currentTimeString);
    console.log("=======================================");

    alert(`Login recorded for Employee ID: ${employeeId}\nTimestamp logged to console.`);
    
    // Optional: Reset form fields after capturing payload
    setEmployeeId("");
    setPassword("");
  };

  return (
    <div className="emp-login-container">
      <div className="emp-login-card">
        <div className="emp-login-header">
          <div className="emp-login-avatar" aria-hidden="true">🏢</div>
          <h1>Workforce Portal</h1>
          <p>Sign in to record your attendance and access your workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="emp-login-form">
          {/* Employee ID Input */}
          <div className="emp-form-group">
            <label htmlFor="employeeId">Employee ID</label>
            <div className="emp-input-wrapper">
              <span className="emp-input-icon" aria-hidden="true">🆔</span>
              <input
                type="text"
                id="employeeId"
                className="emp-form-input"
                placeholder="e.g., EMP2026-94"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="emp-form-group">
            <label htmlFor="password">Security Password</label>
            <div className="emp-input-wrapper">
              <span className="emp-input-icon" aria-hidden="true">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="emp-form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="emp-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button type="submit" className="emp-login-btn">
            Authenticate & Log In
          </button>
        </form>

        <footer className="emp-login-footer">
          <p>Secured Connection. Unauthorized access is strictly prohibited.</p>
        </footer>
      </div>
    </div>
  );
}
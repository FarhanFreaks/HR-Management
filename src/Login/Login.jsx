import React, { useState } from "react";
import "./Login.css";
import { FaEnvelope, FaEyeSlash } from "react-icons/fa";
import loginImage from "./assets/hrms.png";
import forgotImage from "./assets/forgot.png";
import { useNavigate } from "react-router-dom";
import { supabase } from "../config/supabaseClient";

const Login = () => {
  const navigate = useNavigate();
  // The role toggle dictates the intended portal
  const [role, setRole] = useState("HR");
  
  // State for Supabase Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [forgotPage, setForgotPage] = useState(false);
  const [resetPage, setResetPage] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // 1. CAPTURE INTENT IMMEDIATELY: Save this BEFORE calling Supabase.
    // This completely fixes the race condition with App.jsx
    const requestedPortal = role.toLowerCase(); 
    localStorage.setItem('activePortal', requestedPortal);

    try {
      // 2. Authenticate the user's identity
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      // 3. Fetch their official role from the profiles table
      const userId = authData.user.id;
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError || !profileData) {
        await supabase.auth.signOut();
        throw new Error("Profile not found in database. Contact your administrator.");
      }

      const dbRole = profileData.role.toLowerCase();

      // 4. Hierarchical Security Check
      // Block regular employees from entering the HR portal. 
      if (requestedPortal === 'hr' && dbRole !== 'hr') {
        await supabase.auth.signOut(); // Instantly revoke the session
        throw new Error("Access Denied: You do not have HR privileges.");
      }

      // We do not need to manually navigate() here anymore! 
      // App.jsx will automatically see the session, read the localStorage we set above, 
      // and securely route you to the correct dashboard.

    } catch (error) {
      setErrorMsg(error.message);
      // Clean up the memory if they typed the wrong password or lacked permissions
      localStorage.removeItem('activePortal'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!forgotPage && !resetPage ? (
        <div className="login-container">
          <div className="left-side">
            <div className="image-box">
              <img src={loginImage} alt="login" />
            </div>
          </div>
          <div className="right-side">
            <div className="switch-btn">
              <button
                type="button"
                className={role === "HR" ? "active-btn" : ""}
                onClick={() => setRole("HR")}
              >
                HR
              </button>
              <button
                type="button"
                className={role === "Employee" ? "active-btn" : ""}
                onClick={() => setRole("Employee")}
              >
                Employee
              </button>
            </div>
            <h2 className="login-title">{role} LOGIN</h2>
            
            <form className="login-form" onSubmit={handleLogin}>
              {errorMsg && <p style={{ color: "red", textAlign: "center" }}>{errorMsg}</p>}
              
              <label>Email Address</label>
              <div className="input-box">
                <input 
                  type="email" 
                  placeholder="Enter Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FaEnvelope />
              </div>
              
              <label>Password</label>
              <div className="input-box">
                <input 
                  type="password" 
                  placeholder="Enter Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <FaEyeSlash />
              </div>
              
              <div className="forgot-password">
                <button
                  type="button"
                  className="forgot-btn"
                  onClick={() => setForgotPage(true)}
                >
                  Forgot Password?
                </button>
              </div>
              
              <button
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <p className="help-text">
              Need help? <span>Contact HR Department</span>
            </p>
          </div>
        </div>
      ) : forgotPage ? (
        <div className="forgot-container">
          <div className="forgot-left">
            <div className="forgot-image-box">
              <img src={forgotImage} alt="forgot" />
            </div>
          </div>
          <div className="forgot-right">
            <h1 className="forgot-logo">HRMS</h1>
            <p className="forgot-subtitle">HR Management System</p>
            <h2 className="forgot-title">Forgot Password</h2>
            <form className="forgot-form">
              <label>Email ID</label>
              <div className="forgot-input">
                <input type="email" placeholder="Enter Email ID" />
                <FaEnvelope />
              </div>
              <button type="button" className="send-otp-btn">Send OTP</button>
              <label>Enter OTP</label>
              <div className="forgot-input">
                <input type="text" placeholder="Enter OTP" />
                <FaEyeSlash />
              </div>
              <button type="button" className="submit-btn" onClick={() => { setForgotPage(false); setResetPage(true); }}>Submit</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="forgot-container">
           {/* ... existing reset UI ... */}
           <button type="button" className="back-btn" onClick={() => { setResetPage(false); setForgotPage(false); }}>Back</button>
        </div>
      )}
    </>
  );
};

export default Login;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import './EmployeeLogin.css';
import { FaUserClock } from 'react-icons/fa';
import {
  clearAttendanceSession,
  createAttendanceSession,
  readAttendanceSession,
  saveAttendanceSession,
  wasAttendanceLoggedOut,
} from './attendanceSession';

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    let isMounted = true;

    const bootstrapAttendanceSession = async () => {
      const storedSession = readAttendanceSession();
      if (storedSession) {
        navigate('/mark-attendance');
        return;
      }

      if (wasAttendanceLoggedOut()) {
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !isMounted) return;

      try {
        const attendanceSession = await createAttendanceSession(session.user);
        if (!isMounted) return;
        saveAttendanceSession(attendanceSession);
        navigate('/mark-attendance');
      } catch (error) {
        if (!isMounted) return;
        clearAttendanceSession();
        setMessage({ text: `❌ ${error.message}`, type: 'error' });
      }
    };

    bootstrapAttendanceSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // 1. Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error('Invalid email or password');
      }

      const sessionData = await createAttendanceSession(authData.user);
      saveAttendanceSession(sessionData);

      setMessage({ text: '✅ Login successful! Redirecting...', type: 'success' });

      // 5. Redirect to attendance marking page
      setTimeout(() => {
        navigate('/mark-attendance');
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      setMessage({
        text: `❌ ${error.message}`,
        type: 'error',
      });
      
      clearAttendanceSession();
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/quick-actions');
  };

  return (
    <div className="employee-login-container">
      {/* Background design elements */}
      <div className="qa-bg-shape qa-shape-1"></div>
      <div className="qa-bg-shape qa-shape-2"></div>

      <div className="employee-login-wrapper">
        <div className="login-header">
          <div className="header-icon-wrapper">
            <FaUserClock />
          </div>
          <h1>Employee Attendance</h1>
          <p>Mark Your Daily Presence</p>
        </div>

        <form className="employee-login-form" onSubmit={handleLogin}>
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Login to Mark Attendance'}
          </button>

          <button
            type="button"
            className="btn-back"
            onClick={handleBackClick}
            disabled={loading}
          >
            ← Back to Home
          </button>
        </form>

        <div className="login-footer">
          <p>Need help? Contact HR Department</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;

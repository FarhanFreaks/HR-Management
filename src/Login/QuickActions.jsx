import React from 'react';
import './QuickActions.css';
import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
    const navigate = useNavigate();
  const handleLogin = () => {

    navigate('/login'); // Navigate to the login page
    // Add your login logic here
  };

  const handleAttendance = () => {
    navigate('/admin-login'); // Navigate to the attendance page
    // Add your attendance logging logic here
  };

  return (
    <div className="action-container">
      <div className="action-card">
        <h2 className="action-title">Quick Actions</h2>
        <p className="action-subtitle">Select an option to proceed with your daily workflow.</p>
        
        <div className="button-group">
          <button 
            className="btn btn--login" 
            onClick={handleLogin}
            type="button"
          >
            <span className="btn__icon" aria-hidden="true">🔑</span>
            Log In
          </button>
          
          <button 
            className="btn btn--attendance" 
            onClick={handleAttendance}
            type="button"
          >
            <span className="btn__icon" aria-hidden="true">📅</span>
            Mark Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
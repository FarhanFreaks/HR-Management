import React from 'react';
import './QuickActions.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { clearAttendanceSession } from '../MarkAttendance/attendanceSession';
import { FaSignInAlt, FaCalendarCheck } from 'react-icons/fa';

export default function QuickActions() {
    const navigate = useNavigate();
    
    const handleLogin = async () => {
        localStorage.removeItem('activePortal');
        clearAttendanceSession();
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
    };

    const handleAttendance = () => {
        navigate('/attendance-login');
    };

    return (
        <div className="qa-wrapper">
            {/* Background design elements */}
            <div className="qa-bg-shape qa-shape-1"></div>
            <div className="qa-bg-shape qa-shape-2"></div>
            
            <div className="qa-glass-card">
                <div className="qa-header">
                    <h1 className="qa-title">Welcome to HRConnect</h1>
                    <p className="qa-subtitle">Select a module below to proceed with your workflow</p>
                </div>
                
                <div className="qa-tile-grid">
                    <button 
                        className="qa-tile qa-tile--login" 
                        onClick={handleLogin}
                        type="button"
                    >
                        <div className="qa-icon-wrapper">
                            <FaSignInAlt className="qa-icon" />
                        </div>
                        <h2 className="qa-tile-title">Staff Login</h2>
                        <p className="qa-tile-desc">Access your personalized HR or Employee portal</p>
                    </button>
                    
                    <button 
                        className="qa-tile qa-tile--attendance" 
                        onClick={handleAttendance}
                        type="button"
                    >
                        <div className="qa-icon-wrapper">
                            <FaCalendarCheck className="qa-icon" />
                        </div>
                        <h2 className="qa-tile-title">Mark Attendance</h2>
                        <p className="qa-tile-desc">Log your daily presence and track your hours</p>
                    </button>
                </div>
            </div>
        </div>
    );
}

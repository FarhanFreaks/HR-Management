import React from 'react';
import './QuickActions.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { clearAttendanceSession } from '../MarkAttendance/attendanceSession';

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

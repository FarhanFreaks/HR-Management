import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import './AttendanceMarking.css';
import {
  clearAttendanceSession,
  createAttendanceSession,
  markAttendanceLoggedOut,
  readAttendanceSession,
  saveAttendanceSession,
  wasAttendanceLoggedOut,
} from './attendanceSession';

const AttendanceMarking = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    let isMounted = true;
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const bootstrapAttendanceSession = async () => {
      const storedAttendanceSession = readAttendanceSession();
      if (storedAttendanceSession) {
        setEmployee(storedAttendanceSession);
        fetchTodayAttendance(storedAttendanceSession.id);
        return;
      }

      if (wasAttendanceLoggedOut()) {
        navigate('/attendance-login');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/attendance-login');
        return;
      }

      try {
        const attendanceSession = await createAttendanceSession(session.user);
        if (!isMounted) return;
        saveAttendanceSession(attendanceSession);
        setEmployee(attendanceSession);
        fetchTodayAttendance(attendanceSession.id);
      } catch {
        if (!isMounted) return;
        clearAttendanceSession();
        navigate('/attendance-login');
      }
    };

    bootstrapAttendanceSession();

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [navigate]);

  const getLocalDateString = (date = new Date()) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0];
  };

  const fetchTodayAttendance = async (employeeId) => {
    try {
      const today = getLocalDateString();
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setAttendance(data);
    } catch (err) {
      console.error('Error fetching attendance:', err.message);
    }
  };

  const handleCheckIn = async () => {
    if (!employee) return;
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const today = getLocalDateString();
      const checkInTime = new Date().toISOString();

      const { data, error } = await supabase
        .from('attendance')
        .insert([
          {
            employee_id: employee.id,
            date: today,
            punch_in: checkInTime,
            status: 'Present',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMessage({ text: '✅ Check-In Successful!', type: 'success' });
      setAttendance(data);
    } catch (error) {
      setMessage({ text: `❌ ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!attendance) return;
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const checkOutTime = new Date().toISOString();

      const { error } = await supabase
        .from('attendance')
        .update({
          punch_out: checkOutTime,
        })
        .eq('id', attendance.id);

      if (error) throw error;

      setMessage({ text: '✅ Check-Out Successful!', type: 'success' });
      setAttendance({
        ...attendance,
        punch_out: checkOutTime,
      });
    } catch (error) {
      setMessage({ text: `❌ ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    markAttendanceLoggedOut();
    navigate('/quick-actions');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!employee) {
    return (
      <div className="attendance-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <div className="header-content">
          <h1>📍 Attendance Marking</h1>
          <p>Welcome, {employee.full_name}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="attendance-main">
        <div className="time-card">
          <div className="date-display">{formatDate(currentTime)}</div>
          <div className="time-display">{formatTime(currentTime)}</div>
        </div>

        <div className="employee-info-card">
          <div className="info-item">
            <label>Employee ID</label>
            <span>{employee.emp_id || employee.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="info-item">
            <label>Email</label>
            <span>{employee.email}</span>
          </div>
          <div className="info-item">
            <label>Department</label>
            <span>{employee.department || 'N/A'}</span>
          </div>
        </div>

        <div className="status-card">
          <h3>Today's Attendance Status</h3>
          {attendance ? (
            <div className="attendance-status">
              <div className="status-item">
                <label>Check-In:</label>
                <span className="status-time">
                  {attendance.punch_in
                    ? new Date(attendance.punch_in).toLocaleTimeString()
                    : '⏳ Pending'}
                </span>
              </div>
              <div className="status-item">
                <label>Check-Out:</label>
                <span className="status-time">
                  {attendance.punch_out
                    ? new Date(attendance.punch_out).toLocaleTimeString()
                    : '⏳ Pending'}
                </span>
              </div>
              <div className="status-item">
                <label>Status:</label>
                <span className="status-badge present">{attendance.status}</span>
              </div>
              <div className="status-item">
                <label>Duration:</label>
                <span>
                  {attendance.punch_out
                    ? (() => {
                        const checkIn = new Date(attendance.punch_in);
                        const checkOut = new Date(attendance.punch_out);
                        const diff = checkOut - checkIn;
                        const hours = Math.floor(diff / 3600000);
                        const minutes = Math.floor((diff % 3600000) / 60000);
                        return `${hours}h ${minutes}m`;
                      })()
                    : 'Ongoing'}
                </span>
              </div>
            </div>
          ) : (
            <p className="no-attendance">No attendance record for today yet</p>
          )}
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="action-buttons">
          <button
            className={`btn-checkin ${attendance && attendance.punch_in ? 'disabled' : ''}`}
            onClick={handleCheckIn}
            disabled={loading || (attendance && attendance.punch_in)}
            title={attendance && attendance.punch_in ? 'Already checked in' : 'Click to check in'}
          >
            ✅ Check In
          </button>

          <button
            className={`btn-checkout ${!attendance || !attendance.punch_in || attendance.punch_out ? 'disabled' : ''}`}
            onClick={handleCheckOut}
            disabled={loading || !attendance || !attendance.punch_in || attendance.punch_out}
            title={!attendance || !attendance.punch_in ? 'Check in first' : 'Click to check out'}
          >
            👋 Check Out
          </button>
        </div>

        {attendance && attendance.punch_out && (
          <div className="completed-message">
            ✨ Attendance completed for today
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceMarking;

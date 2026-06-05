import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './config/supabaseClient';

// HR Layout Imports
import Layout from './HR layout/components/Layout.jsx';
import LoginInfo from './HR layout/pages/LoginInfo.jsx';
import PlaceholderPage from './HR layout/pages/PlaceholderPage.jsx';
import './HR layout/styles/global.css';
import Dashboard from './HR layout/Dashboard/Dashboard.jsx';
import EmployeeDetails from './HR layout/Employee/Employee.jsx';
import LeaveManagement from './HR layout/Leave/LeaveManagement.jsx';
import Payroll from './HR layout/Payroll/Payroll.jsx';
import AttendanceManagement from './HR layout/Attendance/AttendanceManagement.jsx';
import Recruitment from './HR layout/Recruitment/Recruitment.jsx';
import EmployeeDetail from './HR layout/Employee/EmployeeDetail.jsx';

// Employee Layout Imports
import EmployeeLayout from './Employee layout/Empcomponentse/Layoute.jsx';
import EmployeeLoginInfo from './Employee layout/Emppages/Logininfoe.jsx';
import EmployeeDashboard from './Employee layout/Empdashboard/EmployeeDashboard.jsx';
import EmployeeProfile from './Employee layout/Employeemodule/EmployeeProfile.jsx';
import EmployeeLeave from './Employee layout/Empleave/Leave.jsx';
import EmployeeRecruitmentModule from './Employee layout/Emprecruitment/RecruitmentModule.jsx';

// Public Imports
import QuickActions from './Login/QuickActions.jsx';
import EmployeeLogin from './MarkAttendance/EmployeeLogin.jsx';
import AttendanceMarking from './MarkAttendance/AttendanceMarking.jsx';
import Login from './Login/Login.jsx';


export default function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        localStorage.removeItem('activePortal'); // Clear memory if no active session
        setLoading(false);
      }
    });

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setUserRole(null);
        localStorage.removeItem('activePortal'); // Wipe memory immediately on logout
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error("Error fetching profile:", error);
    }
    
    if (data) {
      const dbRole = data.role.toLowerCase();
      // Read which portal they clicked on the login screen
      const requestedPortal = localStorage.getItem('activePortal') || dbRole;

      // SECURITY GATEKEEPER: 
      // If a regular employee tries to hack localStorage to access 'hr', force them back to 'employee'.
      if (requestedPortal === 'hr' && dbRole !== 'hr') {
        setUserRole('employee');
      } else {
        // THE MAGIC LINE: If HR clicked 'employee', this temporarily sets their app role to 'employee'
        // unlocking the Employee layout and dashboard!
        setUserRole(requestedPortal);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading HRConnect...</div>;
  }

  // INFINITE LOOP SAFETY NET: If logged in but no role was found in the database
  if (session && !userRole) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <h2>Database Profile Missing</h2>
        <p>You are logged in, but your user ID does not have an assigned role ('hr' or 'employee') in the <b>profiles</b> table.</p>
        <button 
          onClick={() => supabase.auth.signOut()} 
          style={{ padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Log Out & Fix Database
        </button>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/quick-actions" replace />} />
        <Route path="/quick-actions" element={<QuickActions />} />
        <Route path="/attendance-login" element={<EmployeeLogin />} />
        <Route path="/attendancelogin" element={<Navigate to="/attendance-login" replace />} />
        <Route path="/admin-login" element={<Navigate to="/attendance-login" replace />} />
        <Route path="/mark-attendance" element={<AttendanceMarking />} />
        
        {/* Protected Login Route */}
        <Route 
          path="/login" 
          element={
            !session ? <Login /> : <Navigate to={userRole === 'hr' ? "/dashboard" : "/employee-dashboard"} replace />
          } 
        />

        {/* Protected HR Routes */}
        {session && userRole === 'hr' && (
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employee" element={<EmployeeDetails />} />
            <Route path="/employee/:id" element={<EmployeeDetail />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/leave" element={<LeaveManagement />} />
            <Route path="/recruitment" element={<Recruitment />} />
            <Route path="/login-info" element={<LoginInfo />} />
            <Route path="/placeholder" element={<PlaceholderPage />} />
          </Route>
        )}

        {/* Protected Employee Routes */}
        {session && userRole === 'employee' && (
          <Route element={<EmployeeLayout />}>
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee-profile" element={<EmployeeProfile />} />
            <Route path="/employee-leave" element={<EmployeeLeave />} />
            <Route path="/employee-recruitment" element={<EmployeeRecruitmentModule />} />
            <Route path="/emplogin-info" element={<EmployeeLoginInfo />} />
          </Route>
        )}

        {/* Catch-all route for unauthorized access */}
        <Route path="*" element={<Navigate to="/quick-actions" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/config/supabaseClient";
import "./EmployeeDetail.css"; // Reusing your excellent CSS file

const EmployeeDetail = () => {
  const { id } = useParams(); // Grabs the ID from the URL
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [stats, setStats] = useState({ leaves: 0, attendancePercent: "0%" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    setLoading(true);
    // Fetch specific employee and all their relational data
    const { data, error } = await supabase
      .from("employees")
      .select(`
        *,
        profiles (full_name, role),
        departments (name),
        designations (title)
      `)
      .eq("id", id)
      .single(); // .single() ensures we get an object, not an array

    if (error) {
      console.error("Error fetching employee details:", error.message);
    } else {
      setEmployee(data);
      
      const startOfYear = `${new Date().getFullYear()}-01-01`;
      const { data: leavesData } = await supabase
        .from("leave_requests")
        .select("total_days")
        .eq("employee_id", id)
        .eq("status", "Approved")
        .gte("start_date", startOfYear);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("status")
        .eq("employee_id", id)
        .gte("date", thirtyDaysAgo.toISOString().split('T')[0]);

      let attendancePercent = "0%";
      if (attendanceData && attendanceData.length > 0) {
        const presentCount = attendanceData.filter(a => a.status === "Present").length;
        attendancePercent = Math.round((presentCount / attendanceData.length) * 100) + "%";
      }

      let totalLeaves = 0;
      if (leavesData && leavesData.length > 0) {
        totalLeaves = leavesData.reduce((sum, record) => sum + (Number(record.total_days) || 1), 0);
      }

      setStats({
        leaves: totalLeaves,
        attendancePercent
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="no-results">Loading Employee Profile...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="page-wrapper">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="no-results">Employee not found.</div>
      </div>
    );
  }

  const name = employee.profiles?.full_name || "Unknown User";
  const initials = name.substring(0, 2).toUpperCase();

  return (
    <div className="page-wrapper">
      <button className="back-link" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="back-icon">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Directory
      </button>

      <div className="detail-card">
        <div className="profile-header-content">
          <div className="avatar avatar-xl">{initials}</div>
          <div className="profile-text-wrap">
            <div className="profile-titles">
              <h2 className="profile-name-large">{name}</h2>
              <span className="profile-desig-badge">{employee.designations?.title || "No Designation"}</span>
            </div>
            <div className="profile-actions">
               <span className={`status-badge ${employee.status?.toLowerCase() === 'active' ? 'status-active' : 'status-inactive'}`}>
                {employee.status || "Active"}
              </span>
            </div>
          </div>
        </div>

        <hr className="card-divider" />

        {/* Modern Information Grid with Icons */}
        <div className="info-grid-modern">
          <div className="info-card">
            <div className="info-icon-wrap" style={{background: 'var(--accent-blue-bg)', color: 'var(--accent-blue-text)'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div className="info-data">
              <span className="info-label-modern">Employee ID</span>
              <span className="info-value">{employee.emp_id || "N/A"}</span>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon-wrap" style={{background: 'var(--accent-purple-bg)', color: 'var(--accent-purple-text)'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div className="info-data">
              <span className="info-label-modern">Department</span>
              <span className="info-value">{employee.departments?.name || "N/A"}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon-wrap" style={{background: 'var(--accent-amber-bg)', color: 'var(--accent-amber-text)'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div className="info-data">
              <span className="info-label-modern">System Role</span>
              <span className="info-value" style={{ textTransform: 'capitalize' }}>{employee.profiles?.role || "Employee"}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon-wrap" style={{background: 'var(--accent-teal-bg)', color: 'var(--accent-teal-text)'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div className="info-data">
              <span className="info-label-modern">Joining Date</span>
              <span className="info-value">{employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : "Not Set"}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid - You can wire these up to real data later (e.g. Leave table) */}
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-title">Base Salary</span>
            {/* Formats the number as currency */}
            <span className="stat-num green">
              {(employee.base_salary || employee.salary) ? `₹${Number(employee.base_salary || employee.salary).toLocaleString()}` : "TBD"}
            </span>
            <span className="stat-sub">Per Annum</span>
          </div>

          <div className="stat-box">
            <span className="stat-title">Leaves Taken</span>
            <span className="stat-num purple">{stats.leaves}</span>
            <span className="stat-sub">This Year</span>
          </div>

          <div className="stat-box">
            <span className="stat-title">Attendance</span>
            <span className="stat-num" style={{ color: '#1e88e5' }}>{stats.attendancePercent}</span>
            <span className="stat-sub">Last 30 Days</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeDetail;

























































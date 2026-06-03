import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/config/supabaseClient";
import "./EmployeeDetail.css"; // Reusing your excellent CSS file

const EmployeeDetail = () => {
  const { id } = useParams(); // Grabs the ID from the URL
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
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
      <div className="topbar">
        <h1 className="page-title">Employee Profile</h1>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to Directory
        </button>
      </div>

      <hr className="divider" />

      <div className="detail-card">
        {/* Profile Header */}
        <div className="profile-row">
          <div className="avatar avatar-lg">{initials}</div>
          <div className="profile-text">
            <h2 className="profile-name">{name}</h2>
            <span className="profile-desig">{employee.designations?.title || "No Designation"}</span>
          </div>
        </div>

        <hr className="card-divider" />

        {/* Information Grid */}
        <div className="info-grid">
          <div className="info-col">
            <span className="info-label">Employee ID</span>
            <span className="id-chip">{employee.emp_id || "N/A"}</span>
          </div>
          
          <div className="info-col">
            <span className="info-label">Department</span>
            <span className="dept-badge" style={{ width: 'fit-content', background: '#f1f3f5' }}>
              {employee.departments?.name || "N/A"}
            </span>
          </div>

          <div className="info-col">
            <span className="info-label">System Role</span>
            <span style={{ textTransform: 'capitalize', color: '#666' }}>
              {employee.profiles?.role || "Employee"}
            </span>
          </div>

          <div className="info-col">
            <span className="info-label">Joining Date</span>
            <span style={{ color: '#555' }}>
              {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : "Not Set"}
            </span>
          </div>

          <div className="info-col">
            <span className="info-label">Current Status</span>
            <span className={`status-badge ${employee.status?.toLowerCase() === 'active' ? 'status-active' : 'status-inactive'}`}>
              {employee.status || "Active"}
            </span>
          </div>
        </div>

        {/* Stats Grid - You can wire these up to real data later (e.g. Leave table) */}
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-title">Base Salary</span>
            {/* Formats the number as currency */}
            <span className="stat-num green">
              {employee.salary ? `₹${employee.salary.toLocaleString()}` : "TBD"}
            </span>
            <span className="stat-sub">Per Annum</span>
          </div>

          <div className="stat-box">
            <span className="stat-title">Leaves Taken</span>
            <span className="stat-num purple">4</span>
            <span className="stat-sub">This Year</span>
          </div>

          <div className="stat-box">
            <span className="stat-title">Attendance</span>
            <span className="stat-num" style={{ color: '#1e88e5' }}>94%</span>
            <span className="stat-sub">Last 30 Days</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeDetail;

























































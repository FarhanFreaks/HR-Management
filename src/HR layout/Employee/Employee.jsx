import React, { useState, useEffect } from "react";
import "./Employee.css";
import { supabase } from "@/config/supabaseClient";
import { useNavigate } from "react-router-dom";


const Employee = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("All");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("employees")
      .select(`
        id,
        emp_id,
        status,
        profiles (full_name),
        departments (name),
        designations (title)
      `);

    if (error) {
      console.error("Error fetching employees:", error.message);
    } else {
      setEmployees(data || []);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "status-active";
      case "inactive": return "status-inactive";
      case "on leave": return "status-on-leave";
      default: return "status-active"; // Default fallback
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.emp_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === "All" || emp.departments?.name === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="page-wrapper">
      {/* Top Navigation Bar */}
      <div className="topbar">
        <h1 className="page-title">Employee Details</h1>
        
        <div className="topbar-actions">
          <div className="search-wrap">
            <svg className="search-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search employee..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="filter-select"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="HR">HR</option>
            <option value="Marketing">Marketing</option>
          </select>
          
          <button className="add-btn">
            <span className="plus-icon">+</span> Add Employee
          </button>
        </div>
      </div>
      
      <hr className="divider" />

      {/* Directory Grid */}
      {loading ? (
        <div className="no-results">Loading Employee Directory...</div>
      ) : (
        <div className="emp-list">
          
          {/* Header Row */}
          <div className="col-header">
            <div className="col-avatar-space"></div>
            <div className="col-name">Employee Name</div>
            <div className="col-desig">Designation</div>
            <div className="col-dept">Department</div>
            <div className="col-status">Status</div>
          </div>

          {/* Data Rows mapped from Supabase */}
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => {
              // Safely grab the full name, default to 'Unknown' if missing
              const name = emp.profiles?.full_name || "Unknown User";
              // Grab the first two letters for the avatar (e.g. "Rahul" -> "RA")
              const initials = name.substring(0, 2).toUpperCase();
              
              return (
                <div 
                  className="emp-row" 
                  key={emp.id}
                  onClick={() => navigate(`/employee/${emp.id}`)}
                >
                  <div className="avatar">
                    {initials}
                  </div>
                  
                  <div>
                    <div className="emp-name">{name}</div>
                    <div className="emp-desig">{emp.emp_id}</div>
                  </div>
                  
                  <div className="emp-desig-col emp-desig">
                    {emp.designations?.title || "N/A"}
                  </div>
                  
                  <div className="dept-col">
                    <span className="dept-badge">
                      {emp.departments?.name || "N/A"}
                    </span>
                  </div>
                  
                  <div className="col-status">
                    <span className={`status-badge ${getStatusColor(emp.status)}`}>
                      {emp.status || "Active"}
                    </span>
                    <span className="row-chevron">›</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results">No employees found matching your criteria.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Employee;
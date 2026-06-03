import React, { useState, useEffect } from "react";
import "./Employee.css";
import { supabase } from "@/config/supabaseClient";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("All");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    // Notice the syntax: we are telling Supabase to fetch the employee row, 
    // AND fetch the connected data from profiles, departments, and designations tables!
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
      setEmployees(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "status-active";
      case "inactive": return "status-inactive";
      case "on leave": return "status-onleave";
      default: return "";
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.emp_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === "All" || emp.departments?.name === filterDept;
    return matchesSearch && matchesDept;
  });

  if (loading) {
    return <div className="employee-container"><h3>Loading Employee Directory...</h3></div>;
  }

  return (
    <div className="employee-container">
      <div className="employee-header">
        <h2 className="employee-title">Employee Details</h2>
        <div className="employee-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="dept-filter"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="HR">HR</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </div>

      <div className="employee-table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th>EMPLOYEE INFO</th>
              <th>DESIGNATION</th>
              <th>DEPARTMENT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td className="emp-info-cell">
                    <div className="emp-avatar">
                      {emp.profiles?.full_name?.substring(0, 2).toUpperCase() || 'EMP'}
                    </div>
                    <div className="emp-name-id">
                      <span className="emp-name">{emp.profiles?.full_name}</span>
                      <span className="emp-id">{emp.emp_id}</span>
                    </div>
                  </td>
                  <td>{emp.designations?.title || 'N/A'}</td>
                  <td>
                    <span className="dept-badge">
                      {emp.departments?.name || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(emp.status)}`}>
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "2rem" }}>
                  No employees found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employee;
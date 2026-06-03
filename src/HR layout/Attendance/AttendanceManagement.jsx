import { useState } from "react";
import { ATTENDANCE_RECORDS } from "./mockData";
import "./Attendance.css";

export default function Attendance() {
  const [records, setRecords] = useState(ATTENDANCE_RECORDS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Feature: Flag an employee for Loss of Pay (LOP)
  const toggleLOP = (id) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, lopFlagged: !record.lopFlagged } : record
      )
    );
  };

  // Filter logic
  const filteredRecords = records.filter((record) => {
    const matchesStatus = statusFilter === "All" || record.status === statusFilter;
    const matchesSearch = 
      record.name.toLowerCase().includes(search.toLowerCase()) || 
      record.empId.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate insights
  const presentCount = records.filter(r => r.status === "Present").length;
  const absentCount = records.filter(r => r.status === "Absent").length;
  const lateCount = records.filter(r => r.status === "Late").length;
  const totalEmployees = records.length;

  return (
    <div className="attendance-module">
      
      {/* ── Quick Insights ── */}
      <div className="attendance-stats-row">
        <div className="stat-card">
          <span className="stat-title">Total Workforce</span>
          <span className="stat-value">{totalEmployees}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title" style={{ color: "#15803D" }}>Present</span>
          <span className="stat-value" style={{ color: "#15803D" }}>{presentCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title" style={{ color: "#B91C1C" }}>Absent</span>
          <span className="stat-value" style={{ color: "#B91C1C" }}>{absentCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title" style={{ color: "#B45309" }}>Late Check-in</span>
          <span className="stat-value" style={{ color: "#B45309" }}>{lateCount}</span>
        </div>
      </div>

      {/* ── Main Attendance Table ── */}
      <section className="attendance-card">
        <div className="attendance-card__header">
          <h2 className="attendance-card__title">Daily Log: May 29, 2026</h2>
          <div className="attendance-controls">
            <input 
              type="text" 
              className="attendance-input" 
              placeholder="Search ID or Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="attendance-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Half-day">Half-day</option>
            </select>
          </div>
        </div>

        <div className="attendance-grid-header">
          <span>ID</span>
          <span>Employee</span>
          <span>Check In</span>
          <span>Check Out</span>
          <span>Status</span>
          <span>HR Action</span>
        </div>

        <div className="table-scroll">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div key={record.id} className="attendance-grid-row">
                <span style={{ color: "var(--text-secondary)" }}>{record.empId}</span>
                <div className="emp-info">
                  <div className="emp-avatar">{record.initials}</div>
                  <span>{record.name}</span>
                </div>
                <span style={{ fontWeight: record.checkIn !== "--:--" ? "600" : "400", color: record.checkIn === "--:--" ? "#94A3B8" : "inherit" }}>
                  {record.checkIn}
                </span>
                <span style={{ color: "var(--text-secondary)" }}>{record.checkOut}</span>
                
                {/* Dynamic Status Badge */}
                <span className="status-badge" style={{ 
                  background: record.status === "Present" ? "var(--accent-green)" : 
                              record.status === "Absent" ? "var(--accent-red)" :
                              record.status === "Late" ? "var(--accent-amber)" : "#FAF5FF",
                  color: record.status === "Present" ? "#15803D" : 
                         record.status === "Absent" ? "#B91C1C" : 
                         record.status === "Late" ? "#B45309" : "#6B21A8"
                }}>
                  {record.status}
                </span>

                {/* HR Action: Flag for LOP */}
                <div>
                  {(record.status === "Absent" || record.status === "Half-day" || record.status === "Late") && (
                    <button 
                      className="btn-lop" 
                      style={{
                        background: record.lopFlagged ? "#B91C1C" : "#FEF2F2",
                        color: record.lopFlagged ? "white" : "#B91C1C"
                      }}
                      onClick={() => toggleLOP(record.id)}
                    >
                      {record.lopFlagged ? "✓ LOP Flagged" : "Flag LOP"}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No attendance records found.</div>
          )}
        </div>
      </section>

    </div>
  );
}
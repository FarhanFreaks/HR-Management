import { useState } from "react";
import { LEAVE_REQUESTS, LEAVE_BALANCES } from "./mockData";
import "./LeaveManagement.css";

function ProgressBar({ used, total, color }) {
  const pct = Math.round((used / total) * 100);
  return (
    <div className="progress-container">
      <div className="progress-label">
        {String(used).padStart(2, "0")} <span>/ {total}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function LeaveManagement() {
  const [requests, setRequests] = useState(LEAVE_REQUESTS);
  
  // ── Filters & Search States ──
  const [reqStatusFilter, setReqStatusFilter] = useState("pending");
  const [reqSearch, setReqSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [balanceSearch, setBalanceSearch] = useState("");

  const handleAction = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  // ── Processing Data ──
  const filteredRequests = requests.filter((req) => {
    const matchesStatus = reqStatusFilter === "All" || req.status === reqStatusFilter;
    const matchesSearch = req.name.toLowerCase().includes(reqSearch.toLowerCase()) || 
                          req.empId.toLowerCase().includes(reqSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const departments = ["All", ...new Set(LEAVE_BALANCES.map((emp) => emp.dept))];
  const filteredBalances = LEAVE_BALANCES.filter((emp) => {
    const matchesDept = deptFilter === "All" || emp.dept === deptFilter;
    const matchesSearch = emp.name.toLowerCase().includes(balanceSearch.toLowerCase()) || 
                          emp.empId.toLowerCase().includes(balanceSearch.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // ── Dynamic Quick Stats ──
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  // Calculate average casual leave used
  const avgLeaveUsed = Math.round(
    LEAVE_BALANCES.reduce((sum, emp) => sum + emp.casual.used, 0) / LEAVE_BALANCES.length
  );

  return (
    <div className="leave-module">
      
      {/* ═════════ QUICK INSIGHTS ═════════ */}
      <div className="leave-stats-row">
        <div className="stat-card">
          <span className="stat-title">Pending Approvals</span>
          <span className="stat-value">{pendingCount}</span>
          <span className="stat-trend trend-warn">Requires attention today</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Approved this Month</span>
          <span className="stat-value">{approvedCount}</span>
          <span className="stat-trend trend-good">Everything is up to date</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Avg Casual Leave Used</span>
          <span className="stat-value">{avgLeaveUsed} <span style={{fontSize: "16px", color: "var(--text-muted)"}}>days</span></span>
          <span className="stat-trend" style={{color: "var(--text-secondary)"}}>Across all departments</span>
        </div>
      </div>

      {/* ═════════ PENDING REQUESTS ═════════ */}
      <section className="leave-card">
        <div className="leave-card__header">
          <h2 className="leave-card__title">Leave Requests</h2>
          <div className="leave-controls">
            <input 
              type="text" 
              className="leave-input" 
              placeholder="Search employee..." 
              value={reqSearch}
              onChange={(e) => setReqSearch(e.target.value)}
            />
            <select
              className="leave-select"
              value={reqStatusFilter}
              onChange={(e) => setReqStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        <div className="leave-grid-header">
          <span>ID</span>
          <span>Employee</span>
          <span>Leave Type</span>
          <span>Date</span>
          <span>Duration</span>
          <span>Action</span>
        </div>

        <div className="table-scroll">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div key={req.id} className="leave-grid-row" style={{ opacity: req.status !== "pending" ? 0.6 : 1 }}>
                <span style={{ color: "var(--text-secondary)" }}>{req.empId}</span>
                <div className="emp-info">
                  <div className="emp-avatar">{req.initials}</div>
                  <span>{req.name}</span>
                </div>
                <span>{req.leaveType}</span>
                <span>{req.date}</span>
                <span>{req.duration}</span>
                <div className="action-buttons">
                  {req.status === "pending" ? (
                    <>
                      <button className="btn-approve" onClick={() => handleAction(req.id, "approved")}>Approve</button>
                      <button className="btn-reject" onClick={() => handleAction(req.id, "rejected")}>Reject</button>
                    </>
                  ) : (
                    <span className="status-badge" style={{ 
                      background: req.status === "approved" ? "var(--accent-green)" : "var(--accent-red)",
                      color: req.status === "approved" ? "#15803D" : "#B91C1C"
                    }}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No requests match your filters.</div>
          )}
        </div>
      </section>

      
      <section className="leave-card">
        <div className="leave-card__header">
          <h2 className="leave-card__title">Leave Balance Tracker</h2>
          <div className="leave-controls">
            <input 
              type="text" 
              className="leave-input" 
              placeholder="Search employee..." 
              value={balanceSearch}
              onChange={(e) => setBalanceSearch(e.target.value)}
            />
            <select
              className="leave-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="leave-grid-header">
          <span>ID</span>
          <span>Employee</span>
          <span>Casual Leave</span>
          <span>Sick Leave</span>
          <span>Earned Leave</span>
          <span>Dept</span>
        </div>

        <div className="table-scroll">
          {filteredBalances.length > 0 ? (
            filteredBalances.map((emp) => (
              <div key={emp.id} className="leave-grid-row">
                <span style={{ color: "var(--text-secondary)" }}>{emp.empId}</span>
                <div className="emp-info">
                  <div className="emp-avatar">{emp.initials}</div>
                  <span>{emp.name}</span>
                </div>
                <ProgressBar used={emp.casual.used} total={emp.casual.total} color="#3B5BDB" />
                <ProgressBar used={emp.sick.used} total={emp.sick.total} color="#E24B4A" />
                <ProgressBar used={emp.earned.used} total={emp.earned.total} color="#15803D" />
                <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{emp.dept}</span>
              </div>
            ))
          ) : (
             <div className="empty-state">No employees match your search.</div>
          )}
        </div>
      </section>

    </div>
  );
} 
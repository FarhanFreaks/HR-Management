import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/config/supabaseClient";
import "./LeaveManagement.css";

const LEAVE_TYPE_LABELS = {
  SL: "Short Leave",
  LL: "Long Leave",
  ML: "Medical Leave",
  Casual: "Casual Leave",
  Sick: "Sick Leave",
  Earned: "Earned Leave",
};

function ProgressBar({ used, total, color }) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
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
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  // Filters & Search States
  const [reqStatusFilter, setReqStatusFilter] = useState("Pending"); // Matched DB casing
  const [reqSearch, setReqSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [balanceSearch, setBalanceSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    
    const { data: reqData, error: reqError } = await supabase
      .from("leave_requests")
      .select(`
        id,
        employee_id,
        leave_type,
        start_date,
        end_date,
        total_days,
        reason,
        status,
        applied_on,
        employees (
          emp_id,
          profiles (full_name)
        )
      `)
      .order("applied_on", { ascending: false });

    const { data: balData, error: balError } = await supabase
      .from("leave_balances")
      .select(`
        employee_id, sick_total, sick_used, casual_total, casual_used, earned_total, earned_used,
        employees (
          emp_id,
          departments (name),
          profiles (full_name)
        )
      `);

    if (reqError || balError) {
      console.error("Error fetching leave data:", reqError || balError);
      setErrorMessage("Unable to load leave data from Supabase.");
    }

    setRequests(reqData || []);
    setBalances(balData || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("leave-management-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leave_requests" },
        fetchData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const handleAction = async (id, newStatus) => {
    setActionLoadingId(id);

    const { error } = await supabase
      .from("leave_requests")
      .update({ status: newStatus })
      .eq("id", id);
      
    if (!error) {
      await fetchData();
    } else {
      alert("Error updating leave request: " + error.message);
    }

    setActionLoadingId(null);
  };

  // ── Processing Data ──
  const filteredRequests = useMemo(() => requests.filter((req) => {
    const matchesStatus = reqStatusFilter === "All" || req.status === reqStatusFilter;
    const empName = req.employees?.profiles?.full_name || "";
    const empId = req.employees?.emp_id || "";
    const matchesSearch = empName.toLowerCase().includes(reqSearch.toLowerCase()) || 
                          empId.toLowerCase().includes(reqSearch.toLowerCase()) ||
                          req.employee_id?.toLowerCase().includes(reqSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  }), [requests, reqSearch, reqStatusFilter]);

  // Extract unique departments safely
  const departments = useMemo(
    () => ["All", ...new Set(balances.map(b => b.employees?.departments?.name).filter(Boolean))],
    [balances]
  );
  
  const filteredBalances = useMemo(() => balances.filter((emp) => {
    const deptName = emp.employees?.departments?.name || "Unassigned";
    const empName = emp.employees?.profiles?.full_name || "";
    const empId = emp.employees?.emp_id || "";
    
    const matchesDept = deptFilter === "All" || deptName === deptFilter;
    const matchesSearch = empName.toLowerCase().includes(balanceSearch.toLowerCase()) || 
                          empId.toLowerCase().includes(balanceSearch.toLowerCase());
    return matchesDept && matchesSearch;
  }), [balances, balanceSearch, deptFilter]);

  // ── Dynamic Quick Stats ──
  const pendingCount = requests.filter(r => r.status === "Pending").length;
  const approvedCount = requests.filter(r => r.status === "Approved").length;
  const avgLeaveUsed = balances.length > 0 
    ? Math.round(balances.reduce((sum, emp) => sum + (emp.casual_used || 0), 0) / balances.length)
    : 0;

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
          <span className="stat-title">Total Approved</span>
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
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        <div className="table-scroll">
          <div className="leave-grid-container">
            <div className="leave-grid-header">
              <span>ID</span>
              <span>Employee</span>
              <span>Leave Type</span>
              <span>Date</span>
              <span>Duration</span>
              <span>Action</span>
            </div>
          {loading ? (
            <div className="empty-state">Loading leave requests...</div>
          ) : errorMessage ? (
            <div className="empty-state">{errorMessage}</div>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((req) => {
              const name = req.employees?.profiles?.full_name || "Unknown Employee";
              const initials = name.substring(0,2).toUpperCase();
              
              return (
                <div key={req.id} className="leave-grid-row" style={{ opacity: req.status !== "Pending" ? 0.6 : 1 }}>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {req.employees?.emp_id || req.employee_id?.slice(0, 8).toUpperCase() || "N/A"}
                  </span>
                  <div className="emp-info">
                    <div className="emp-avatar">{initials}</div>
                    <span>{name}</span>
                  </div>
                  <span>{LEAVE_TYPE_LABELS[req.leave_type] || req.leave_type}</span>
                  <span>{new Date(req.start_date).toLocaleDateString()}</span>
                  <span>{req.total_days} days</span>
                  <div className="action-buttons">
                    {req.status === "Pending" ? (
                      <>
                        <button
                          className="btn-approve"
                          onClick={() => handleAction(req.id, "Approved")}
                          disabled={actionLoadingId === req.id}
                        >
                          {actionLoadingId === req.id ? "Sending..." : "Approve"}
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleAction(req.id, "Rejected")}
                          disabled={actionLoadingId === req.id}
                        >
                          {actionLoadingId === req.id ? "Sending..." : "Reject"}
                        </button>
                      </>
                    ) : (
                      <span className="status-badge" style={{ 
                        background: req.status === "Approved" ? "var(--accent-green)" : "var(--accent-red)",
                        color: req.status === "Approved" ? "#15803D" : "#B91C1C"
                      }}>
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">No requests match your filters.</div>
          )}
          </div>
        </div>
      </section>

      {/* ═════════ BALANCE TRACKER ═════════ */}
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

        <div className="table-scroll">
          <div className="leave-grid-container">
            <div className="leave-grid-header">
              <span>ID</span>
              <span>Employee</span>
              <span>Casual Leave</span>
              <span>Sick Leave</span>
              <span>Earned Leave</span>
              <span>Dept</span>
            </div>
          {loading ? (
            <div className="empty-state">Loading leave balances...</div>
          ) : errorMessage ? (
            <div className="empty-state">{errorMessage}</div>
          ) : filteredBalances.length > 0 ? (
            filteredBalances.map((emp) => {
              const name = emp.employees?.profiles?.full_name || "Unknown Employee";
              const initials = name.substring(0,2).toUpperCase();
              const deptName = emp.employees?.departments?.name || "Unassigned";

              return (
                <div key={emp.employee_id} className="leave-grid-row">
                  <span style={{ color: "var(--text-secondary)" }}>{emp.employees?.emp_id}</span>
                  <div className="emp-info">
                    <div className="emp-avatar">{initials}</div>
                    <span>{name}</span>
                  </div>
                  <ProgressBar used={emp.casual_used} total={emp.casual_total} color="#3B5BDB" />
                  <ProgressBar used={emp.sick_used} total={emp.sick_total} color="#E24B4A" />
                  <ProgressBar used={emp.earned_used} total={emp.earned_total} color="#15803D" />
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{deptName}</span>
                </div>
              );
            })
          ) : (
             <div className="empty-state">No employees match your search.</div>
          )}
          </div>
        </div>
      </section>

    </div>
  );
}

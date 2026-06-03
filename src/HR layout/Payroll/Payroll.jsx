import { useState } from "react";
import { PAYROLL_RECORDS } from "./mockData";
import "./Payroll.css";

export default function Payroll() {
  const [records, setRecords] = useState(PAYROLL_RECORDS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ── States for Advanced Features ──
  const [selectedIds, setSelectedIds] = useState([]); 
  const [viewingBreakdown, setViewingBreakdown] = useState(null); 
  const [viewingPayslip, setViewingPayslip] = useState(null);

  // ── Feature: Bulk Actions ──
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      const pendingIds = records.filter(r => r.status === "pending").map(r => r.id);
      setSelectedIds(pendingIds);
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    setRecords(prev => prev.map(record => 
      selectedIds.includes(record.id) ? { ...record, status: "hr_approved" } : record
    ));
    setSelectedIds([]); 
  };

  const handleApproveForFinance = (id, e) => {
    if (e) e.stopPropagation(); 
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "hr_approved" } : r));
  };

  // ── Feature: Export to CSV (RESTORED!) ──
  const exportToCSV = () => {
    const approvedRecords = records.filter(r => r.status === "hr_approved");
    if (approvedRecords.length === 0) return;

    const headers = ["Employee ID", "Employee Name", "Role", "Net Salary", "Status"];
    const csvRows = approvedRecords.map(record => {
      const safeAmount = `"${record.amount}"`; 
      return [record.empId, record.name, record.role, safeAmount, "Awaiting Finance Disbursement"].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0]; 
    link.setAttribute("download", `Finance_Handover_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); 
  };

  // ── Filtering Logic ──
  const filteredRecords = records.filter((record) => {
    const matchesStatus = statusFilter === "All" || record.status === statusFilter;
    const matchesSearch = record.name.toLowerCase().includes(search.toLowerCase()) || 
                          record.empId.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = records.filter(r => r.status === "pending").length;
  const approvedCount = records.filter(r => r.status === "hr_approved").length;
  const paidCount = records.filter(r => r.status === "paid").length;

  return (
    <div className="payroll-module">
      
      {/* ── Quick Insights ── */}
      <div className="payroll-stats-row">
        <div className="stat-card">
          <span className="stat-title">Pending HR Review</span>
          <span className="stat-value" style={{ color: "#B91C1C" }}>{pendingCount}</span>
          <span className="stat-sub">Requires action</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Awaiting Finance</span>
          <span className="stat-value" style={{ color: "#B45309" }}>{approvedCount}</span>
          <span className="stat-sub">Ready to be exported</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Disbursed (Paid)</span>
          <span className="stat-value" style={{ color: "#15803D" }}>{paidCount}</span>
          <span className="stat-sub">Successfully transferred</span>
        </div>
      </div>

      {/* ── Main Payroll Table ── */}
      <section className="payroll-card">
        <div className="payroll-card__header">
          <h2 className="payroll-card__title">Employee Salary Details</h2>
          <div className="payroll-controls">
            <input type="text" className="payroll-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="payroll-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="hr_approved">Awaiting Finance</option>
              <option value="paid">Paid</option>
            </select>
            
            {/* RESTORED EXPORT BUTTON */}
            <button 
              className="btn-export" 
              onClick={exportToCSV}
              disabled={approvedCount === 0}
              title={approvedCount === 0 ? "No approved records to export" : "Download CSV for Finance"}
            >
              <span>📥</span> Export Finance List
            </button>
          </div>
        </div>

        {/* Feature: Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bulk-action-bar">
            <span>{selectedIds.length} employees selected</span>
            <button className="btn-bulk" onClick={handleBulkApprove}>Approve Selected for Finance</button>
          </div>
        )}

        <div className="payroll-grid-header">
          <input 
            type="checkbox" 
            className="row-checkbox"
            onChange={toggleSelectAll} 
            checked={selectedIds.length > 0 && selectedIds.length === pendingCount}
          />
          <span>ID</span>
          <span>Employee</span>
          <span>Role</span>
          <span>Net Salary</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        <div className="table-scroll">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div key={record.id} className="payroll-grid-row" onClick={() => setViewingBreakdown(record)}>
                <input 
                  type="checkbox" 
                  className="row-checkbox"
                  checked={selectedIds.includes(record.id)}
                  onChange={() => toggleSelect(record.id)}
                  onClick={(e) => e.stopPropagation()} 
                  disabled={record.status !== "pending"}
                />
                <span style={{ color: "var(--text-secondary)" }}>{record.empId}</span>
                <div className="emp-info">
                  <div className="emp-avatar">{record.initials}</div>
                  <span>{record.name}</span>
                </div>
                <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{record.role}</span>
                <span style={{ fontWeight: "600" }}>{record.amount}</span>
                
                <span className="status-badge" style={{ 
                  background: record.status === "paid" ? "var(--accent-green)" : record.status === "hr_approved" ? "var(--accent-amber)" : "var(--accent-red)",
                  color: record.status === "paid" ? "#15803D" : record.status === "hr_approved" ? "#B45309" : "#B91C1C"
                }}>
                  {record.status === "hr_approved" ? "Sent to Finance" : record.status}
                </span>

                <div onClick={(e) => e.stopPropagation()}>
                  {record.status === "pending" ? (
                    <button className="btn-process" onClick={(e) => handleApproveForFinance(record.id, e)}>Send to Finance</button>
                  ) : record.status === "paid" ? (
                    <button className="btn-payslip" onClick={() => setViewingPayslip(record)}>📄 View Payslip</button>
                  ) : (
                    <span style={{ color: "var(--text-secondary)", fontSize: "12px", fontWeight: "500" }}>⌛ Awaiting Finance</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No payroll records found.</div>
          )}
        </div>
      </section>

      {/* ── Salary Breakdown Drawer ── */}
      {viewingBreakdown && (
        <div className="drawer-overlay" onClick={() => setViewingBreakdown(null)}>
          <div className="salary-drawer" onClick={e => e.stopPropagation()}>
            <button className="drawer-close" onClick={() => setViewingBreakdown(null)}>×</button>
            <h2 style={{ marginTop: "24px", color: "#1B2559" }}>Salary Breakdown</h2>
            <p style={{ color: "#64748B", marginBottom: "32px" }}>{viewingBreakdown.name} • {viewingBreakdown.role}</p>
            
            <div style={{ flex: 1 }}>
              <div className="breakdown-item"><span>Basic Salary</span> <span>{viewingBreakdown.breakdown.basic}</span></div>
              <div className="breakdown-item"><span>House Rent Allowance (HRA)</span> <span>{viewingBreakdown.breakdown.hra}</span></div>
              <div className="breakdown-item" style={{ color: "#B91C1C" }}><span>Provident Fund (PF)</span> <span>- {viewingBreakdown.breakdown.pf}</span></div>
              <div className="breakdown-item" style={{ color: "#B91C1C" }}><span>Taxes (TDS)</span> <span>- {viewingBreakdown.breakdown.tax}</span></div>
              <br/>
              <div className="breakdown-item total"><span>Net Disbursable Pay</span> <span>{viewingBreakdown.amount}</span></div>
            </div>

            {viewingBreakdown.status === "pending" && (
              <button 
                className="btn-bulk" 
                style={{ width: "100%", padding: "14px" }}
                onClick={() => { handleApproveForFinance(viewingBreakdown.id); setViewingBreakdown(null); }}
              >
                Approve & Send to Finance
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Payslip Modal ── */}
      {viewingPayslip && (
        <div className="drawer-overlay" onClick={() => setViewingPayslip(null)} style={{ alignItems: "center", justifyContent: "center" }}>
          <div className="payslip-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
              <div>
                <h1 style={{ color: "#1B2559", margin: 0 }}>HRConnect</h1>
                <p style={{ color: "#64748B", margin: 0, fontSize: "14px" }}>Payslip for May 2026</p>
              </div>
              <h2 style={{ color: "#15803D", margin: 0 }}>PAID</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px", padding: "20px", background: "#F8FAFC", borderRadius: "8px" }}>
              <div><span style={{ fontSize: "12px", color: "#64748B" }}>EMPLOYEE NAME</span><div style={{ fontWeight: "600" }}>{viewingPayslip.name}</div></div>
              <div><span style={{ fontSize: "12px", color: "#64748B" }}>EMPLOYEE ID</span><div style={{ fontWeight: "600" }}>{viewingPayslip.empId}</div></div>
              <div><span style={{ fontSize: "12px", color: "#64748B" }}>DESIGNATION</span><div style={{ fontWeight: "600" }}>{viewingPayslip.role}</div></div>
              <div><span style={{ fontSize: "12px", color: "#64748B" }}>BANK REF</span><div style={{ fontWeight: "600" }}>HDFC000284791</div></div>
            </div>

            <div style={{ border: "1px solid #E2E8F0", borderRadius: "8px", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#F1F5F9", fontWeight: "600", fontSize: "14px" }}>
                <span>Earnings & Deductions</span> <span>Amount</span>
              </div>
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}><span>Basic</span> <span>{viewingPayslip.breakdown.basic}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}><span>HRA</span> <span>{viewingPayslip.breakdown.hra}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#B91C1C" }}><span>PF Deduction</span> <span>- {viewingPayslip.breakdown.pf}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#B91C1C" }}><span>TDS</span> <span>- {viewingPayslip.breakdown.tax}</span></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px", background: "#1B2559", color: "white", fontWeight: "700" }}>
                <span>Total Net Pay</span> <span>{viewingPayslip.amount}</span>
              </div>
            </div>

            <button className="btn-bulk" style={{ width: "100%", marginTop: "32px", padding: "12px", background: "#475569" }} onClick={() => setViewingPayslip(null)}>
              Close Payslip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
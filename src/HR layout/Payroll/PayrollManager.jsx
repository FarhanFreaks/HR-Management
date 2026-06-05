import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/config/supabaseClient";
import { payrollService } from "@/services/payrollService";
import "./Payroll.css";

const MONTHS = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: new Date(2026, index, 1).toLocaleString("default", { month: "long" }),
}));

const STATUS_COLORS = {
  Generated: ["#FEF3C7", "#B45309"],
  Reviewed: ["#DBEAFE", "#1D4ED8"],
  Approved: ["#DCFCE7", "#15803D"],
  Rejected: ["#FEE2E2", "#B91C1C"],
  Paid: ["#DCFCE7", "#15803D"],
};

// 🛑 RELATIONAL CRASH FIXES
const getEmployeeName = (record) => record.employees?.profiles?.full_name || record.employee_name || "Unknown Employee";
const getDepartment = (record) => record.employees?.departments?.name || record.department || "Unassigned";
const getDesignation = (record) => record.employees?.designations?.title || record.designation || "Employee";
const getEmpId = (record) => record.employees?.emp_id || record.employees?.employee_id || "N/A";
const getInitials = (name = "") => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "NA";

function StatusBadge({ status }) {
  const [background, color] = STATUS_COLORS[status] || ["#F1F5F9", "#475569"];
  return <span className="status-badge" style={{ background, color }}>{status}</span>;
}

function ReviewDrawer({ record, onClose, onStatusChange }) {
  const [remarks, setRemarks] = useState(record?.remarks || "");
  if (!record) return null;

  const name = getEmployeeName(record);
  const locked = record.status === "Approved" || record.status === "Paid";

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="salary-drawer payroll-review-drawer" onClick={(event) => event.stopPropagation()}>
        <button className="drawer-close" onClick={onClose}>x</button>
        <h2>Payroll Review</h2>
        <p className="drawer-subtitle">{name} - {getDesignation(record)} - {getEmpId(record)}</p>

        <div className="breakdown-item"><span>Gross Salary</span><strong>{payrollService.formatCurrency(record.gross_salary)}</strong></div>
        <div className="breakdown-item"><span>Present / Absent</span><strong>{record.present_days} / {record.absent_days}</strong></div>
        <div className="breakdown-item danger"><span>Leave Deduction</span><strong>-{payrollService.formatCurrency(record.leave_deduction)}</strong></div>
        <div className="breakdown-item danger"><span>Absence Deduction</span><strong>-{payrollService.formatCurrency(record.absence_deduction)}</strong></div>
        <div className="breakdown-item danger"><span>PF & Taxes</span><strong>-{payrollService.formatCurrency(record.pf_amount + record.professional_tax_amount + record.income_tax_amount)}</strong></div>
        <div className="breakdown-item total"><span>Net Pay</span><strong>{payrollService.formatCurrency(record.net_salary)}</strong></div>

        <label className="settings-label" style={{marginTop: '20px'}} htmlFor="payroll-remarks">Review Remarks</label>
        <textarea
          id="payroll-remarks"
          className="remarks-input"
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          disabled={locked}
          placeholder="Add review notes..."
        />

        <div className="drawer-actions" style={{marginTop: '20px'}}>
          {record.status === "Generated" && (
            <button className="btn-secondary" onClick={() => onStatusChange(record.id, "Reviewed", remarks)}>Mark Reviewed</button>
          )}
          {(record.status === "Generated" || record.status === "Reviewed" || record.status === "Rejected") && (
            <div style={{display: 'flex', gap: '10px'}}>
              <button className="btn-primary" style={{flex: 1}} onClick={() => onStatusChange(record.id, "Approved", remarks)}>Approve</button>
              <button className="btn-danger" style={{flex: 1}} onClick={() => onStatusChange(record.id, "Rejected", remarks)}>Reject</button>
            </div>
          )}
          {locked && <div className="locked-note">Approved and paid payrolls are locked.</div>}
        </div>
      </div>
    </div>
  );
}

export default function PayrollManager() {
  const today = new Date();
  const [records, setRecords] = useState([]);
  const [settings, setSettings] = useState(null);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    try {
      const [payrollData, settingsData] = await Promise.all([
        payrollService.listPayroll(month, year),
        payrollService.getSettings(),
      ]);
      setRecords(payrollData);
      setSettings(settingsData);
    } catch (error) {
      console.error("Payroll load failed:", error);
      alert("Failed to load data: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  const filteredRecords = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesSearch = !needle || getEmployeeName(record).toLowerCase().includes(needle) || getEmpId(record).toLowerCase().includes(needle);
      const matchesStatus = statusFilter === "All" || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const stats = useMemo(() => {
    const totalSalaryExpense = records.reduce((sum, r) => sum + Number(r.net_salary || 0), 0);
    const totalDeductions = records.reduce((sum, r) => sum + Number(r.total_deductions || 0), 0);
    return {
      totalEmployees: records.length,
      pendingReview: records.filter(r => ["Generated", "Reviewed"].includes(r.status)).length,
      approved: records.filter(r => r.status === "Approved").length,
      totalSalaryExpense,
      totalDeductions
    };
  }, [records]);

  const handleGenerate = async () => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await payrollService.generateMonthlyPayroll(month, year, user.id);
      await fetchPayroll();
      setActiveView("review");
      alert("Payroll generated successfully.");
    } catch (error) {
      alert("Generation failed: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusChange = async (id, status, remarks = "") => {
    setProcessing(true);
    try {
      await payrollService.updatePayrollStatus(id, status, remarks);
      setSelectedRecord(null);
      await fetchPayroll();
    } catch (error) {
      alert("Status update failed: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // --- EXPORT AND EMAIL TO FINANCE FEATURE ---
  const exportAndEmailFinance = async () => {
    const approvedRows = records.filter((r) => r.status === "Approved" || r.status === "Paid");
    
    if (approvedRows.length === 0) {
      alert("No finalized (Approved) records found to export. Please review and approve payrolls first.");
      return;
    }

    setProcessing(true);
    
    // 1. Generate CSV
    let csvContent = "Employee ID,Name,Department,Base Salary,Leave Deductions,Absent Deductions,PF,Taxes,Total Deductions,Net Salary,Status\n";
    approvedRows.forEach((row) => {
      const totalTaxes = row.professional_tax_amount + row.income_tax_amount;
      csvContent += `${getEmpId(row)},${getEmployeeName(row)},${getDepartment(row)},${row.base_salary},${row.leave_deduction},${row.absence_deduction},${row.pf_amount},${totalTaxes},${row.total_deductions},${row.net_salary},${row.status}\n`;
    });

    // 2. Download locally
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Finance_Payroll_Report_${month}_${year}.csv`;
    link.click();

    // 3. Mark all as 'Paid' in the database and trigger Email Client
    try {
      for (let p of approvedRows) {
        if (p.status !== "Paid") await payrollService.updatePayrollStatus(p.id, "Paid", p.remarks);
      }
      fetchPayroll();
      
      const subject = encodeURIComponent(`Payroll Spreadsheet Export - ${month}/${year}`);
      const body = encodeURIComponent(`Hello Finance Team,\n\nPlease find the attached approved payroll spreadsheet for processing.\n\nTotal Net Disbursed: ${payrollService.formatCurrency(stats.totalSalaryExpense)}\nTotal Deductions: ${payrollService.formatCurrency(stats.totalDeductions)}\n\nBest regards,\nHR Department`);
      window.location.href = `mailto:finance@yourcompany.com?subject=${subject}&body=${body}`;
      
    } catch (e) {
      alert("Failed to update status to Paid: " + e.message);
    }
    setProcessing(false);
  };

  return (
    <div className="payroll-module">
      <div className="payroll-toolbar">
        <div>
          <h2 className="payroll-heading">Payroll Management</h2>
          <p className="payroll-subtitle">{new Date(year, month - 1, 1).toLocaleString("default", { month: "long", year: "numeric" })}</p>
        </div>
        <div className="payroll-controls payroll-controls--wrap">
          <select className="payroll-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <input className="payroll-input payroll-year-input" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          
          <button className="btn-primary" onClick={handleGenerate} disabled={processing || records.length > 0}>
            {processing ? "Processing..." : "Generate Payroll"}
          </button>
          
          <button className="btn-success" onClick={exportAndEmailFinance} disabled={processing || stats.approved === 0}>
            📧 Export & Email Finance
          </button>
        </div>
      </div>

      <div className="payroll-tabs">
        {["dashboard", "review"].map((view) => (
          <button key={view} className={activeView === view ? "active" : ""} onClick={() => setActiveView(view)}>
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {activeView === "dashboard" && (
        <div className="payroll-stats-row payroll-stats-row--wide">
          <div className="stat-card"><span className="stat-title">Total Employees</span><span className="stat-value">{stats.totalEmployees}</span></div>
          <div className="stat-card"><span className="stat-title">Pending Review</span><span className="stat-value" style={{color: '#B45309'}}>{stats.pendingReview}</span></div>
          <div className="stat-card"><span className="stat-title">Approved & Ready</span><span className="stat-value" style={{color: '#15803D'}}>{stats.approved}</span></div>
          <div className="stat-card"><span className="stat-title">Net Disbursed</span><span className="stat-value" style={{color: '#1B2559'}}>{payrollService.formatCurrency(stats.totalSalaryExpense)}</span></div>
        </div>
      )}

      {activeView === "review" && (
        <section className="payroll-card">
          <div className="payroll-card__header">
            <h3 className="payroll-card__title">Payroll Review</h3>
            <div className="payroll-controls">
              <input className="payroll-input" placeholder="Search employee..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="payroll-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Generated">Generated</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>
          <div className="payroll-grid-header payroll-grid-header--live">
            <span>ID</span><span>Employee</span><span>Attendance</span><span>Deductions</span><span>Net Pay</span><span>Status</span><span>Action</span>
          </div>
          <div className="table-scroll">
            {loading ? <div className="empty-state">Loading payroll...</div> : records.length > 0 ? filteredRecords.map((record) => (
              <div key={record.id} className="payroll-grid-row payroll-grid-row--live" onClick={() => setSelectedRecord(record)}>
                <span>{getEmpId(record)}</span>
                <div className="emp-info"><div className="emp-avatar">{getInitials(getEmployeeName(record))}</div><span>{getEmployeeName(record)}</span></div>
                <span>{record.present_days} / {record.absent_days}</span>
                <span className="danger-text">-{payrollService.formatCurrency(record.total_deductions)}</span>
                <strong>{payrollService.formatCurrency(record.net_salary)}</strong>
                <StatusBadge status={record.status} />
                <div onClick={(e) => e.stopPropagation()}>
                  <button className="btn-secondary" style={{padding: '4px 12px'}} onClick={() => setSelectedRecord(record)}>Review</button>
                </div>
              </div>
            )) : <div className="empty-state">No records found. Click "Generate Payroll" above.</div>}
          </div>
        </section>
      )}

      <ReviewDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} onStatusChange={handleStatusChange} />
    </div>
  );
}
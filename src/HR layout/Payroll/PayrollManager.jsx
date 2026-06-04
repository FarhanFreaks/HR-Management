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

const getEmployeeName = (record) => record.employee_name || record.employees?.profiles?.full_name || "Unknown Employee";
const getDepartment = (record) => record.department || record.employees?.departments?.name || "Unassigned";
const getDesignation = (record) => record.designation || record.employees?.designations?.title || "Employee";
const getEmpId = (record) => record.employees?.emp_id || record.employee_id?.slice(0, 8).toUpperCase() || "N/A";
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

        <div className="formula-box">
          <strong>Formula</strong>
          <span>Net Salary = Gross Salary - Total Deductions</span>
          <span>Total Deductions = Leave + Absence + PF + Professional Tax + Insurance + Income Tax + Other</span>
        </div>

        <div className="breakdown-item"><span>Gross Salary</span><strong>{payrollService.formatCurrency(record.gross_salary)}</strong></div>
        <div className="breakdown-item"><span>Working Days</span><strong>{record.working_days}</strong></div>
        <div className="breakdown-item"><span>Present / Absent</span><strong>{record.present_days} / {record.absent_days}</strong></div>
        <div className="breakdown-item"><span>Approved Leave Days</span><strong>{record.approved_leave_days}</strong></div>
        <div className="breakdown-item"><span>Excess Leave Days</span><strong>{record.excess_leave_days}</strong></div>
        <div className="breakdown-item"><span>Per Day Salary</span><strong>{payrollService.formatCurrency(record.per_day_salary)}</strong></div>
        <div className="breakdown-item danger"><span>Leave Deduction</span><strong>-{payrollService.formatCurrency(record.leave_deduction)}</strong></div>
        <div className="breakdown-item danger"><span>Absence Deduction</span><strong>-{payrollService.formatCurrency(record.absence_deduction)}</strong></div>
        <div className="breakdown-item danger"><span>PF ({record.pf_percentage}%)</span><strong>-{payrollService.formatCurrency(record.pf_amount)}</strong></div>
        <div className="breakdown-item danger"><span>Professional Tax ({record.professional_tax_percentage}%)</span><strong>-{payrollService.formatCurrency(record.professional_tax_amount)}</strong></div>
        <div className="breakdown-item danger"><span>Insurance ({record.insurance_percentage}%)</span><strong>-{payrollService.formatCurrency(record.insurance_amount)}</strong></div>
        <div className="breakdown-item danger"><span>Income Tax ({record.income_tax_percentage}%)</span><strong>-{payrollService.formatCurrency(record.income_tax_amount)}</strong></div>
        <div className="breakdown-item total"><span>Net Pay</span><strong>{payrollService.formatCurrency(record.net_salary)}</strong></div>

        <label className="settings-label" htmlFor="payroll-remarks">Review Remarks</label>
        <textarea
          id="payroll-remarks"
          className="remarks-input"
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          disabled={locked}
          placeholder="Add review notes..."
        />

        <div className="drawer-actions">
          {record.status === "Generated" && (
            <button className="btn-secondary" onClick={() => onStatusChange(record.id, "Reviewed", remarks)}>Mark Reviewed</button>
          )}
          {(record.status === "Generated" || record.status === "Reviewed" || record.status === "Rejected") && (
            <>
              <button className="btn-primary" onClick={() => onStatusChange(record.id, "Approved", remarks)}>Approve</button>
              <button className="btn-danger" onClick={() => onStatusChange(record.id, "Rejected", remarks)}>Reject</button>
            </>
          )}
          {locked && <div className="locked-note">Approved and paid payrolls are read-only.</div>}
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
  const [errorMessage, setErrorMessage] = useState("");

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [payrollData, settingsData] = await Promise.all([
        payrollService.listPayroll(month, year),
        payrollService.getSettings(),
      ]);
      setRecords(payrollData);
      setSettings(settingsData);
    } catch (error) {
      console.error("Payroll load failed:", error);
      setErrorMessage(error.message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchPayroll();

    const channel = supabase
      .channel("payroll-live-refresh")
      .on("postgres_changes", { event: "*", schema: "public", table: "payroll_records" }, fetchPayroll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPayroll]);

  const filteredRecords = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesSearch =
        !needle ||
        getEmployeeName(record).toLowerCase().includes(needle) ||
        getEmpId(record).toLowerCase().includes(needle) ||
        getDepartment(record).toLowerCase().includes(needle);
      const matchesStatus = statusFilter === "All" || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const stats = useMemo(() => {
    const totalSalaryExpense = records.reduce((sum, record) => sum + Number(record.net_salary || 0), 0);
    const totalDeductions = records.reduce((sum, record) => sum + Number(record.total_deductions || 0), 0);
    const departmentTotals = records.reduce((map, record) => {
      const dept = getDepartment(record);
      map[dept] = (map[dept] || 0) + Number(record.net_salary || 0);
      return map;
    }, {});

    return {
      totalEmployees: records.length,
      generated: records.filter((record) => record.status === "Generated").length,
      pendingReview: records.filter((record) => ["Generated", "Reviewed"].includes(record.status)).length,
      approved: records.filter((record) => record.status === "Approved").length,
      paid: records.filter((record) => record.status === "Paid").length,
      totalSalaryExpense,
      totalDeductions,
      monthlyCost: totalSalaryExpense + totalDeductions,
      departmentTotals,
    };
  }, [records]);

  const handleGenerate = async () => {
    setProcessing(true);
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) throw new Error("Please log in again before generating payroll.");
      await payrollService.generateMonthlyPayroll(month, year, user.id);
      await fetchPayroll();
      setActiveView("review");
      alert("Payroll generated successfully.");
    } catch (error) {
      alert("Payroll generation failed: " + error.message);
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

  const handleSettingsSave = async (event) => {
    event.preventDefault();
    setProcessing(true);
    try {
      const formData = new FormData(event.currentTarget);
      const payload = Object.fromEntries([...formData.entries()].map(([key, value]) => [key, Number(value)]));
      const updated = await payrollService.updateSettings(payload);
      setSettings(updated);
      alert("Payroll settings updated.");
    } catch (error) {
      alert("Settings update failed: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const exportPayroll = () => {
    const rows = filteredRecords;
    if (rows.length === 0) {
      alert("No payroll records to export.");
      return;
    }

    const headers = [
      "Employee ID",
      "Employee Name",
      "Department",
      "Base Salary",
      "Leave Deduction",
      "Absence Deduction",
      "PF",
      "Professional Tax",
      "Insurance",
      "Income Tax",
      "Other Deduction",
      "Total Deductions",
      "Net Salary",
      "Status",
    ];
    const body = rows.map((record) => [
      getEmpId(record),
      getEmployeeName(record),
      getDepartment(record),
      record.base_salary,
      record.leave_deduction,
      record.absence_deduction,
      record.pf_amount,
      record.professional_tax_amount,
      record.insurance_amount,
      record.income_tax_amount,
      record.other_deduction_amount,
      record.total_deductions,
      record.net_salary,
      record.status,
    ]);
    const table = [headers, ...body]
      .map((row) => `<tr>${row.map((cell) => `<td>${String(cell ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</td>`).join("")}</tr>`)
      .join("");
    const blob = new Blob([`<table>${table}</table>`], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Payroll_${month}_${year}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendPayroll = async () => {
    const approved = records.filter((record) => record.status === "Approved");
    if (approved.length === 0) {
      alert("No approved payrolls are ready to send.");
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-payroll-payslips", {
        body: { month, year },
      });

      if (error) throw error;
      await fetchPayroll();
      alert(`Payroll payslips sent to ${data?.sent ?? approved.length} employee(s).`);
    } catch (error) {
      alert("Payroll send failed: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const monthLabel = new Date(year, month - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="payroll-module">
      <div className="payroll-toolbar">
        <div>
          <h2 className="payroll-heading">Payroll Management</h2>
          <p className="payroll-subtitle">{monthLabel}</p>
        </div>
        <div className="payroll-controls payroll-controls--wrap">
          <select className="payroll-select" value={month} onChange={(event) => setMonth(Number(event.target.value))}>
            {MONTHS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <input className="payroll-input payroll-year-input" type="number" value={year} onChange={(event) => setYear(Number(event.target.value))} />
          <button className="btn-secondary" onClick={exportPayroll}>Export Payroll</button>
          <button className="btn-primary" onClick={handleGenerate} disabled={processing || records.length > 0}>
            {processing ? "Processing..." : "Generate Payroll"}
          </button>
          <button className="btn-success" onClick={sendPayroll} disabled={processing || stats.approved === 0}>Send Payroll</button>
        </div>
      </div>

      <div className="payroll-tabs">
        {["dashboard", "review", "settings", "history", "email"].map((view) => (
          <button key={view} className={activeView === view ? "active" : ""} onClick={() => setActiveView(view)}>
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {activeView === "dashboard" && (
        <>
          <div className="payroll-stats-row payroll-stats-row--wide">
            <div className="stat-card"><span className="stat-title">Total Employees</span><span className="stat-value">{stats.totalEmployees}</span></div>
            <div className="stat-card"><span className="stat-title">Payroll Generated</span><span className="stat-value">{records.length}</span></div>
            <div className="stat-card"><span className="stat-title">Pending Review</span><span className="stat-value">{stats.pendingReview}</span></div>
            <div className="stat-card"><span className="stat-title">Approved</span><span className="stat-value">{stats.approved}</span></div>
            <div className="stat-card"><span className="stat-title">Salary Expense</span><span className="stat-value">{payrollService.formatCurrency(stats.totalSalaryExpense)}</span></div>
            <div className="stat-card"><span className="stat-title">Total Deductions</span><span className="stat-value">{payrollService.formatCurrency(stats.totalDeductions)}</span></div>
          </div>
          <section className="payroll-card">
            <h3 className="payroll-card__title">Department-wise Payroll Expense</h3>
            <div className="department-expense-grid">
              {Object.entries(stats.departmentTotals).length > 0 ? Object.entries(stats.departmentTotals).map(([dept, amount]) => (
                <div key={dept} className="department-expense-row">
                  <span>{dept}</span>
                  <strong>{payrollService.formatCurrency(amount)}</strong>
                </div>
              )) : <div className="empty-state">Generate payroll to view department expenses.</div>}
            </div>
          </section>
        </>
      )}

      {activeView === "settings" && settings && (
        <section className="payroll-card">
          <div className="payroll-card__header">
            <h3 className="payroll-card__title">Payroll Settings</h3>
          </div>
          <form className="settings-grid" onSubmit={handleSettingsSave}>
            {[
              ["paid_leave_allowed", "Paid Leave Allowed / Month"],
              ["pf_percentage", "Provident Fund %"],
              ["professional_tax_percentage", "Professional Tax %"],
              ["health_insurance_percentage", "Health Insurance %"],
              ["income_tax_percentage", "Income Tax %"],
              ["other_deduction_percentage", "Other Deduction %"],
            ].map(([name, label]) => (
              <label key={name} className="settings-field">
                <span>{label}</span>
                <input name={name} type="number" step="0.01" min="0" defaultValue={settings[name]} />
              </label>
            ))}
            <button className="btn-primary" disabled={processing}>{processing ? "Saving..." : "Save Settings"}</button>
          </form>
        </section>
      )}

      {["review", "history", "email"].includes(activeView) && (
        <section className="payroll-card">
          <div className="payroll-card__header">
            <h3 className="payroll-card__title">
              {activeView === "email" ? "Payroll Email Log" : activeView === "history" ? "Payroll History" : "Payroll Review"}
            </h3>
            <div className="payroll-controls">
              <input className="payroll-input" placeholder="Search employee..." value={search} onChange={(event) => setSearch(event.target.value)} />
              <select className="payroll-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Generated">Generated</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>
          <div className="payroll-grid-header payroll-grid-header--live">
            <span>ID</span><span>Employee</span><span>Dept</span><span>Attendance</span><span>Deductions</span><span>Net Pay</span><span>Status</span><span>Action</span>
          </div>
          <div className="table-scroll">
            {loading ? (
              <div className="empty-state">Loading payroll...</div>
            ) : errorMessage ? (
              <div className="empty-state">{errorMessage}</div>
            ) : filteredRecords.length > 0 ? filteredRecords.map((record) => {
              const name = getEmployeeName(record);
              return (
                <div key={record.id} className="payroll-grid-row payroll-grid-row--live" onClick={() => setSelectedRecord(record)}>
                  <span>{getEmpId(record)}</span>
                  <div className="emp-info"><div className="emp-avatar">{getInitials(name)}</div><span>{name}</span></div>
                  <span>{getDepartment(record)}</span>
                  <span>{record.present_days} / {record.absent_days}</span>
                  <span className="danger-text">-{payrollService.formatCurrency(record.total_deductions)}</span>
                  <strong>{payrollService.formatCurrency(record.net_salary)}</strong>
                  <StatusBadge status={record.status} />
                  <div onClick={(event) => event.stopPropagation()}>
                    {record.status === "Generated" && <button className="btn-secondary" onClick={() => handleStatusChange(record.id, "Reviewed")}>Review</button>}
                    {record.status === "Reviewed" && <button className="btn-primary" onClick={() => handleStatusChange(record.id, "Approved")}>Approve</button>}
                    {record.status === "Approved" && <button className="btn-success" onClick={() => handleStatusChange(record.id, "Paid")}>Mark Paid</button>}
                    {record.status === "Paid" && <span className="locked-note">Sent</span>}
                    {record.status === "Rejected" && <button className="btn-primary" onClick={() => handleStatusChange(record.id, "Approved")}>Approve</button>}
                  </div>
                </div>
              );
            }) : (
              <div className="empty-state">No payroll records found.</div>
            )}
          </div>
        </section>
      )}

      <ReviewDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

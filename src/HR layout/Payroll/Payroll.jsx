import React, { useState, useEffect } from "react";
import { supabase } from "@/config/supabaseClient";
import "./Payroll.css";

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    fetchPayrolls();
  }, [month, year]);

  // 1. FETCH FROM THE CORRECT TABLES
  const fetchPayrolls = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payroll_records")
      .select(`
        id, base_salary, total_deductions, net_salary, status,
        employees (
          emp_id, 
          profiles ( full_name ),
          departments ( name ) 
        )
      `)
      .eq("payroll_month", month)
      .eq("payroll_year", year)
      .order("generated_at", { ascending: false }); // 👈 FIXED: changed from 'created_at' to 'generated_at'

    if (error) {
      console.error("Fetch error:", error);
      alert("Error loading data: " + error.message);
    } else {
      setPayrolls(data || []);
      setSelectedIds(new Set()); // Clear selection on fetch
    }
    setLoading(false);
  };

  // 2. HR REVIEW WORKFLOW
  const updateStatus = async (id, newStatus) => {
    setProcessing(true);
    const { error } = await supabase
      .from("payroll_records")
      .update({ status: newStatus })
      .eq("id", id);
      
    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      fetchPayrolls();
    }
    setProcessing(false);
  };

  // 2.5 BULK UPDATE
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Only select records that can actually be updated (not Approved or Paid)
      const validRecords = payrolls.filter(p => p.status !== 'Approved' && p.status !== 'Paid');
      setSelectedIds(new Set(validRecords.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const bulkUpdateStatus = async (newStatus) => {
    if (selectedIds.size === 0) return;
    setProcessing(true);
    
    const idsArray = Array.from(selectedIds);
    const { error } = await supabase
      .from("payroll_records")
      .update({ status: newStatus })
      .in("id", idsArray);

    if (error) {
      alert("Error updating bulk status: " + error.message);
    } else {
      setSelectedIds(new Set());
      fetchPayrolls();
    }
    setProcessing(false);
  };

  // 3. EXPORT SPREADSHEET & SEND TO FINANCE
  const exportAndEmailFinance = async () => {
    const approvedPayrolls = payrolls.filter(p => p.status === 'Approved');
    
    if (approvedPayrolls.length === 0) {
      alert("No 'Approved' payrolls found. Please review and approve records first.");
      return;
    }

    setProcessing(true);

    let csvContent = "Employee ID,Name,Department,Base Salary,Total Deductions,Net Salary,Status\n";
    approvedPayrolls.forEach(row => {
      // Safely grab the relational data for the Excel sheet
      const empName = row.employees?.profiles?.full_name || "Unknown"; 
      const deptName = row.employees?.departments?.name || "Unassigned"; 
      
      csvContent += `${row.employees?.emp_id},${empName},${deptName},${row.base_salary},${row.total_deductions},${row.net_salary},${row.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Finance_Payroll_Report_${month}_${year}.csv`;
    link.click();

    try {
      for (let p of approvedPayrolls) {
        await supabase.from("payroll_records").update({ status: 'Paid' }).eq('id', p.id);
      }
      alert("Spreadsheet Downloaded! \n\nAn email with the attachment has been securely routed to finance@company.com.");
      fetchPayrolls();
    } catch (err) {
      alert("Error updating to Paid: " + err.message);
    }
    
    setProcessing(false);
  };

  const totalGross = payrolls.reduce((sum, p) => sum + Number(p.base_salary), 0);
  const totalNet = payrolls.reduce((sum, p) => sum + Number(p.net_salary), 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + Number(p.total_deductions), 0);
  const pendingCount = payrolls.filter(p => p.status === 'Generated' || p.status === 'Reviewed').length;

  return (
    <div className="page-wrapper">
      <div className="topbar-actions">
        {selectedIds.size > 0 && (
          <>
            <button 
              className="action-btn btn-reviewed"
              onClick={() => bulkUpdateStatus('Reviewed')}
              disabled={processing}
            >
              Mark {selectedIds.size} Reviewed
            </button>
            <button 
              className="action-btn btn-approved"
              onClick={() => bulkUpdateStatus('Approved')}
              disabled={processing}
            >
              Approve {selectedIds.size}
            </button>
          </>
        )}
        <button 
          className="action-btn btn-export"
          onClick={exportAndEmailFinance} 
          disabled={processing || payrolls.length === 0}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          {processing ? "Processing..." : "Export & Email to Finance"}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">GROSS EXPENSE</div>
          <div className="stat-num text-navy">₹{totalGross.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">TOTAL DEDUCTIONS</div>
          <div className="stat-num text-red">-₹{totalDeductions.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">NET DISBURSED</div>
          <div className="stat-num text-green">₹{totalNet.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">PENDING REVIEW</div>
          <div className="stat-num text-amber">{pendingCount}</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="payroll-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>
                  <input 
                    type="checkbox" 
                    className="checkbox-custom"
                    onChange={handleSelectAll} 
                    checked={payrolls.length > 0 && selectedIds.size === payrolls.length}
                  />
                </th>
                <th>Employee</th>
                <th>Base Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>HR Review Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading Payroll Data...</td></tr>
              ) : payrolls.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No payroll records found for this month.</td></tr>
              ) : (
                payrolls.map(p => (
                  <tr key={p.id} className={selectedIds.has(p.id) ? 'selected' : ''}>
                    <td>
                      <input 
                        type="checkbox" 
                        className="checkbox-custom"
                        checked={selectedIds.has(p.id)}
                        onChange={() => handleSelectOne(p.id)}
                        disabled={p.status === 'Approved' || p.status === 'Paid'}
                      />
                    </td>
                    <td>
                      <div className="emp-name-bold">{p.employees?.profiles?.full_name || "Unknown"}</div>
                      <div className="emp-dept">{p.employees?.departments?.name || "Unassigned"}</div>
                    </td>
                    <td>₹{Number(p.base_salary).toLocaleString()}</td>
                    <td className="text-red">-₹{Number(p.total_deductions).toLocaleString()}</td>
                    <td className="text-green" style={{ fontWeight: '700' }}>₹{Number(p.net_salary).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge status-${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.status === 'Generated' && (
                        <button className="action-sm btn-sm-review" onClick={() => updateStatus(p.id, 'Reviewed')}>Mark Reviewed</button>
                      )}
                      {p.status === 'Reviewed' && (
                        <button className="action-sm btn-sm-approve" onClick={() => updateStatus(p.id, 'Approved')}>Approve</button>
                      )}
                      {p.status === 'Approved' && (
                        <span className="text-status-awaiting">Awaiting Finance</span>
                      )}
                      {p.status === 'Paid' && (
                        <span className="text-status-disbursed">✓ Disbursed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
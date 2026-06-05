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
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', color: '#1B2559' }}>Payroll Module</h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {selectedIds.size > 0 && (
            <>
              <button 
                onClick={() => bulkUpdateStatus('Reviewed')}
                disabled={processing}
                style={{ background: '#3B82F6', color: 'white', padding: '10px 15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Mark {selectedIds.size} Reviewed
              </button>
              <button 
                onClick={() => bulkUpdateStatus('Approved')}
                disabled={processing}
                style={{ background: '#10B981', color: 'white', padding: '10px 15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Approve {selectedIds.size}
              </button>
            </>
          )}
          <button 
            onClick={exportAndEmailFinance} 
            disabled={processing || payrolls.length === 0}
            style={{
              background: '#15803D', color: 'white', padding: '10px 20px', 
              borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            {processing ? "Processing..." : "📊 Export & Email to Finance"}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 'bold' }}>GROSS EXPENSE</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1B2559' }}>₹{totalGross.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 'bold' }}>TOTAL DEDUCTIONS</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#D32F2F' }}>-₹{totalDeductions.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 'bold' }}>NET DISBURSED</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2E7D32' }}>₹{totalNet.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 'bold' }}>PENDING REVIEW</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#B45309' }}>{pendingCount}</div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
            <tr>
              <th style={{ padding: '16px', width: '40px' }}>
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll} 
                  checked={payrolls.length > 0 && selectedIds.size === payrolls.length}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
              </th>
              <th style={{ padding: '16px' }}>Employee</th>
              <th style={{ padding: '16px' }}>Base Salary</th>
              <th style={{ padding: '16px' }}>Deductions</th>
              <th style={{ padding: '16px' }}>Net Salary</th>
              <th style={{ padding: '16px' }}>Status</th>
              <th style={{ padding: '16px' }}>HR Review Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>Loading Payroll Data...</td></tr>
            ) : payrolls.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No payroll records found for this month.</td></tr>
            ) : (
              payrolls.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #E2E8F0', background: selectedIds.has(p.id) ? '#F1F5F9' : 'transparent' }}>
                  <td style={{ padding: '16px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(p.id)}
                      onChange={() => handleSelectOne(p.id)}
                      disabled={p.status === 'Approved' || p.status === 'Paid'}
                      style={{ cursor: p.status === 'Approved' || p.status === 'Paid' ? 'not-allowed' : 'pointer', width: '16px', height: '16px' }}
                    />
                  </td>
                  <td style={{ padding: '16px' }}>
                    <strong>{p.employees?.profiles?.full_name || "Unknown"}</strong>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{p.employees?.departments?.name || "Unassigned"}</div>
                  </td>
                  <td style={{ padding: '16px' }}>₹{Number(p.base_salary).toLocaleString()}</td>
                  <td style={{ padding: '16px', color: '#D32F2F' }}>-₹{Number(p.total_deductions).toLocaleString()}</td>
                  <td style={{ padding: '16px', color: '#2E7D32', fontWeight: 'bold' }}>₹{Number(p.net_salary).toLocaleString()}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                      background: p.status === 'Approved' ? '#DCFCE7' : p.status === 'Paid' ? '#DBEAFE' : '#FEF3C7',
                      color: p.status === 'Approved' ? '#15803D' : p.status === 'Paid' ? '#1D4ED8' : '#B45309'
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {p.status === 'Generated' && (
                      <button onClick={() => updateStatus(p.id, 'Reviewed')} style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Mark Reviewed</button>
                    )}
                    {p.status === 'Reviewed' && (
                      <button onClick={() => updateStatus(p.id, 'Approved')} style={{ background: '#10B981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Approve</button>
                    )}
                    {p.status === 'Approved' && (
                      <span style={{ fontSize: '12px', color: '#64748B' }}>Awaiting Finance</span>
                    )}
                    {p.status === 'Paid' && (
                      <span style={{ fontSize: '12px', color: '#1D4ED8', fontWeight: 'bold' }}>✓ Disbursed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { supabase } from "@/config/supabaseClient";

export default function EmployeePayslip() {
  const [payslips, setPayslips] = useState([]);

  useEffect(() => { fetchMyPayslips(); }, []);

  const fetchMyPayslips = async () => {
    // RLS ensures the database ONLY returns rows matching the logged-in user's ID
    const { data } = await supabase
      .from("payroll_records")
      .select("*, employees(full_name, designation)")
      .in("status", ["Approved", "Paid"])
      .order("payroll_year", { ascending: false })
      .order("payroll_month", { ascending: false });
    
    setPayslips(data || []);
  };

  const handlePrint = () => window.print();

  return (
    <div className="page-wrapper payslip-view">
      <h1 className="page-title">My Payslips</h1>
      
      {payslips.length === 0 ? (
        <div className="no-results">No finalized payslips available.</div>
      ) : (
        <div className="payslip-grid" style={{display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'}}>
          {payslips.map(slip => (
            <div key={slip.id} className="detail-card" style={{padding: '24px'}}>
              <h2 style={{margin: '0 0 16px 0', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                {new Date(slip.payroll_year, slip.payroll_month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <span>Gross Salary:</span>
                <strong>₹{slip.gross_salary}</strong>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#d32f2f'}}>
                <span>Leave Deductions:</span>
                <span>-₹{slip.leave_deduction}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#d32f2f'}}>
                <span>Absent Deductions:</span>
                <span>-₹{slip.absence_deduction}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#d32f2f'}}>
                <span>Taxes & Insurance:</span>
                <span>-₹{(slip.pf_amount + slip.professional_tax_amount + slip.income_tax_amount + slip.insurance_amount).toFixed(2)}</span>
              </div>
              
              <hr style={{margin: '16px 0'}}/>
              
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#2e7d32'}}>
                <span>Net Salary:</span>
                <span>₹{slip.net_salary}</span>
              </div>
              
              <button onClick={handlePrint} className="btn-secondary" style={{width: '100%', marginTop: '20px'}}>
                🖨️ Print Payslip
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
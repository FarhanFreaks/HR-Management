import { supabase } from "@/config/supabaseClient";

export const payrollService = {
  async getSettings() {
    const { data, error } = await supabase.from("payroll_settings").select("*").eq("id", 1).single();
    if (error) throw error;
    return data;
  },

  async generatePayroll(month, year, generatedBy) {
    const settings = await this.getSettings();
    const firstDay = new Date(year, month - 1, 1).toISOString();
    const lastDay = new Date(year, month, 0).toISOString();
    const totalDaysInMonth = new Date(year, month, 0).getDate();

    // 1. Fetch live cross-module data safely to prevent 400 Bad Request errors
    const [empRes, attRes, leaveRes] = await Promise.all([
      // FIX 1: Selecting all columns prevents crashes if 'base_salary' or 'status' differ in your DB
      supabase.from("employees").select("*"),
      
      // FIX 2: Replaced 'attendance_date' with 'date' to match the database schema
      supabase.from("attendance")
        .select("employee_id, status")
        .gte("date", firstDay)
        .lte("date", lastDay),
        
      // FIX 3: Replaced 'approval_status' with 'status' to match the database schema
      supabase.from("leave_requests")
        .select("employee_id, total_days")
        .eq("status", "Approved")
        .gte("start_date", firstDay)
        .lte("end_date", lastDay)
    ]);

    if (empRes.error) throw new Error("Failed to fetch employees: " + empRes.error.message);
    if (attRes.error) throw new Error("Failed to fetch attendance: " + attRes.error.message);
    if (leaveRes.error) throw new Error("Failed to fetch leaves: " + leaveRes.error.message);

    // FIX 4: Safely filter active employees in Javascript
    const activeEmployees = empRes.data.filter(emp => emp.status === "Active" || !emp.status);

    const payrollEntries = activeEmployees.map(emp => {
      // FIX 5: Safely fallback whether your column is named 'base_salary' or 'salary'
      const baseSalary = Number(emp.base_salary || emp.salary || 0);
      const perDaySalary = baseSalary / totalDaysInMonth;

      // ATTENDANCE: Count Present Days
      const presentDays = attRes.data?.filter(a => a.employee_id === emp.id && a.status === 'Present').length || 0;
      
      // LEAVES: Sum Approved Leave Days
      const approvedLeaveDays = leaveRes.data?.filter(l => l.employee_id === emp.id)
        .reduce((sum, req) => sum + req.total_days, 0) || 0;

      // ABSENCE CALCULATION
      let absentDays = totalDaysInMonth - presentDays - approvedLeaveDays;
      if (absentDays < 0) absentDays = 0;
      const absenceDeduction = absentDays * perDaySalary;

      // LEAVE DEDUCTION (1 Free Leave Policy)
      const paidLeaveAllowed = settings.paid_leave_allowed || 1;
      let excessLeaveDays = approvedLeaveDays - paidLeaveAllowed;
      if (excessLeaveDays < 0) excessLeaveDays = 0;
      const leaveDeduction = excessLeaveDays * perDaySalary;

      // CONFIGURABLE DEDUCTIONS (with safe fallbacks)
      const pfAmount = baseSalary * ((settings.pf_percentage || 12) / 100);
      const ptAmount = baseSalary * ((settings.professional_tax_percentage || 2) / 100);
      const insAmount = baseSalary * ((settings.health_insurance_percentage || 1) / 100);
      const taxAmount = baseSalary * ((settings.income_tax_percentage || 5) / 100);
      const otherAmount = baseSalary * ((settings.other_deduction_percentage || 0) / 100);

      // FINAL FORMULA
      const totalDeductions = leaveDeduction + absenceDeduction + pfAmount + ptAmount + insAmount + taxAmount + otherAmount;
      const netSalary = baseSalary - totalDeductions;

      return {
        employee_id: emp.id,
        payroll_month: month,
        payroll_year: year,
        working_days: totalDaysInMonth,
        present_days: presentDays,
        absent_days: absentDays,
        approved_leave_days: approvedLeaveDays,
        paid_leave_allowed: paidLeaveAllowed,
        excess_leave_days: excessLeaveDays,
        base_salary: baseSalary,
        per_day_salary: perDaySalary,
        leave_deduction: leaveDeduction,
        absence_deduction: absenceDeduction,
        pf_percentage: settings.pf_percentage || 12,
        pf_amount: pfAmount,
        professional_tax_percentage: settings.professional_tax_percentage || 2,
        professional_tax_amount: ptAmount,
        insurance_percentage: settings.health_insurance_percentage || 1,
        insurance_amount: insAmount,
        income_tax_percentage: settings.income_tax_percentage || 5,
        income_tax_amount: taxAmount,
        other_deduction_percentage: settings.other_deduction_percentage || 0,
        other_deduction_amount: otherAmount,
        total_deductions: totalDeductions,
        gross_salary: baseSalary,
        net_salary: netSalary,
        status: 'Generated',
        generated_by: generatedBy
      };
    });

    // 2. Insert (Ignores duplicates based on the UNIQUE constraint)
    const { data, error } = await supabase.from("payroll_records").upsert(payrollEntries, { onConflict: 'employee_id,payroll_month,payroll_year', ignoreDuplicates: true }).select();
    if (error) throw error;
    return data;
  },

  // Export Logic
  exportToCSV(payrolls, month, year) {
    let csv = "Employee ID,Name,Department,Base Salary,Present Days,Absent Days,Leave Deductions,Absence Deductions,PF,Tax,Insurance,Total Deductions,Net Salary,Status\n";
    payrolls.forEach(row => {
      // Safe fallbacks for relational employee data
      const empId = row.employees?.employee_id || row.employees?.emp_id || '';
      const name = row.employees?.full_name || '';
      const dept = row.employees?.department || '';
      
      csv += `${empId},${name},${dept},${row.base_salary},${row.present_days},${row.absent_days},${row.leave_deduction},${row.absence_deduction},${row.pf_amount},${row.income_tax_amount},${row.insurance_amount},${row.total_deductions},${row.net_salary},${row.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Payroll_${month}_${year}.csv`;
    link.click();
  },

  // Simulate Email & Workflow update
  async emailAndMarkPaid(payrolls, hrId) {
    const toUpdate = payrolls.filter(p => p.status === 'Approved');
    const sentAt = new Date().toISOString();
    
    // In production, trigger a Supabase Edge Function here to hit SendGrid/Resend.
    for (let p of toUpdate) {
      await supabase.from("payroll_records").update({
        status: 'Paid',
        paid_at: sentAt,
        sent_at: sentAt,
        sent_by: hrId,
        email_status: 'Delivered'
      }).eq('id', p.id);
    }
  },

  formatMoney: (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0)
};
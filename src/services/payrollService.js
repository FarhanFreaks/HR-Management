import { supabase } from "@/config/supabaseClient";

export const payrollService = {
  // --- 1. SETTINGS ---
  async getSettings() {
    const { data, error } = await supabase.from("payroll_settings").select("*").eq("id", 1).maybeSingle();
    if (error || !data) {
      return {
        paid_leave_allowed: 1, pf_percentage: 12, professional_tax_percentage: 2,
        health_insurance_percentage: 1, income_tax_percentage: 5, other_deduction_percentage: 0
      };
    }
    return data;
  },

  async updateSettings(payload) {
    const { data, error } = await supabase
      .from("payroll_settings")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", 1)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- 2. FETCH DATA ---
  async listPayroll(month, year) {
    const { data, error } = await supabase
      .from("payroll_records")
      .select(`
        *,
        employees (
          emp_id,
          employee_id,
          departments ( name ), 
          designations ( title ), 
          profiles ( full_name )
        )
      `) 
      .eq("payroll_month", month)
      .eq("payroll_year", year)
      .order("generated_at", { ascending: false }); // 👈 FIXED: changed from 'created_at' to 'generated_at'

    if (error) throw error;
    return data || [];
  },

  // --- 3. GENERATE PAYROLL ---
  async generateMonthlyPayroll(month, year, generatedBy) {
    const settings = await this.getSettings();
    const firstDay = new Date(year, month - 1, 1).toISOString();
    const lastDay = new Date(year, month, 0).toISOString();
    const totalDaysInMonth = new Date(year, month, 0).getDate();

    const [empRes, attRes, leaveRes] = await Promise.all([
      supabase.from("employees").select("*"),
      supabase.from("attendance").select("employee_id, status").gte("date", firstDay).lte("date", lastDay),
      supabase.from("leave_requests").select("employee_id, total_days").eq("status", "Approved").gte("start_date", firstDay).lte("end_date", lastDay)
    ]);

    if (empRes.error) throw new Error("Failed to fetch employees: " + empRes.error.message);

    const activeEmployees = empRes.data.filter(emp => {
      const stat = (emp.status || "").toLowerCase();
      return stat !== "inactive" && stat !== "terminated";
    });

    const payrollEntries = activeEmployees.map(emp => {
      const employeeDbId = emp.id || emp.employee_id;
      const baseSalary = Number(emp.base_salary || emp.salary || 0);
      const perDaySalary = baseSalary / totalDaysInMonth;

      const presentDays = attRes.data?.filter(a => (a.employee_id === emp.id || a.employee_id === emp.employee_id) && a.status === 'Present').length || 0;
      const approvedLeaveDays = leaveRes.data?.filter(l => l.employee_id === emp.id || l.employee_id === emp.employee_id)
        .reduce((sum, req) => sum + req.total_days, 0) || 0;

      let absentDays = totalDaysInMonth - presentDays - approvedLeaveDays;
      if (absentDays < 0) absentDays = 0;
      const absenceDeduction = absentDays * perDaySalary;

      const paidLeaveAllowed = settings.paid_leave_allowed || 1;
      let excessLeaveDays = approvedLeaveDays - paidLeaveAllowed;
      if (excessLeaveDays < 0) excessLeaveDays = 0;
      const leaveDeduction = excessLeaveDays * perDaySalary;

      const pfAmount = baseSalary * ((settings.pf_percentage || 12) / 100);
      const ptAmount = baseSalary * ((settings.professional_tax_percentage || 2) / 100);
      const insAmount = baseSalary * ((settings.health_insurance_percentage || 1) / 100);
      const taxAmount = baseSalary * ((settings.income_tax_percentage || 5) / 100);
      const otherAmount = baseSalary * ((settings.other_deduction_percentage || 0) / 100);

      const totalDeductions = leaveDeduction + absenceDeduction + pfAmount + ptAmount + insAmount + taxAmount + otherAmount;

      return {
        employee_id: employeeDbId,
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
        net_salary: baseSalary - totalDeductions,
        status: 'Generated',
        generated_by: generatedBy
      };
    });

    const { data, error } = await supabase.from("payroll_records").upsert(payrollEntries, { onConflict: 'employee_id,payroll_month,payroll_year', ignoreDuplicates: true }).select();
    if (error) throw new Error("Database Error: " + error.message);
    return data;
  },

  // --- 4. STATUS UPDATES ---
  async updatePayrollStatus(id, status, remarks = "") {
    const payload = { status, remarks };
    if (status === 'Reviewed') payload.reviewed_at = new Date().toISOString();
    if (status === 'Approved') payload.approved_at = new Date().toISOString();
    if (status === 'Paid') payload.paid_at = new Date().toISOString();

    const { error } = await supabase.from("payroll_records").update(payload).eq("id", id);
    if (error) throw error;
  },

  formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);
  }
};
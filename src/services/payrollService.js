import { supabase } from "@/config/supabaseClient";

const DEFAULT_SETTINGS = {
  id: 1,
  paid_leave_allowed: 1,
  pf_percentage: 12,
  professional_tax_percentage: 2,
  health_insurance_percentage: 1,
  income_tax_percentage: 5,
  other_deduction_percentage: 0,
};

const toDateString = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[0];
};

const getMonthBounds = (month, year) => {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  return {
    firstDay: toDateString(first),
    lastDay: toDateString(last),
    workingDays: last.getDate(),
  };
};

const getEmployeeName = (employee) => employee?.profiles?.full_name || employee?.full_name || "Unknown Employee";
const getDepartmentName = (employee) => employee?.departments?.name || employee?.department || "Unassigned";
const getDesignation = (employee) => employee?.designations?.title || employee?.designation || "Employee";
const getBaseSalary = (employee) => Number(employee?.base_salary ?? employee?.salary ?? 0);
const money = (value) => Math.round((Number(value) || 0) * 100) / 100;

const getLeaveOverlapDays = (leave, firstDay, lastDay) => {
  const start = new Date(`${leave.start_date < firstDay ? firstDay : leave.start_date}T00:00:00`);
  const end = new Date(`${leave.end_date > lastDay ? lastDay : leave.end_date}T00:00:00`);
  if (end < start) return 0;
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

const getPayrollSelect = () => `
  *,
  employees (
    emp_id,
    profiles (full_name),
    departments (name),
    designations (title)
  )
`;

export const payrollService = {
  async getSettings() {
    const { data, error } = await supabase
      .from("payroll_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;
    if (data) return { ...DEFAULT_SETTINGS, ...data };

    const { data: inserted, error: insertError } = await supabase
      .from("payroll_settings")
      .insert(DEFAULT_SETTINGS)
      .select("*")
      .single();

    if (insertError) throw insertError;
    return { ...DEFAULT_SETTINGS, ...inserted };
  },

  async updateSettings(values) {
    const payload = {
      ...DEFAULT_SETTINGS,
      ...values,
      id: 1,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("payroll_settings")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async listPayroll(month, year) {
    let query = supabase
      .from("payroll_records")
      .select(getPayrollSelect())
      .order("payroll_year", { ascending: false })
      .order("payroll_month", { ascending: false })
      .order("employee_name", { ascending: true });

    if (month) query = query.eq("payroll_month", month);
    if (year) query = query.eq("payroll_year", year);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async generateMonthlyPayroll(month, year, generatedByUid) {
    const settings = await this.getSettings();
    const { firstDay, lastDay, workingDays } = getMonthBounds(month, year);

    const { data: existing, error: existingError } = await supabase
      .from("payroll_records")
      .select("id")
      .eq("payroll_month", month)
      .eq("payroll_year", year)
      .limit(1);

    if (existingError) throw existingError;
    if (existing?.length) {
      throw new Error("Payroll is already generated for this month. Use the existing payroll history.");
    }

    const [empRes, attRes, leaveRes] = await Promise.all([
      supabase
        .from("employees")
        .select("*, profiles(full_name), departments(name), designations(title)")
        .or("status.is.null,status.eq.Active,status.eq.active"),
      supabase
        .from("attendance")
        .select("employee_id, date, punch_in, punch_out, status")
        .gte("date", firstDay)
        .lte("date", lastDay),
      supabase
        .from("leave_requests")
        .select("employee_id, start_date, end_date, total_days, status")
        .eq("status", "Approved")
        .lte("start_date", lastDay)
        .gte("end_date", firstDay),
    ]);

    if (empRes.error) throw empRes.error;
    if (attRes.error) throw attRes.error;
    if (leaveRes.error) throw leaveRes.error;

    const employees = empRes.data || [];
    if (employees.length === 0) throw new Error("No active employees found for payroll generation.");

    const payrollEntries = employees.map((employee) => {
      const employeeId = employee.id;
      const baseSalary = getBaseSalary(employee);
      const perDaySalary = workingDays > 0 ? baseSalary / workingDays : 0;

      const attendance = (attRes.data || []).filter((record) => record.employee_id === employeeId);
      const presentDays = attendance.filter((record) => {
        const status = String(record.status || "").toLowerCase();
        return status === "present" || Boolean(record.punch_in);
      }).length;
      const explicitAbsentDays = attendance.filter((record) => String(record.status || "").toLowerCase() === "absent").length;

      const approvedLeaveDays = (leaveRes.data || [])
        .filter((leave) => leave.employee_id === employeeId)
        .reduce((sum, leave) => sum + getLeaveOverlapDays(leave, firstDay, lastDay), 0);

      const calculatedAbsentDays = Math.max(workingDays - presentDays - approvedLeaveDays, 0);
      const absentDays = Math.max(explicitAbsentDays, calculatedAbsentDays);
      const paidLeaveAllowed = Number(settings.paid_leave_allowed ?? 1);
      const excessLeaveDays = Math.max(approvedLeaveDays - paidLeaveAllowed, 0);

      const leaveDeduction = excessLeaveDays * perDaySalary;
      const absenceDeduction = absentDays * perDaySalary;
      const pfAmount = baseSalary * (Number(settings.pf_percentage) / 100);
      const professionalTaxAmount = baseSalary * (Number(settings.professional_tax_percentage) / 100);
      const insuranceAmount = baseSalary * (Number(settings.health_insurance_percentage) / 100);
      const incomeTaxAmount = baseSalary * (Number(settings.income_tax_percentage) / 100);
      const otherDeductionAmount = baseSalary * (Number(settings.other_deduction_percentage) / 100);
      const totalDeductions =
        leaveDeduction +
        absenceDeduction +
        pfAmount +
        professionalTaxAmount +
        insuranceAmount +
        incomeTaxAmount +
        otherDeductionAmount;

      return {
        employee_id: employeeId,
        employee_name: getEmployeeName(employee),
        department: getDepartmentName(employee),
        designation: getDesignation(employee),
        payroll_month: month,
        payroll_year: year,
        base_salary: money(baseSalary),
        working_days: workingDays,
        present_days: presentDays,
        absent_days: absentDays,
        approved_leave_days: approvedLeaveDays,
        paid_leave_allowed: paidLeaveAllowed,
        excess_leave_days: excessLeaveDays,
        per_day_salary: money(perDaySalary),
        leave_deduction: money(leaveDeduction),
        absence_deduction: money(absenceDeduction),
        pf_percentage: Number(settings.pf_percentage),
        pf_amount: money(pfAmount),
        professional_tax_percentage: Number(settings.professional_tax_percentage),
        professional_tax_amount: money(professionalTaxAmount),
        insurance_percentage: Number(settings.health_insurance_percentage),
        insurance_amount: money(insuranceAmount),
        income_tax_percentage: Number(settings.income_tax_percentage),
        income_tax_amount: money(incomeTaxAmount),
        other_deduction_percentage: Number(settings.other_deduction_percentage),
        other_deduction_amount: money(otherDeductionAmount),
        total_deductions: money(totalDeductions),
        gross_salary: money(baseSalary),
        net_salary: money(baseSalary - totalDeductions),
        generated_by: generatedByUid,
        status: "Generated",
      };
    });

    const { data, error } = await supabase
      .from("payroll_records")
      .insert(payrollEntries)
      .select(getPayrollSelect());

    if (error) throw error;
    return data || payrollEntries;
  },

  async updatePayrollStatus(id, status, remarks = "") {
    const payload = {
      status,
      remarks,
      reviewed_at: status === "Reviewed" || status === "Rejected" ? new Date().toISOString() : undefined,
      approved_at: status === "Approved" ? new Date().toISOString() : undefined,
      paid_at: status === "Paid" ? new Date().toISOString() : undefined,
    };

    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    const { data, error } = await supabase
      .from("payroll_records")
      .update(payload)
      .eq("id", id)
      .select(getPayrollSelect())
      .single();

    if (error) throw error;
    return data;
  },

  async markPayslipsSent(payrolls, sentBy) {
    const sentAt = new Date().toISOString();

    for (const payroll of payrolls) {
      await supabase.from("payroll_email_logs").insert({
        payroll_record_id: payroll.id,
        employee_id: payroll.employee_id,
        sent_by: sentBy,
        sent_at: sentAt,
        email_status: "Sent",
        delivery_status: "Queued",
      });

      await supabase
        .from("payroll_records")
        .update({
          status: "Paid",
          sent_at: sentAt,
          sent_by: sentBy,
          email_status: "Sent",
          delivery_status: "Queued",
          paid_at: sentAt,
        })
        .eq("id", payroll.id);
    }
  },

  formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  },
};

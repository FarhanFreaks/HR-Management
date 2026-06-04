/// <reference path="../_shared/edge-runtime.d.ts" />

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getDefaultSecret = (name: string) => {
  const value = Deno.env.get(name);
  if (value) return value;

  if (name === "SUPABASE_SECRET_KEY") {
    const keysJson = Deno.env.get("SUPABASE_SECRET_KEYS");
    if (keysJson) return JSON.parse(keysJson).default;
    return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  }

  if (name === "SUPABASE_PUBLISHABLE_KEY") {
    const keysJson = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
    if (keysJson) return JSON.parse(keysJson).default;
    return Deno.env.get("SUPABASE_ANON_KEY");
  }

  return undefined;
};

const money = (value: unknown) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value) || 0);

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const toCsv = (record: any) => {
  const rows = [
    ["Employee ID", record.employee_id],
    ["Employee Name", record.employee_name],
    ["Department", record.department],
    ["Payroll Month", `${record.payroll_month}/${record.payroll_year}`],
    ["Gross Salary", record.gross_salary],
    ["Leave Deduction", record.leave_deduction],
    ["Absence Deduction", record.absence_deduction],
    ["PF", record.pf_amount],
    ["Professional Tax", record.professional_tax_amount],
    ["Insurance", record.insurance_amount],
    ["Income Tax", record.income_tax_amount],
    ["Total Deductions", record.total_deductions],
    ["Net Salary", record.net_salary],
    ["Status", "Paid"],
  ];

  return rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
};

const buildEmail = (record: any) => ({
  subject: `Payslip for ${record.payroll_month}/${record.payroll_year}`,
  html: `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f8fb;padding:28px;color:#1f2937;">
      <div style="max-width:640px;margin:0 auto;background:white;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#111827;color:white;padding:22px 28px;">
          <div style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#cbd5e1;">HRConnect Payroll</div>
          <h1 style="margin:8px 0 0;font-size:24px;">Payslip Generated</h1>
        </div>
        <div style="padding:28px;">
          <p>Hello ${escapeHtml(record.employee_name)},</p>
          <p>Your salary for <strong>${record.payroll_month}/${record.payroll_year}</strong> has been processed.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:18px;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;">Gross Salary</td><td style="padding:10px 0;text-align:right;border-bottom:1px solid #f3f4f6;">${money(record.gross_salary)}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;">Total Deductions</td><td style="padding:10px 0;text-align:right;border-bottom:1px solid #f3f4f6;color:#b91c1c;">-${money(record.total_deductions)}</td></tr>
            <tr><td style="padding:12px 0;color:#111827;font-weight:700;">Net Salary</td><td style="padding:12px 0;text-align:right;color:#15803d;font-weight:700;">${money(record.net_salary)}</td></tr>
          </table>
          <p style="margin-top:22px;color:#4b5563;">Your detailed payslip is attached as a spreadsheet.</p>
          <p style="margin-top:24px;">Regards,<br/><strong>HR Team</strong></p>
        </div>
      </div>
    </div>
  `,
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { month, year } = await req.json();
    if (!month || !year) {
      return Response.json({ error: "month and year are required." }, { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const publishableKey = getDefaultSecret("SUPABASE_PUBLISHABLE_KEY");
    const secretKey = getDefaultSecret("SUPABASE_SECRET_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("HR_EMAIL_FROM") || "HRConnect <onboarding@resend.dev>";

    if (!supabaseUrl || !publishableKey || !secretKey || !resendApiKey) {
      return Response.json({ error: "Missing Supabase or Resend secrets." }, { status: 500, headers: corsHeaders });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUser = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData.user) {
      return Response.json({ error: "Authentication required." }, { status: 401, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(supabaseUrl, secretKey);
    const { data: hrProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (hrProfile?.role?.toLowerCase() !== "hr") {
      return Response.json({ error: "Only HR can send payroll." }, { status: 403, headers: corsHeaders });
    }

    const { data: records, error: recordsError } = await supabaseAdmin
      .from("payroll_records")
      .select("*")
      .eq("payroll_month", month)
      .eq("payroll_year", year)
      .eq("status", "Approved");

    if (recordsError) throw recordsError;
    if (!records?.length) {
      return Response.json({ error: "No approved payroll records found." }, { status: 404, headers: corsHeaders });
    }

    let sent = 0;
    const sentAt = new Date().toISOString();

    for (const record of records) {
      const { data: employeeAuth } = await supabaseAdmin.auth.admin.getUserById(record.employee_id);
      const employeeEmail = employeeAuth?.user?.email;

      if (!employeeEmail) {
        await supabaseAdmin.from("payroll_email_logs").insert({
          payroll_record_id: record.id,
          employee_id: record.employee_id,
          sent_by: userData.user.id,
          sent_at: sentAt,
          email_status: "Failed",
          delivery_status: "Employee email missing",
        });
        continue;
      }

      const email = buildEmail(record);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: employeeEmail,
          subject: email.subject,
          html: email.html,
          attachments: [
            {
              filename: `Payslip_${record.payroll_month}_${record.payroll_year}.csv`,
              content: btoa(toCsv(record)),
            },
          ],
        }),
      });

      const result = await response.json();

      await supabaseAdmin.from("payroll_email_logs").insert({
        payroll_record_id: record.id,
        employee_id: record.employee_id,
        sent_by: userData.user.id,
        sent_at: sentAt,
        email_status: response.ok ? "Sent" : "Failed",
        delivery_status: response.ok ? "Queued" : result?.message || "Provider error",
        provider_message_id: result?.id || null,
        error_message: response.ok ? null : JSON.stringify(result),
      });

      if (!response.ok) continue;

      await supabaseAdmin
        .from("payroll_records")
        .update({
          status: "Paid",
          sent_at: sentAt,
          sent_by: userData.user.id,
          email_status: "Sent",
          delivery_status: "Queued",
          paid_at: sentAt,
        })
        .eq("id", record.id);

      sent += 1;
    }

    return Response.json({ ok: true, sent }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected payroll email error." },
      { status: 500, headers: corsHeaders },
    );
  }
});

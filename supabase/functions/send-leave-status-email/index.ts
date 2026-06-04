/// <reference path="../_shared/edge-runtime.d.ts" />

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LEAVE_TYPE_LABELS: Record<string, string> = {
  SL: "Short Leave",
  LL: "Long Leave",
  ML: "Medical Leave",
  Casual: "Casual Leave",
  Sick: "Sick Leave",
  Earned: "Earned Leave",
};

const getDefaultSecret = (name: string) => {
  const value = Deno.env.get(name);
  if (value) return value;

  if (name === "SUPABASE_SECRET_KEY") {
    const keysJson = Deno.env.get("SUPABASE_SECRET_KEYS");
    if (keysJson) {
      return JSON.parse(keysJson).default;
    }
    return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  }

  if (name === "SUPABASE_PUBLISHABLE_KEY") {
    const keysJson = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
    if (keysJson) {
      return JSON.parse(keysJson).default;
    }
    return Deno.env.get("SUPABASE_ANON_KEY");
  }

  return undefined;
};

const formatDate = (dateString: string) =>
  new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const buildEmail = (request: any, employeeEmail: string, status: "Approved" | "Rejected") => {
  const employeeName = request.employees?.profiles?.full_name || "Employee";
  const employeeCode = request.employees?.emp_id || request.employee_id?.slice(0, 8)?.toUpperCase() || "N/A";
  const leaveType = LEAVE_TYPE_LABELS[request.leave_type] || request.leave_type;
  const reason = request.reason || "N/A";
  const decisionColor = status === "Approved" ? "#15803d" : "#b91c1c";
  const decisionBg = status === "Approved" ? "#ecfdf5" : "#fef2f2";
  const subject = `Your leave request has been ${status.toLowerCase()}`;

  const text = [
    `Hello ${employeeName},`,
    "",
    `Your ${leaveType} request has been ${status.toLowerCase()}.`,
    "",
    `Employee ID: ${employeeCode}`,
    `From: ${formatDate(request.start_date)}`,
    `To: ${formatDate(request.end_date)}`,
    `Total days: ${request.total_days}`,
    `Reason: ${reason}`,
    `Status: ${status}`,
    "",
    "Regards,",
    "HR Team",
  ].join("\n");

  const html = `
    <div style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
      <div style="max-width:640px;margin:0 auto;padding:28px 16px;">
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <div style="padding:24px 28px;background:#111827;color:#ffffff;">
            <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#cbd5e1;">HRConnect Leave Update</div>
            <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3;">Leave Request ${status}</h1>
          </div>
          <div style="padding:28px;">
            <p style="margin:0 0 16px;font-size:16px;">Hello ${escapeHtml(employeeName)},</p>
            <p style="margin:0 0 22px;font-size:15px;line-height:1.6;">
              Your <strong>${escapeHtml(leaveType)}</strong> request has been
              <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${decisionBg};color:${decisionColor};font-weight:700;">${status}</span>.
            </p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tbody>
                <tr><td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Employee ID</td><td style="padding:10px 0;text-align:right;border-bottom:1px solid #f3f4f6;">${escapeHtml(employeeCode)}</td></tr>
                <tr><td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Leave Type</td><td style="padding:10px 0;text-align:right;border-bottom:1px solid #f3f4f6;">${escapeHtml(leaveType)}</td></tr>
                <tr><td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">From</td><td style="padding:10px 0;text-align:right;border-bottom:1px solid #f3f4f6;">${formatDate(request.start_date)}</td></tr>
                <tr><td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">To</td><td style="padding:10px 0;text-align:right;border-bottom:1px solid #f3f4f6;">${formatDate(request.end_date)}</td></tr>
                <tr><td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Total Days</td><td style="padding:10px 0;text-align:right;border-bottom:1px solid #f3f4f6;">${escapeHtml(request.total_days)}</td></tr>
                <tr><td style="padding:10px 0;color:#6b7280;">Reason</td><td style="padding:10px 0;text-align:right;">${escapeHtml(reason)}</td></tr>
              </tbody>
            </table>
            <p style="margin:26px 0 0;font-size:14px;color:#4b5563;">Regards,<br/><strong>HR Team</strong></p>
          </div>
        </div>
        <p style="margin:14px 0 0;text-align:center;font-size:12px;color:#94a3b8;">Sent to ${escapeHtml(employeeEmail)}</p>
      </div>
    </div>
  `;

  return { subject, text, html };
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { requestId, status } = await req.json();

    if (!requestId || !["Approved", "Rejected"].includes(status)) {
      return Response.json(
        { error: "requestId and status Approved/Rejected are required." },
        { status: 400, headers: corsHeaders },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const publishableKey = getDefaultSecret("SUPABASE_PUBLISHABLE_KEY");
    const secretKey = getDefaultSecret("SUPABASE_SECRET_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("HR_EMAIL_FROM") || "HRConnect <onboarding@resend.dev>";

    if (!supabaseUrl || !publishableKey || !secretKey || !resendApiKey) {
      return Response.json(
        { error: "Missing Supabase or Resend secrets for email sending." },
        { status: 500, headers: corsHeaders },
      );
    }

    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUser = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: "Authentication required." }, { status: 401, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(supabaseUrl, secretKey);

    const { data: hrProfile, error: roleError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (roleError || hrProfile?.role?.toLowerCase() !== "hr") {
      return Response.json({ error: "Only HR can send leave status emails." }, { status: 403, headers: corsHeaders });
    }

    const { data: leaveRequest, error: requestError } = await supabaseAdmin
      .from("leave_requests")
      .select(`
        id,
        employee_id,
        leave_type,
        start_date,
        end_date,
        total_days,
        reason,
        status,
        employees (
          emp_id,
          profiles (full_name)
        )
      `)
      .eq("id", requestId)
      .maybeSingle();

    if (requestError || !leaveRequest) {
      return Response.json({ error: "Leave request not found." }, { status: 404, headers: corsHeaders });
    }

    const { data: employeeAuth, error: employeeError } = await supabaseAdmin.auth.admin.getUserById(
      leaveRequest.employee_id,
    );
    const employeeEmail = employeeAuth?.user?.email;

    if (employeeError || !employeeEmail) {
      return Response.json({ error: "Employee email was not found." }, { status: 404, headers: corsHeaders });
    }

    const email = buildEmail(leaveRequest, employeeEmail, status);
    const resendResponse = await fetch("https://api.resend.com/emails", {
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
        text: email.text,
      }),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      return Response.json(
        { error: resendResult?.message || "Email provider failed.", details: resendResult },
        { status: 502, headers: corsHeaders },
      );
    }

    return Response.json({ ok: true, emailId: resendResult.id }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected email function error." },
      { status: 500, headers: corsHeaders },
    );
  }
});

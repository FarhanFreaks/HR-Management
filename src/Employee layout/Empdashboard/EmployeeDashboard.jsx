/**
 * EmployeeDashboard.jsx
 * =====================
 * HRConnect — Employee User Dashboard Component
 *
 * PURPOSE:
 *   Renders the right-hand content area of the Employee (User) portal.
 *   Matches the uploaded UI screenshot exactly — excluding the sidebar
 *   navigation, which is handled separately by your app shell.
 *
 * PAGE STRUCTURE:
 *   <EmployeeDashboard>
 *     ├── <PageHeader>          — "Employee ID" title + current date
 *     ├── <EmployeeIDCard>      — Avatar + Name / ID / Department tile
 *     └── <BottomRow>
 *          ├── <Announcements>  — Recent announcements feed
 *          └── <UpcomingEvents> — Upcoming events list
 *
 * USAGE:
 *   Drop inside your app shell that already provides the sidebar:
 *
 *     import EmployeeDashboard from './EmployeeDashboard';
 *
 *     function App() {
 *       return (
 *         <div className="app-shell">
 *           <Sidebar />
 *           <EmployeeDashboard />
 *         </div>
 *       );
 *     }
 *
 * DEPENDENCIES:
 *   - React (useState, useEffect)  — entrance animation control
 *   - EmployeeDashboard.css        — all visual styles
 *
 * CUSTOMISATION:
 *   · Replace EMPLOYEE_DATA with real API data from your backend.
 *   · Replace ANNOUNCEMENTS and EVENTS arrays with live fetched data.
 *   · Swap the <AvatarIcon /> SVG with a real <img> tag if photos exist.
 */

import { useState, useEffect } from "react";
import "./EmployeeDashboard.css";
import { supabase } from "../../config/supabaseClient";

/**
 * Recent announcements list.
 * Each entry has:
 *   text  {string} — main announcement copy
 *   time  {string} — relative timestamp
 *   dot   {string} — CSS class for the coloured bullet
 */
const ANNOUNCEMENTS = [
  {
    id:   1,
    text: "Your salary was credited",
    time: "10:00 AM",
    dot:  "dot--red",
  },
  {
    id:   2,
    text: "Your leave Request was Approved",
    time: "1 day ago",
    dot:  "dot--yellow",
  },
  {
    id:   3,
    text: "Senior React Developer posted",
    time: "2 days ago",
    dot:  "dot--green",
  },
];

/**
 * Upcoming events list.
 * Each entry has:
 *   label {string} — event name
 *   dot   {string} — CSS class for the coloured bullet
 */
const EVENTS = [
  { id: 1, label: "Employee day",      dot: "dot--blue"   },
  { id: 2, label: "New Year",          dot: "dot--pink"   },
  { id: 3, label: "Pongal Celebration",dot: "dot--orange" },
];

/* ─────────────────────────────────────────────────────────
   HELPER — getTodayString()
   Returns a formatted date string matching the UI screenshot:
   "Wednesday, May 09, 2026"
───────────────────────────────────────────────────────── */
function getTodayString() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "2-digit",
  });
}

/* ─────────────────────────────────────────────────────────
   AvatarIcon component removed. Replaced with modern initials avatar inline.
───────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────
   SUB-COMPONENT — AnnouncementItem
   Renders a single row in the Recent Announcements list.

   Props:
     text  {string} — announcement description
     time  {string} — relative timestamp shown below the text
     dot   {string} — CSS modifier class for the bullet colour
───────────────────────────────────────────────────────── */
function AnnouncementItem({ text, time, dot }) {
  return (
    <li className="announce-item">
      {/* Coloured circle bullet — colour driven by dot CSS class */}
      <span className={`bullet ${dot}`} aria-hidden="true" />

      {/* Text + timestamp stacked vertically */}
      <div className="announce-item__body">
        <p className="announce-item__text">{text}</p>
        <p className="announce-item__time">{time}</p>
      </div>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────
   SUB-COMPONENT — EventItem
   Renders a single row in the Upcoming Events list.

   Props:
     label {string} — event name
     dot   {string} — CSS modifier class for the bullet colour
───────────────────────────────────────────────────────── */
function EventItem({ label, dot }) {
  return (
    <li className="event-item">
      {/* Coloured circle bullet */}
      <span className={`bullet ${dot}`} aria-hidden="true" />

      {/* Event name */}
      <p className="event-item__label">{label}</p>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────
   SUB-COMPONENT — PayslipItem
   Renders a single row in the Recent Payslips list.
───────────────────────────────────────────────────────── */
function PayslipItem({ month, netPay }) {
  return (
    <li className="payslip-item">
      <div className="payslip-item__info">
        <span className="payslip-item__icon" aria-hidden="true">📄</span>
        <div className="payslip-item__text">
          <p className="payslip-item__month">{month}</p>
          <p className="payslip-item__pay">Net Pay: {netPay}</p>
        </div>
      </div>
      <button className="payslip-item__download" aria-label={`Download ${month} payslip`}>
        ↓
      </button>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────
   SUB-COMPONENT — AttendanceSummary
   A visual indicator of days present vs total working days.
───────────────────────────────────────────────────────── */
function AttendanceSummary({ present, total }) {
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="att-summary">
      <div className="att-summary__circle" style={{ '--pct': `${pct}%` }}>
        <span className="att-summary__val">{pct}%</span>
      </div>
      <div className="att-summary__stats">
        <p className="att-summary__label">Current Month</p>
        <p className="att-summary__days"><strong>{present}</strong> / {total} days present</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SUB-COMPONENT — QuickStat
   A small widget displaying a single data point.
───────────────────────────────────────────────────────── */
function QuickStat({ title, value, icon, bgClass }) {
  return (
    <div className="quick-stat">
      <div className={`quick-stat__icon ${bgClass}`}>{icon}</div>
      <div className="quick-stat__info">
        <h3 className="quick-stat__title">{title}</h3>
        <p className="quick-stat__value">{value}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT — EmployeeDashboard
   Assembles all sub-components into the full page layout.
───────────────────────────────────────────────────────── */
export default function EmployeeDashboard() {
  /**
   * 'visible' controls the CSS entrance animation.
   * Set to true after 80ms so the browser has painted
   * the initial state (opacity: 0, translateY: 16px)
   * before we trigger the transition.
   */
  const [visible, setVisible] = useState(false);
  const [employeeData, setEmployeeData] = useState({
    name: "Loading...",
    id: "Loading...",
    department: "Loading...",
    avatarUrl: null,
  });
  const [stats, setStats] = useState({
    availableLeave: "...",
    pendingTasks: "...",
    attendancePresent: 0,
    attendanceTotal: 22,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Query employees table to get emp_id, department and profile data
        const { data } = await supabase
          .from('employees')
          .select(`
            emp_id,
            departments (name),
            profiles (full_name, role, avatar_url)
          `)
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (data) {
          const profile = data.profiles || {};
          
          setEmployeeData({
            name: profile.full_name || "Employee",
            id: data.emp_id || "EMP-XXX",
            department: data.departments?.name || "Unassigned",
            avatarUrl: profile.avatar_url,
          });
        } else {
          // Fallback if they are in profiles but not employees
          const { data: fallbackData } = await supabase
            .from('profiles')
            .select('full_name, role, avatar_url')
            .eq('id', session.user.id)
            .maybeSingle();

          if (fallbackData) {
            const shortId = session.user.id.substring(0, 8).toUpperCase();
            setEmployeeData({
              name: fallbackData.full_name || "Employee",
              id: `EMP-${shortId}`,
              department: "Unassigned",
              avatarUrl: fallbackData.avatar_url,
            });
          }
        }

        // Fetch leave data for dynamic stats
        const { data: leaveData } = await supabase
          .from('leave_requests')
          .select('status, total_days')
          .eq('employee_id', session.user.id);

        let approvedDays = 0;
        let pendingCount = 0;
        if (leaveData) {
          leaveData.forEach(req => {
            if (req.status === 'Approved') {
              approvedDays += (req.total_days || 0);
            } else if (req.status === 'Pending') {
              pendingCount += 1;
            }
          });
        }
        
        const TOTAL_ANNUAL_LEAVE = 14;

        // Fetch Attendance for current month
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

        const { data: attData } = await supabase
          .from("attendance")
          .select("status")
          .eq("employee_id", session.user.id)
          .gte("date", firstDay)
          .lte("date", lastDay);
        
        let presentCount = 0;
        if (attData) {
           presentCount = attData.filter(a => a.status === "Present").length;
        }

        setStats({
          availableLeave: `${Math.max(0, TOTAL_ANNUAL_LEAVE - approvedDays)} Days`,
          pendingTasks: `${pendingCount} Items`,
          attendancePresent: presentCount,
          attendanceTotal: 22,
        });
      }
    };
    fetchProfile();

    const timer = setTimeout(() => setVisible(true), 80);
    /* Cleanup: cancel the timer if the component unmounts early */
    return () => clearTimeout(timer);
  }, []);

  return (
    /*
     * .emp-dashboard is the root wrapper.
     * Adding .emp-dashboard--visible triggers all entrance animations.
     */
    <main className={`emp-dashboard ${visible ? "emp-dashboard--visible" : ""}`}>

      {/* ── Quick Stats Row ──────────────────────────── */}
      <section className="emp-dashboard__stats" aria-label="Quick statistics">
        <QuickStat title="Available Leave" value={stats.availableLeave} icon="🏖️" bgClass="bg-blue" />
        <QuickStat title="Next Holiday" value="Aug 15" icon="🎉" bgClass="bg-pink" />
        <QuickStat title="Pending Leaves" value={stats.pendingTasks} icon="📋" bgClass="bg-yellow" />
      </section>

      {/* ── Employee ID Card ─────────────────────────── */}
      <section className="emp-card" aria-label="Employee identification card">
        <div className="emp-card__bg-decoration"></div>
        <div className="emp-card__content">
          
          {/* Left: Modern Avatar */}
          <div className="emp-card__avatar-wrap">
            {employeeData.avatarUrl ? (
              <img src={employeeData.avatarUrl} alt={`${employeeData.name}'s avatar`} className="emp-card__avatar-img" />
            ) : (
              <div className="emp-card__avatar-placeholder">
                {employeeData.name && employeeData.name !== "Loading..." 
                  ? employeeData.name.charAt(0).toUpperCase() 
                  : "E"}
              </div>
            )}
          </div>

          {/* Right: Clean modern details */}
          <div className="emp-card__details">
            <h2 className="emp-card__name">{employeeData.name}</h2>
            <div className="emp-card__badges">
              <span className="emp-card__badge emp-card__badge--dept">
                <span className="badge-dot"></span>
                {employeeData.department}
              </span>
              <span className="emp-card__badge emp-card__badge--id">
                ID: {employeeData.id}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ── Bottom Two-Column Row ─────────────────────── */}
      <div className="emp-dashboard__bottom">

        {/* Left card: Recent Announcements */}
        <section className="info-card" aria-label="Recent announcements">
          <h2 className="info-card__title">Recent Announcements</h2>
          <ul className="info-card__list">
            {ANNOUNCEMENTS.map((item) => (
              <AnnouncementItem
                key={item.id}
                text={item.text}
                time={item.time}
                dot={item.dot}
              />
            ))}
          </ul>
        </section>

        {/* Right card: Upcoming Events */}
        <section className="info-card" aria-label="Upcoming events">
          <h2 className="info-card__title">Upcoming Events</h2>
          <ul className="info-card__list info-card__list--events">
            {EVENTS.map((item) => (
              <EventItem
                key={item.id}
                label={item.label}
                dot={item.dot}
              />
            ))}
          </ul>
        </section>

      </div>

      {/* ── Second Bottom Two-Column Row ──────────────── */}
      <div className="emp-dashboard__bottom" style={{ marginTop: 'var(--space-lg)' }}>
        
        {/* Left card: Attendance Summary */}
        <section className="info-card" aria-label="Attendance summary">
          <h2 className="info-card__title">Attendance Summary</h2>
          <AttendanceSummary present={stats.attendancePresent} total={stats.attendanceTotal} />
        </section>

        {/* Right card: Recent Payslips */}
        <section className="info-card" aria-label="Recent payslips">
          <h2 className="info-card__title">Recent Payslips</h2>
          <ul className="info-card__list">
            <PayslipItem month="May 2026" netPay="₹ 45,000" />
            <PayslipItem month="April 2026" netPay="₹ 45,000" />
            <PayslipItem month="March 2026" netPay="₹ 42,500" />
          </ul>
        </section>

      </div>
    </main>
  );
}

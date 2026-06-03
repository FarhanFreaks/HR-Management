/**
 * EmployeeProfile.jsx
 * ===================
 * HRConnect — Single Employee Profile Page
 *
 * PURPOSE:
 *   Displays complete details of a single employee.
 *   Replaces the "coming soon" placeholder in the Employee
 *   module with a rich profile view.
 *
 * PAGE LAYOUT:
 *   <EmployeeProfile>
 *     ├── <PageHeader>          — "Employee" title + back button
 *     ├── <ProfileHero>         — Avatar + name + role + status badge
 *     └── <DetailGrid>
 *          ├── <PersonalInfo>   — ID, email, phone, joined date
 *          ├── <WorkInfo>       — Department, manager, type, location
 *          ├── <LeaveBalance>   — Annual / sick / casual leave bars
 *          └── <RecentActivity> — Last 4 activity events
 *
 * USAGE:
 *     import EmployeeProfile from './EmployeeProfile';
 *     <EmployeeProfile />
 *
 * DEPENDENCIES:
 *   - React (useState, useEffect)
 *   - EmployeeProfile.css
 */

import { useState, useEffect } from "react";
import "./EmployeeProfile.css";

/* ─────────────────────────────────────────────────────
   EMPLOYEE DATA
   Single employee object. In production replace with:
     const { data: employee } = useFetch('/api/employees/EMDS101');
───────────────────────────────────────────────────── */
const EMPLOYEE = {
  /* Identity */
  id:           "EMDS101",
  name:         "Jose",
  initials:     "JS",
  role:         "MERN Stack Developer",
  department:   "Engineering",
  manager:      "Suresh Menon",
  employeeType: "Full-time",
  location:     "Chennai, Tamil Nadu",
  status:       "Active",

  /* Contact */
  email:        "jose@hrconnect.in",
  phone:        "+91 98410 22002",
  joined:       "15 March 2022",
  birthday:     "04 July 1998",

  /* Avatar colours — initials-based avatar */
  avatarBg:     "#D1FAE5",
  avatarColor:  "#065F46",

  /* Leave balance (days) */
  leave: {
    annual:  { used: 6,  total: 18 },
    sick:    { used: 2,  total: 12 },
    casual:  { used: 3,  total: 8  },
  },

  /* Skills list */
  skills: ["React.js", "Node.js", "MongoDB", "Express.js", "JavaScript", "Tailwind CSS"],

  /* Recent activity feed */
  activity: [
    { id: 1, icon: "✅", text: "Leave request approved",        time: "Today, 10:14 AM",   dot: "dot--green"  },
    { id: 2, icon: "📄", text: "Payslip generated for May 2026", time: "Yesterday, 9:00 AM", dot: "dot--blue"   },
    { id: 3, icon: "✏️", text: "Profile updated",               time: "3 days ago",         dot: "dot--amber"  },
    { id: 4, icon: "🏢", text: "Checked in — Office",           time: "4 days ago",         dot: "dot--purple" },
  ],
};

/* ─────────────────────────────────────────────────────
   HELPER — LeaveBar
   Renders a leave type row: label | bar | used/total

   Props:
     label   {string}  — "Annual", "Sick", "Casual"
     used    {number}  — days used
     total   {number}  — total entitled days
     color   {string}  — CSS class for the fill colour
     animate {boolean} — trigger CSS bar transition
───────────────────────────────────────────────────── */
function LeaveBar({ label, used, total, color, animate }) {
  /* Percentage of bar that should be filled */
  const pct = Math.round((used / total) * 100);

  return (
    <div className="leave-row">
      {/* Leave type label */}
      <div className="leave-row__meta">
        <span className="leave-row__label">{label}</span>
        <span className="leave-row__count">
          <strong>{used}</strong> / {total} days used
        </span>
      </div>

      {/* Progress track */}
      <div className="leave-row__track" role="progressbar"
           aria-valuenow={used} aria-valuemax={total} aria-label={`${label} leave`}>
        <div
          className={`leave-row__fill ${color}`}
          style={{ width: animate ? `${pct}%` : "0%" }}
        />
      </div>

      {/* Remaining */}
      <p className="leave-row__remaining">{total - used} days remaining</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   HELPER — InfoRow
   A single label + value pair inside a detail card.

   Props:
     icon  {string} — emoji icon
     label {string} — field name
     value {string} — field data
───────────────────────────────────────────────────── */
function InfoRow({ icon, label, value }) {
  return (
    <div className="info-row">
      {/* Icon bubble */}
      <div className="info-row__icon" aria-hidden="true">{icon}</div>
      <div className="info-row__body">
        <p className="info-row__label">{label}</p>
        <p className="info-row__value">{value}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   HELPER — ActivityItem
   One row in the recent activity list.

   Props:
     icon  {string} — emoji
     text  {string} — activity description
     time  {string} — relative timestamp
     dot   {string} — CSS dot colour class
───────────────────────────────────────────────────── */
function ActivityItem({ icon, text, time, dot }) {
  return (
    <li className="act-item">
      <span className={`act-item__dot ${dot}`} aria-hidden="true" />
      <div className="act-item__body">
        <p className="act-item__text">
          <span className="act-item__icon" aria-hidden="true">{icon}</span>
          {text}
        </p>
        <p className="act-item__time">{time}</p>
      </div>
    </li>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN COMPONENT — EmployeeProfile
───────────────────────────────────────────────────── */
export default function EmployeeProfile() {
  /* Controls entrance animation — true after 80ms mount delay */
  const [visible, setVisible]   = useState(false);
  /* Controls leave bar animation — true after 350ms */
  const [barAnim, setBarAnim]   = useState(false);

  useEffect(() => {
    /* First: fade in the page */
    const t1 = setTimeout(() => setVisible(true), 80);
    /* Then: animate leave bars */
    const t2 = setTimeout(() => setBarAnim(true),  350);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const { leave, skills, activity } = EMPLOYEE;

  return (
    <main className={`ep ${visible ? "ep--visible" : ""}`}>

      {/* ── Page Header ─────────────────────────────── */}
      <header className="ep__header">
        {/* Back button — wire to router in production */}
       
       
      </header>

      {/* ── Profile Hero Card ───────────────────────── */}
      <section className="hero-card" aria-label="Employee profile summary">

        {/* Avatar */}
        <div
          className="hero-card__avatar"
          style={{ background: EMPLOYEE.avatarBg, color: EMPLOYEE.avatarColor }}
          aria-label={`${EMPLOYEE.name} avatar`}
        >
          {EMPLOYEE.initials}
        </div>

        {/* Name + role */}
        <div className="hero-card__identity">
          <h2 className="hero-card__name">{EMPLOYEE.name}</h2>
          <p  className="hero-card__role">{EMPLOYEE.role}</p>
          <p  className="hero-card__dept">{EMPLOYEE.department} · {EMPLOYEE.id}</p>
        </div>

        {/* Status badge — pushed to the right */}
        <div className="hero-card__right">
          <span className="status-badge status-badge--active">
            <span className="status-badge__dot" aria-hidden="true" />
            {EMPLOYEE.status}
          </span>
          {/* Edit button */}
        </div>

      </section>

      {/* ── Detail Grid ─────────────────────────────── */}
      <div className="detail-grid">

        {/* ── Card 1: Personal Information ── */}
        <section className="detail-card" aria-label="Personal information">
          <h3 className="detail-card__title">Personal Information</h3>
          <div className="detail-card__rows">
            <InfoRow icon="🪪" label="Employee ID"    value={EMPLOYEE.id}       />
            <InfoRow icon="📧" label="Email Address"  value={EMPLOYEE.email}    />
            <InfoRow icon="📱" label="Phone Number"   value={EMPLOYEE.phone}    />
            <InfoRow icon="📅" label="Date of Joining" value={EMPLOYEE.joined}  />
            <InfoRow icon="🎂" label="Birthday"       value={EMPLOYEE.birthday} />
          </div>
        </section>

        {/* ── Card 2: Work Information ── */}
        <section className="detail-card" aria-label="Work information">
          <h3 className="detail-card__title">Work Information</h3>
          <div className="detail-card__rows">
            <InfoRow icon="🏢" label="Department"      value={EMPLOYEE.department}   />
            <InfoRow icon="👤" label="Reporting Manager" value={EMPLOYEE.manager}    />
            <InfoRow icon="⏱️" label="Employment Type"  value={EMPLOYEE.employeeType} />
            <InfoRow icon="📍" label="Location"         value={EMPLOYEE.location}    />
          </div>
        </section>

        {/* ── Card 3: Leave Balance ── */}
        <section className="detail-card detail-card--wide" aria-label="Leave balance">
          <h3 className="detail-card__title">Leave Balance</h3>
          <div className="leave-bars">
            <LeaveBar
              label="Annual Leave"
              used={leave.annual.used}
              total={leave.annual.total}
              color="fill--blue"
              animate={barAnim}
            />
            <LeaveBar
              label="Sick Leave"
              used={leave.sick.used}
              total={leave.sick.total}
              color="fill--red"
              animate={barAnim}
            />
            <LeaveBar
              label="Casual Leave"
              used={leave.casual.used}
              total={leave.casual.total}
              color="fill--amber"
              animate={barAnim}
            />
          </div>
        </section>

        {/* ── Card 4: Skills ── */}
        <section className="detail-card" aria-label="Skills">
          <h3 className="detail-card__title">Skills</h3>
          <div className="skills-wrap">
            {skills.map((skill) => (
              <span key={skill} className="skill-pill">{skill}</span>
            ))}
          </div>
        </section>

        {/* ── Card 5: Recent Activity ── */}
        <section className="detail-card detail-card--wide" aria-label="Recent activity">
          <h3 className="detail-card__title">Recent Activity</h3>
          <ul className="act-list">
            {activity.map((item) => (
              <ActivityItem key={item.id} {...item} />
            ))}
          </ul>
        </section>

      </div>
    </main>
  );
}

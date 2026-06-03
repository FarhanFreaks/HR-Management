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

/* ─────────────────────────────────────────────────────────
   DATA CONSTANTS
   In a real app these would come from an API call:
     const { data } = useFetch('/api/employee/me');
   For now they are static so the component is self-contained.
───────────────────────────────────────────────────────── */

/**
 * Logged-in employee's basic profile.
 * Replace with dynamic data from your auth context or API.
 */
const EMPLOYEE_DATA = {
  name:       "Jose",
  id:         "EMDS101",
  department: "Engineering",
  initials:   "RM",   /* used by the sidebar avatar (reference) */
};

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
   SUB-COMPONENT — AvatarIcon
   A simple SVG silhouette that matches the line-art avatar
   in the screenshot. Replace with <img> if real photos exist.

   No props needed — it's a static decoration.
───────────────────────────────────────────────────────── */
function AvatarIcon() {
  return (
    /* role="img" + aria-label make the SVG accessible to screen readers */
    <svg
      className="emp-card__avatar-svg"
      viewBox="0 0 120 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Employee avatar silhouette"
    >
      {/* Head circle */}
      <circle cx="60" cy="42" r="28" stroke="#1B2559" strokeWidth="4" />

      {/* Hair tuft on top — matches the screenshot illustration */}
      <path
        d="M48 20 Q55 10 65 18"
        stroke="#1B2559"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Shoulders / body arc */}
      <path
        d="M10 128 C10 95 30 78 60 78 C90 78 110 95 110 128"
        stroke="#1B2559"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

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

  useEffect(() => {
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

      {/* ── Page Header ─────────────────────────────── */}
      <header className="emp-dashboard__header">
        {/* Bold section title — "Employee ID" as in screenshot */}
        <h1 className="emp-dashboard__title">Employee ID</h1>
        {/* Current date line below the title */}
        <p className="emp-dashboard__date">{getTodayString()}</p>
      </header>

      {/* ── Employee ID Card ─────────────────────────── */}
      {/*
        This is the large lavender tile showing:
          · Avatar silhouette (left)
          · Employee Name / ID / Department (right)
      */}
      <section className="emp-card" aria-label="Employee identification card">

        {/* Left: Avatar illustration */}
        <div className="emp-card__avatar-wrap">
          <AvatarIcon />
        </div>

        {/* Right: Three detail rows */}
        <dl className="emp-card__details">

          {/* Employee Name row */}
          <div className="emp-card__row">
            {/* <dt> = definition term (the label) */}
            <dt className="emp-card__field-label">Employee Name:</dt>
            {/* <dd> = definition description (the value) */}
            <dd className="emp-card__field-value">{EMPLOYEE_DATA.name}</dd>
          </div>

          {/* Employee ID row */}
          <div className="emp-card__row">
            <dt className="emp-card__field-label">Employee ID:</dt>
            <dd className="emp-card__field-value emp-card__field-value--mono">
              {/* Monospace font for the ID code */}
              {EMPLOYEE_DATA.id}
            </dd>
          </div>

          {/* Department row */}
          <div className="emp-card__row">
            <dt className="emp-card__field-label">Employee Department :</dt>
            <dd className="emp-card__field-value">{EMPLOYEE_DATA.department}</dd>
          </div>

        </dl>
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
    </main>
  );
}

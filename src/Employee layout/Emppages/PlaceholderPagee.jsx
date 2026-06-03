import { useLocation } from 'react-router-dom';
import '../styles/PlaceholderPagee.css';

const icons = {
  '/dashboard': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  '/employee': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  ),
  '/leave': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      <path d="M8 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  '/recruitment': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <path d="M16 11l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const labels = {
  '/dashboard': 'Dashboard',
  '/employee': 'Employee',
  '/attendance': 'Attendance',
  '/payroll': 'Payroll',
  '/leave': 'Leave',
  '/recruitment': 'Recruitment',
};

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const label = labels[pathname] || 'Page';
  const icon = icons[pathname] || null;

  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">{icon}</div>
      <h2 className="placeholder-title">{label}</h2>
      <p className="placeholder-msg">This module is coming soon.</p>
    </div>
  );
}

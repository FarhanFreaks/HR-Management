import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <span>📊</span>,
  },
  {
    path: '/employee',
    label: 'Employee',
    icon: <span>👨‍💼</span>,
  },
  {
    path: '/attendance',
    label: 'Attendance',
    icon: <span>📅</span>,
  },
  {
    path: '/payroll',
    label: 'Payroll',
    icon: <span>💰</span>,
  },
  {
    path: '/leave',
    label: 'Leave',
    icon: <span>📝</span>,
  },
  {
    path: '/recruitment',
    label: 'Recruitment',
    icon: <span>🧑‍💻</span>,
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-badge">HR</div>
        <div className="logo-text">
          <span className="logo-title">HRConnect</span>
          <span className="logo-subtitle">Management</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? ' active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile at Bottom */}
      <div className="sidebar-footer">
        <div className="sidebar-divider" />
        <button
          className="sidebar-user"
          onClick={() => navigate('/login-info')}
          title="View login information"
        >
          <div className="user-avatar">RK</div>
          <div className="user-info">
            <span className="user-name">Rakesh</span>
            <span className="user-role">HR Admin</span>
          </div>
        </button>
      </div>
    </aside>
  );
}

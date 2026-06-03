import { NavLink, useNavigate } from 'react-router-dom';
import "./Sidebare.css";

const navItems = [
  {
    path: '/employee-dashboard',
    label: 'Dashboard',
    icon: <span>📊</span>,
  },
  {
    path: '/employee-profile',
    label: 'Employee',
    icon: <span>👨‍💼</span>,
  },
  {
    path: '/employee-leave',
    label: 'Leave',
    icon: <span>📝</span>,
  },
  {
    path: '/employee-recruitment',
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
        <div className="logo-badge">EP</div>
        <div className="logo-text">
          <span className="logo-title">Employee</span>
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
          onClick={() => navigate('/emplogin-info')}
          title="View login information"
        >
          <div className="user-avatar">JS</div>
          <div className="user-info">
            <span className="user-name">Jose</span>
            <span className="user-role">Employee</span>
          </div>
        </button>
      </div>
    </aside>
  );
}

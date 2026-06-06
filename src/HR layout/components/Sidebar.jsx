import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';
import { supabase } from '../../config/supabaseClient';

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
  const [profile, setProfile] = useState({
    name: 'Loading...',
    role: 'HR Admin',
    initials: 'HR',
    avatarUrl: null
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, role, avatar_url')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          const name = data.full_name || 'HR Admin';
          const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || 'HR';

          setProfile({
            name: name,
            role: data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : 'HR Admin',
            initials: initials,
            avatarUrl: data.avatar_url
          });
        }
      }
    };
    fetchProfile();
  }, []);

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
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={`${profile.name} avatar`} className="user-avatar-img" />
          ) : (
            <div className="user-avatar">{profile.initials}</div>
          )}
          <div className="user-info">
            <span className="user-name">{profile.name}</span>
            <span className="user-role">{profile.role}</span>
          </div>
        </button>
      </div>
    </aside>
  );
}

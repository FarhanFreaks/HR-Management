import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
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
  const [profile, setProfile] = useState({ full_name: 'Employee', role: 'Employee', initials: 'EP' });

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
          const name = data.full_name || 'Employee';
          const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || 'EP';
            
          setProfile({
            full_name: name,
            role: data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : 'Employee',
            initials,
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
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={`${profile.full_name} avatar`} className="user-avatar-img" />
          ) : (
            <div className="user-avatar">{profile.initials}</div>
          )}
          <div className="user-info">
            <span className="user-name">{profile.full_name}</span>
            <span className="user-role">{profile.role}</span>
          </div>
        </button>
      </div>
    </aside>
  );
}

import { useState, useEffect } from 'react';
import '../styles/Logininfoe.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';

export default function LoginInfo() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: 'Loading...',
    role: 'Employee',
    id: 'Loading...',
    email: 'Loading...',
    initials: 'EP',
    avatarUrl: null
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('employees')
          .select(`
            emp_id,
            profiles (full_name, role, avatar_url)
          `)
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (data) {
          const profileData = data.profiles || {};
          const name = profileData.full_name || 'Employee';
          const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || 'EP';

          setProfile({
            name: name,
            role: profileData.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : 'Employee',
            id: data.emp_id || 'EMP-XXX',
            email: session.user.email || 'No email',
            initials: initials,
            avatarUrl: profileData.avatar_url
          });
        } else {
          // Fallback
          const { data: fallbackData } = await supabase
            .from('profiles')
            .select('full_name, role, avatar_url')
            .eq('id', session.user.id)
            .maybeSingle();

          if (fallbackData) {
            const shortId = session.user.id.substring(0, 8).toUpperCase();
            const name = fallbackData.full_name || 'Employee';
            const initials = name
              .split(' ')
              .map(n => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase() || 'EP';

            setProfile({
              name: name,
              role: fallbackData.role ? fallbackData.role.charAt(0).toUpperCase() + fallbackData.role.slice(1) : 'Employee',
              id: `EMP-${shortId}`,
              email: session.user.email || 'No email',
              initials: initials,
              avatarUrl: fallbackData.avatar_url
            });
          }
        }
      }
    };
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/quick-actions');
  };

  return (
    <div className="login-info-wrapper">
      <div className="login-info-card">
        <h2 className="card-heading">Login Information</h2>

        {/* User profile row */}
        <div className="profile-row">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={`${profile.name} avatar`} className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar">{profile.initials}</div>
          )}
          <div className="profile-details">
            <span className="profile-name">{profile.name}</span>
            <span className="profile-role">{profile.role}</span>
          </div>
        </div>

        {/* Fields */}
        <div className="info-field">
          <label className="field-label">EMPLOYEE ID</label>
          <div className="field-value">{profile.id}</div>
        </div>

        <div className="info-field">
          <label className="field-label">EMAIL ADDRESS</label>
          <div className="field-value">{profile.email}</div>
        </div>

        {/* Sign out */}
        <button className="signout-btn" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

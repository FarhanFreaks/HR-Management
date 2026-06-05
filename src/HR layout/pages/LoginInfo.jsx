import { useState, useEffect } from 'react';
import '../styles/Logininfo.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient'; 

export default function LoginInfo() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: 'Loading...',
    role: 'HR Admin',
    id: 'Loading...',
    email: 'Loading...',
    initials: 'HR'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          const shortId = session.user.id.substring(0, 8).toUpperCase();
          const name = data.full_name || 'HR Admin';
          const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || 'HR';

          let empId = `HR-${shortId}`;
          const { data: empData } = await supabase
            .from('employees')
            .select('emp_id')
            .eq('id', session.user.id)
            .single();

          if (empData && empData.emp_id) {
            empId = empData.emp_id;
          }

          setProfile({
            name: name,
            role: data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : 'HR Admin',
            id: empId,
            email: session.user.email || 'No email',
            initials: initials
          });
        }
      }
    };
    fetchProfile();
  }, []);

  // 2. CREATE A REAL LOGOUT FUNCTION
  const handleSignOut = async () => {
    // This wipes the session from the browser and triggers the redirect in App.jsx
    await supabase.auth.signOut(); 
    navigate('/quick-actions');
  };

  return (
    <div className="login-info-wrapper">
      <div className="login-info-card">
        <h2 className="card-heading">Login Information</h2>

        <div className="profile-row">
          <div className="profile-avatar">{profile.initials}</div>
          <div className="profile-details">
            <span className="profile-name">{profile.name}</span>
            <span className="profile-role">{profile.role}</span>
          </div>
        </div>

        <div className="info-field">
          <label className="field-label">EMPLOYEE ID</label>
          <div className="field-value">{profile.id}</div>
        </div>

        <div className="info-field">
          <label className="field-label">EMAIL ADDRESS</label>
          <div className="field-value">{profile.email}</div>
        </div>

        {/* 3. ATTACH THE REAL LOGOUT FUNCTION */}
        <button className="signout-btn" onClick={handleSignOut}>Sign Out</button>
      </div>
    </div>
  );
}
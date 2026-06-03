import '../styles/Logininfo.css';
import { useNavigate } from 'react-router-dom';

export default function LoginInfo() {
  const navigate = useNavigate();

  return (
    <div className="login-info-wrapper">
      <div className="login-info-card">
        <h2 className="card-heading">Login Information</h2>

        {/* User profile row */}
        <div className="profile-row">
          <div className="profile-avatar">RK</div>
          <div className="profile-details">
            <span className="profile-name">Rakesh</span>
            <span className="profile-role">HR Admin</span>
          </div>
        </div>

        {/* Fields */}
        <div className="info-field">
          <label className="field-label">EMPLOYEE ID</label>
          <div className="field-value">HR001</div>
        </div>

        <div className="info-field">
          <label className="field-label">EMAIL ADDRESS</label>
          <div className="field-value">rakesh.admin@hrconnect.com</div>
        </div>

        {/* Sign out */}
        <button className="signout-btn" onClick={() => navigate('/login')}>Sign Out</button>
      </div>
    </div>
  );
}

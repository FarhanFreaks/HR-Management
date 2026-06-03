import React from "react";

const statusColors = {
  Screening:  { bg: "#eff6ff", text: "#1d4ed8" },
  Assessment: { bg: "#f5f3ff", text: "#7c3aed" },
  Interview:  { bg: "#ecfeff", text: "#0e7490" },
  Offer:      { bg: "#fef9c3", text: "#a16207" },
  Hired:      { bg: "#dcfce7", text: "#15803d" },
  Rejected:   { bg: "#fee2e2", text: "#dc2626" },
};

const CandidateProfile = ({ candidate, onClose }) => {
  const status = statusColors[candidate.status] || statusColors.Screening;

  return (
    <div className="profile-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="profile-modal">

        {/* Header */}
        <div className="profile-header">
          <div className="profile-header-left">
            <div
              className="profile-avatar-xl"
              style={{ background: candidate.avatarBg, color: candidate.avatarText }}
            >
              {candidate.initials}
            </div>
            <div>
              <h2 className="profile-name">{candidate.name}</h2>
              <p className="profile-role">{candidate.role} — {candidate.department}</p>
              <p className="profile-email">✉ {candidate.email} &nbsp;|&nbsp; 📞 {candidate.phone}</p>
            </div>
          </div>
          <div className="profile-header-right">
            <span
              className="profile-status-badge"
              style={{ background: status.bg, color: status.text }}
            >
              {candidate.status}
            </span>
            <button className="profile-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="profile-body">

          {/* Score */}
          <div className="profile-score-box">
            <div className="profile-score-circle">{candidate.score}</div>
            <div>
              <p className="profile-score-title">Match Score</p>
              <p className="profile-score-sub">Based on skills & experience</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="profile-info-grid">
            <div><span>Experience</span><strong>{candidate.experience}</strong></div>
            <div><span>Location</span><strong>{candidate.location}</strong></div>
            <div><span>Education</span><strong>{candidate.education}</strong></div>
            <div><span>Applied Date</span><strong>{candidate.appliedDate}</strong></div>
            <div><span>Applied For</span><strong>{candidate.appliedFor}</strong></div>
            <div><span>Expected Salary</span><strong>{candidate.expectedSalary}</strong></div>
          </div>

          {/* Skills */}
          <div className="profile-section">
            <h4>Skills</h4>
            <div className="profile-skills">
              {candidate.skills.map((s) => (
                <span key={s} className="profile-skill-tag">{s}</span>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="profile-section">
            <h4>About</h4>
            <p className="profile-about">{candidate.about}</p>
          </div>

          {/* Interview Notes */}
          {candidate.notes && (
            <div className="profile-section">
              <h4>Interview Notes</h4>
              <p className="profile-notes">{candidate.notes}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="profile-footer">
          <button className="profile-btn-reject">✕ Reject</button>
          <button className="profile-btn-schedule">📅 Schedule Interview</button>
          <button className="profile-btn-advance">✓ Move to Next Stage</button>
        </div>

      </div>
    </div>
  );
};

export default CandidateProfile;
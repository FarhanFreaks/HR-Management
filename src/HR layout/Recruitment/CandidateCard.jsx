import React from "react";

const statusColors = {
  Screening:  { bg: "#eff6ff", text: "#1d4ed8" },
  Assessment: { bg: "#f5f3ff", text: "#7c3aed" },
  Interview:  { bg: "#ecfeff", text: "#0e7490" },
  Offer:      { bg: "#fef9c3", text: "#a16207" },
  Hired:      { bg: "#dcfce7", text: "#15803d" },
  Rejected:   { bg: "#fee2e2", text: "#dc2626" },
};

const CandidateCard = ({ candidate, onView }) => {
  const status = statusColors[candidate.status] || statusColors.Screening;

  return (
    <div className="cand-card" onClick={() => onView(candidate)}>

      {/* Top */}
      <div className="cand-card-top">
        <div
          className="cand-avatar-lg"
          style={{ background: candidate.avatarBg, color: candidate.avatarText }}
        >
          {candidate.initials}
        </div>
        <div className="cand-card-info">
          <h3 className="cand-card-name">{candidate.name}</h3>
          <p className="cand-card-role">{candidate.role}</p>
          <p className="cand-card-email">✉ {candidate.email}</p>
        </div>
        <div
          className="cand-status-badge"
          style={{ background: status.bg, color: status.text }}
        >
          {candidate.status}
        </div>
      </div>

      {/* Meta */}
      <div className="cand-card-meta">
        <span>🏢 {candidate.department}</span>
        <span>💼 {candidate.experience}</span>
        <span>📍 {candidate.location}</span>
        <span>📅 Applied: {candidate.appliedDate}</span>
      </div>

      {/* Skills */}
      <div className="cand-skills">
        {candidate.skills.slice(0, 4).map((s) => (
          <span key={s} className="cand-skill-tag">{s}</span>
        ))}
        {candidate.skills.length > 4 && (
          <span className="cand-skill-more">+{candidate.skills.length - 4}</span>
        )}
      </div>

      {/* Footer */}
      <div className="cand-card-footer">
        <div className="cand-score-row">
          <span className="cand-score-label">Match Score</span>
          <div className="cand-score-bar-bg">
            <div
              className="cand-score-bar-fill"
              style={{ width: `${candidate.score}%` }}
            />
          </div>
          <span className="cand-score-value">{candidate.score}</span>
        </div>
        <button className="cand-view-btn" onClick={(e) => { e.stopPropagation(); onView(candidate); }}>
          View Profile →
        </button>
      </div>

    </div>
  );
};

export default CandidateCard;
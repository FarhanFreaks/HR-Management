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
  const currentStatus = candidate.status || "Screening";
  const status = statusColors[currentStatus] || statusColors.Screening;

  const bgAvatar = candidate.avatar_bg || candidate.avatarBg || "#bfdbfe";
  const txtAvatar = candidate.avatar_text || candidate.avatarText || "#1e40af";
  const dateApplied = candidate.applied_date || candidate.appliedDate || "N/A";
  const matchScore = candidate.score !== undefined ? candidate.score : 0;
  const skillsArray = candidate.skills || [];

  const initialsFallback = candidate.initials || (candidate.name ? candidate.name.split(" ").map(n => n[0]).join("").toUpperCase() : "??");

  return (
    <div className="cand-card" onClick={() => onView(candidate)}>
      <div className="cand-card-top">
        <div
          className="cand-avatar-lg"
          style={{ background: bgAvatar, color: txtAvatar }}
        >
          {initialsFallback}
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
          {currentStatus}
        </div>
      </div>

      <div className="cand-card-meta">
        <span>🏢 {candidate.department}</span>
        <span>💼 {candidate.experience}</span>
        <span>📍 {candidate.location}</span>
        <span>📅 Applied: {dateApplied}</span>
      </div>

      <div className="cand-skills">
        {skillsArray.slice(0, 4).map((s) => (
          <span key={s} className="cand-skill-tag">{s}</span>
        ))}
        {skillsArray.length > 4 && (
          <span className="cand-skill-more">+{skillsArray.length - 4}</span>
        )}
      </div>

      <div className="cand-card-footer">
        <div className="cand-score-row">
          <span className="cand-score-label">Match Score</span>
          <div className="cand-score-bar-bg">
            <div
              className="cand-score-bar-fill"
              style={{ width: `${matchScore}%` }}
            />
          </div>
          <span className="cand-score-value">{matchScore}</span>
        </div>
        <button className="cand-view-btn" onClick={(e) => { e.stopPropagation(); onView(candidate); }}>
          View Profile →
        </button>
      </div>
    </div>
  );
};

export default CandidateCard;
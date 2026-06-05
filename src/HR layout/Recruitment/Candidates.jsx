import React from "react";

const Candidates = ({ candidates = [] }) => {
  const top3 = [...candidates]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 3);

  return (
    <div className="candidates-card">
      <h3>Top Candidates</h3>
      <div className="candidates-list">
        {top3.map((c, index) => {
          const bgAvatar = c.avatar_bg || c.avatarBg || "#e9d5ff";
          const txtAvatar = c.avatar_text || c.avatarText || "#6b21a8";
          const bgBadge = c.badge_bg || c.badgeBg || "#f0fdf4";
          const txtBadge = c.badge_text || c.badgeText || "#15803d";
          const initials = c.initials || (c.name ? c.name.split(" ").map(n => n[0]).join("").toUpperCase() : "??");

          return (
            <div className="candidate-row" key={c.id}>
              <span className="candidate-rank">#{index + 1}</span>
              <div className="candidate-avatar" style={{ background: bgAvatar, color: txtAvatar }}>
                {initials}
              </div>
              <div className="candidate-info">
                <p className="candidate-name">{c.name}</p>
                <p className="candidate-role">{c.role}</p>
              </div>
              <div className="candidate-score" style={{ background: "#dcfce7", color: "#15803d" }}>
                {c.score || 0}
              </div>
              <div className="candidate-badge" style={{ background: bgBadge, color: txtBadge }}>
                {c.status || "Screening"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Candidates;
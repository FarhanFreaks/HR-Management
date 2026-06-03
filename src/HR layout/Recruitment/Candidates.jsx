import React from "react";

const candidates = [
  {
    rank: 1,
    initials: "RD",
    name: "Rohini Das",
    role: "Product Designer",
    score: 92,
    status: "Offer",
    avatarBg: "#fde68a",
    avatarText: "#92400e",
    badgeBg: "#fef9c3",
    badgeText: "#a16207",
  },
  {
    rank: 2,
    initials: "SI",
    name: "Snega Iyer",
    role: "React Developer",
    score: 88,
    status: "Interview",
    avatarBg: "#bfdbfe",
    avatarText: "#1e40af",
    badgeBg: "#eff6ff",
    badgeText: "#1d4ed8",
  },
  {
    rank: 3,
    initials: "PR",
    name: "Pooja Reddy",
    role: "Data Scientist",
    score: 81,
    status: "Hired",
    avatarBg: "#e9d5ff",
    avatarText: "#6b21a8",
    badgeBg: "#f0fdf4",
    badgeText: "#15803d",
  },
];

const Candidates = () => {
  return (
    <div className="candidates-card">
      <h3>Top Candidates</h3>
      <div className="candidates-list">
        {candidates.map((c) => (
          <div className="candidate-row" key={c.rank}>
            <span className="candidate-rank">#{c.rank}</span>
            <div
              className="candidate-avatar"
              style={{ background: c.avatarBg, color: c.avatarText }}
            >
              {c.initials}
            </div>
            <div className="candidate-info">
              <p className="candidate-name">{c.name}</p>
              <p className="candidate-role">{c.role}</p>
            </div>
            <div
              className="candidate-score"
              style={{ background: "#dcfce7", color: "#15803d" }}
            >
              {c.score}
            </div>
            <div
              className="candidate-badge"
              style={{ background: c.badgeBg, color: c.badgeText }}
            >
              {c.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Candidates;

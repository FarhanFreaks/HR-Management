import React from "react";

const interviewCandidates = [
  { id: 1, name: "Rohini Das", role: "Product Designer", score: 92, date: "2026-06-01", round: "Round 1" },
  { id: 2, name: "Snega Iyer", role: "React Developer",  score: 88, date: "2026-06-02", round: "Round 2" },
];

function Interview() {
  return (
    <div className="pipeline-stage-content">
      <h3>Interview <span className="stage-badge">{interviewCandidates.length}</span></h3>
      <div className="candidate-list">
        {interviewCandidates.map((c) => (
          <div key={c.id} className="candidate-item">
            <div className="candidate-avatar avatar-interview">
              {c.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="candidate-info">
              <span className="candidate-name">{c.name}</span>
              <span className="candidate-role">{c.role}</span>
              <span className="interview-date">📅 {c.date} — {c.round}</span>
            </div>
            <div className="candidate-meta">
              <div className="score-bubble">{c.score}</div>
              <span className="stage-tag interview">Interview</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Interview;
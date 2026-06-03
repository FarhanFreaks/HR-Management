import React from "react";

const appliedCandidates = [
  { id: 1, name: "Rohini Das",  role: "Product Designer", score: 92 },
  { id: 2, name: "Snega Iyer",  role: "React Developer",  score: 88 },
  { id: 3, name: "Pooja Reddy", role: "Data Scientist",   score: 81 },
  { id: 4, name: "Arjun Mehta", role: "UI/UX Designer",   score: 76 },
];

function Applied() {
  return (
    <div className="pipeline-stage-content">
      <h3>Applied <span className="stage-badge">{appliedCandidates.length}</span></h3>
      <div className="candidate-list">
        {appliedCandidates.map((c) => (
          <div key={c.id} className="candidate-item">
            <div className="candidate-avatar avatar-applied">
              {c.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="candidate-info">
              <span className="candidate-name">{c.name}</span>
              <span className="candidate-role">{c.role}</span>
            </div>
            <div className="candidate-meta">
              <div className="score-bubble">{c.score}</div>
              <span className="stage-tag applied">Applied</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Applied;
import React from "react";

const screeningCandidates = [
  { id: 1, name: "Rohini Das", role: "Product Designer", score: 92, status: "Pending" },
  { id: 2, name: "Snega Iyer", role: "React Developer",  score: 88, status: "Cleared" },
];

function Screening() {
  return (
    <div className="pipeline-stage-content">
      <h3>Screening <span className="stage-badge">{screeningCandidates.length}</span></h3>
      <div className="candidate-list">
        {screeningCandidates.map((c) => (
          <div key={c.id} className="candidate-item">
            <div className="candidate-avatar avatar-screening">
              {c.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="candidate-info">
              <span className="candidate-name">{c.name}</span>
              <span className="candidate-role">{c.role}</span>
            </div>
            <div className="candidate-meta">
              <div className="score-bubble">{c.score}</div>
              <span className={`stage-tag ${c.status.toLowerCase()}`}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Screening;
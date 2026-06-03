import React from "react";

const selectedCandidates = [
  { id: 1, name: "Rohini Das",  role: "Product Designer", score: 92, status: "Offer" },
  { id: 2, name: "Pooja Reddy", role: "Data Scientist",   score: 81, status: "Hired" },
];

function Selected() {
  return (
    <div className="pipeline-stage-content">
      <h3>Selected <span className="stage-badge">{selectedCandidates.length}</span></h3>
      <div className="candidate-list">
        {selectedCandidates.map((c) => (
          <div key={c.id} className="candidate-item">
            <div className="candidate-avatar avatar-selected">
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

export default Selected;
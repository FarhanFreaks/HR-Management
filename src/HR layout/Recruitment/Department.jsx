import React from "react";

const Department = ({ departments }) => {
  return (
    <div className="department-card">
      <h3>Open positions by department</h3>
      <div className="department-list">
        {departments.map((d) => (
          <div className="dept-chip" key={d.name} style={{ background: d.bg, color: d.text }}>
            <span className="dept-name">{d.name}</span>
            <span className="dept-count">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Department;
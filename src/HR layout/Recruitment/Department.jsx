import React from "react";

const departments = [
  { name: "Engineering", count: 2, bg: "#fce7f3", text: "#be185d" },
  { name: "Product",     count: 0, bg: "#ccfbf1", text: "#0f766e" },
  { name: "Design",      count: 1, bg: "#fef9c3", text: "#a16207" },
  { name: "Analytics",   count: 0, bg: "#fce7f3", text: "#be185d" },
  { name: "HR",          count: 1, bg: "#eff6ff", text: "#1d4ed8" },
  { name: "Finance",     count: 2, bg: "#fef3c7", text: "#d97706" },
  { name: "Marketing",   count: 1, bg: "#ede9fe", text: "#7c3aed" },
  { name: "Sales",       count: 3, bg: "#dcfce7", text: "#15803d" },
  { name: "Operations",  count: 0, bg: "#ffedd5", text: "#c2410c" },
  { name: "Legal",       count: 1, bg: "#e0f2fe", text: "#0369a1" },
];
const Department = () => {
  return (
    <div className="department-card">
      <h3>Open positions by department</h3>
      <div className="department-list">
        {departments.map((d) => (
          <div
            className="dept-chip"
            key={d.name}
            style={{ background: d.bg, color: d.text }}
          >
            <span className="dept-name">{d.name}</span>
            <span className="dept-count">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Department;

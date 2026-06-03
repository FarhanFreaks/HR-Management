import React from "react";

const DEPARTMENTS = ["All", "Engineering", "Product", "Design", "Analytics", "HR", "Finance", "Marketing"];
const STATUSES = ["All", "Screening", "Assessment", "Interview", "Offer", "Hired", "Rejected"];
const EXPERIENCES = ["All", "0-1 year", "1-3 years", "3-5 years", "5+ years"];

const CandidateFilter = ({ filters, setFilters }) => {
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div className="candidate-filter-bar">
      <input
        type="text"
        className="candidate-search"
        placeholder="🔍 Search by name, role, email..."
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
      />
      <select value={filters.status} onChange={(e) => update("status", e.target.value)}>
        {STATUSES.map((s) => <option key={s}>{s}</option>)}
      </select>
      <select value={filters.department} onChange={(e) => update("department", e.target.value)}>
        {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
      </select>
      <select value={filters.experience} onChange={(e) => update("experience", e.target.value)}>
        {EXPERIENCES.map((e) => <option key={e}>{e}</option>)}
      </select>
    </div>
  );
};

export default CandidateFilter;
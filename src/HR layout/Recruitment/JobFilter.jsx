import React from "react";

const DEPARTMENTS = ["All", "Engineering", "Product", "Design", "Analytics", "HR", "Finance", "Marketing", "Sales"];
const JOB_TYPES = ["All", "Full-time", "Part-time", "Contract", "Internship"];
const WORK_MODES = ["All", "On-site", "Remote", "Hybrid"];
const STATUSES = ["All", "Active", "Closed", "Draft"];

const JobFilter = ({ filters, setFilters }) => {
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div className="job-filter-bar">
      <input
        type="text"
        className="job-search"
        placeholder="🔍 Search by title, department..."
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
      />
      <select value={filters.department} onChange={(e) => update("department", e.target.value)}>
        {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
      </select>
      <select value={filters.jobType} onChange={(e) => update("jobType", e.target.value)}>
        {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
      </select>
      <select value={filters.workMode} onChange={(e) => update("workMode", e.target.value)}>
        {WORK_MODES.map((m) => <option key={m}>{m}</option>)}
      </select>
      <select value={filters.status} onChange={(e) => update("status", e.target.value)}>
        {STATUSES.map((s) => <option key={s}>{s}</option>)}
      </select>
    </div>
  );
};

export default JobFilter;
import { useState } from "react";
import "./RecruitmentModule.css";

const jobs = [
  {
    id: 1,
    title: "Senior React Developer",
    dept: "Engineering",
    deptColor: "#b8f5c8",
    deptText: "#1a7a3a",
    type: "Full-Time (Remote)",
    posted: "13 May",
  },
  {
    id: 2,
    title: "Product Designer",
    dept: "Design",
    deptColor: "#fbc4c4",
    deptText: "#a03030",
    type: "Full-Time (Offline)",
    posted: "8 May",
  },
  {
    id: 3,
    title: "Data Scientist",
    dept: "Analytics",
    deptColor: "#d9d0f7",
    deptText: "#5a3aa0",
    type: "Full-Time (Hyderabad)",
    posted: "3 May",
  },
  {
    id: 4,
    title: "HR Specialist",
    dept: "HR",
    deptColor: "#c4e3fb",
    deptText: "#1a5a8a",
    type: "Full-Time (Chennai)",
    posted: "1 May",
  },
];

const deptCounts = {
  Engineering: 2,
  Product: 0,
  Design: 1,
  Analytics: 0,
  HR: 1,
};

const deptColors = {
  Engineering: "#fde8e8",
  Product: "#d4f5ef",
  Design: "#fef9c3",
  Analytics: "#ede8ff",
  HR: "#dbeafe",
};

const depts = ["All", "Engineering", "Design", "Analytics", "HR"];

export default function RecruitmentModule() {
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = jobs.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase());
    const matchDept = filter === "All" || j.dept === filter;
    return matchSearch && matchDept;
  });

  return (
    <div className="recruitment-container">
     

      <div className="tabs">
        {["overview", "jobopenings"].map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "overview" ? "Overview" : "Job Openings"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="active-card">
            <div className="active-label">Active Openings</div>
            <div className="active-count">4</div>
            <div className="active-subtitle">Currently Hiring</div>
          </div>

          <div className="filters">
            <div className="search-box">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Job..."
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {depts.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="job-grid">
            {filtered.map((job) => (
              <div className="job-card" key={job.id}>
                <h3>{job.title}</h3>

                <span
                  className="dept-badge"
                  style={{
                    background: job.deptColor,
                    color: job.deptText,
                  }}
                >
                  {job.dept}
                </span>

                <p>
                  <strong>Type:</strong> {job.type}
                </p>

                <p>
                  <strong>Posted:</strong> {job.posted}
                </p>
              </div>
            ))}
          </div>

          <div className="department-section">
            <h3>Open positions by department</h3>

            <div className="department-grid">
              {Object.entries(deptCounts).map(([dept, count]) => (
                <div
                  key={dept}
                  className="department-card"
                  style={{ background: deptColors[dept] }}
                >
                  <span>{dept}</span>
                  <h2>{count}</h2>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "jobopenings" && (
        <div className="job-openings-list">
          {jobs.map((job) => (
            <div className="opening-card" key={job.id}>
              <div>
                <h3>{job.title}</h3>

                <span
                  className="dept-badge"
                  style={{
                    background: job.deptColor,
                    color: job.deptText,
                  }}
                >
                  {job.dept}
                </span>
              </div>

              <div className="opening-info">
                <p>{job.type}</p>
                <span>Posted: {job.posted}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
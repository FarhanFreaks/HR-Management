import { useState, useEffect } from "react";
import "./RecruitmentModule.css";
import { supabase } from "../../config/supabaseClient";

const deptColors = {
  Engineering: "#fde8e8",
  Product: "#d4f5ef",
  Design: "#fef9c3",
  Analytics: "#ede8ff",
  HR: "#dbeafe",
};

const deptTextColors = {
  Engineering: "#a03030",
  Product: "#1a7a3a",
  Design: "#a03030",
  Analytics: "#5a3aa0",
  HR: "#1a5a8a",
};

export default function RecruitmentModule() {
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [jobs, setJobs] = useState([]);
  const [deptCounts, setDeptCounts] = useState({});
  const [depts, setDepts] = useState(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_openings')
        .select('*')
        .in('status', ['Active', 'Open']);
        
      if (!error && data) {
        const formattedJobs = data.map(j => {
          const postedDate = new Date(j.posted_date);
          const postedStr = `${postedDate.getDate()} ${postedDate.toLocaleString('default', { month: 'short' })}`;
          
          return {
            id: j.id,
            title: j.title,
            dept: j.department,
            deptColor: deptColors[j.department] || "#f3f4f6", // fallback gray
            deptText: deptTextColors[j.department] || "#374151",
            type: `${j.job_type || 'Full-Time'} (${j.work_mode || 'Remote'})`,
            posted: postedStr
          };
        });
        
        setJobs(formattedJobs);
        
        const counts = {};
        const uniqueDepts = new Set(["All"]);
        formattedJobs.forEach(j => {
          counts[j.dept] = (counts[j.dept] || 0) + 1;
          uniqueDepts.add(j.dept);
        });
        
        setDeptCounts(counts);
        setDepts(Array.from(uniqueDepts));
      }
      setLoading(false);
    };
    
    fetchJobs();
  }, []);

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
            <div className="active-count">{jobs.length}</div>
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
            {loading ? (
              <p style={{ padding: "20px" }}>Loading active jobs...</p>
            ) : filtered.length === 0 ? (
              <p style={{ padding: "20px" }}>No jobs found.</p>
            ) : (
              filtered.map((job) => (
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
              ))
            )}
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
          {loading ? (
            <p style={{ padding: "20px" }}>Loading...</p>
          ) : jobs.length === 0 ? (
            <p style={{ padding: "20px" }}>No job openings currently available.</p>
          ) : (
            jobs.map((job) => (
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
            ))
          )}
        </div>
      )}
    </div>
  );
}
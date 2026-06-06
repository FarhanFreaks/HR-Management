import { useState, useEffect } from "react";
import "./RecruitmentModule.css";
import { supabase } from "../../config/supabaseClient";
import { 
  FaBriefcase, 
  FaMapMarkerAlt, 
  FaClock, 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaUserTie, 
  FaSearch, 
  FaBuilding,
  FaTimes
} from "react-icons/fa";

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
  const [selectedJob, setSelectedJob] = useState(null);

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
          const postedDate = new Date(j.posted_date || j.created_at || new Date());
          const postedStr = `${postedDate.getDate()} ${postedDate.toLocaleString('default', { month: 'short' })}`;
          
          return {
            ...j,
            id: j.id,
            title: j.title,
            dept: j.department,
            deptColor: deptColors[j.department] || "#f1f5f9", // fallback gray
            deptText: deptTextColors[j.department] || "#475569",
            type: `${j.job_type || 'Full-Time'}`,
            workMode: j.work_mode || 'Remote',
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
      <div className="recruitment-header">
        <h1 className="page-title">Internal Careers</h1>
        <div className="header-divider"></div>
        <p className="page-subtitle">Discover and apply for opportunities within the organization</p>
      </div>

      <div className="tabs">
        {["overview", "jobopenings"].map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "overview" ? "Dashboard" : "All Opportunities"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="active-card">
            <div className="active-label">Current Opportunities</div>
            <div className="active-count">{jobs.length}</div>
            <div className="active-subtitle">Active roles across the organization</div>
          </div>

          <div className="filters">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job titles..."
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {depts.map((d) => (
                <option key={d}>{d === "All" ? "All Departments" : d}</option>
              ))}
            </select>
          </div>

          <div className="job-grid">
            {loading ? (
              <p style={{ padding: "20px" }}>Loading active jobs...</p>
            ) : filtered.length === 0 ? (
              <p style={{ padding: "20px" }}>No jobs found matching your criteria.</p>
            ) : (
              filtered.map((job) => (
                <div className="job-card" key={job.id} onClick={() => setSelectedJob(job)}>
                  <span
                    className="dept-badge"
                    style={{ background: job.deptColor, color: job.deptText }}
                  >
                    {job.dept}
                  </span>
                  
                  <h3>{job.title}</h3>

                  <div className="job-meta">
                    <div className="job-meta-item">
                      <FaBriefcase className="job-meta-icon" />
                      {job.type}
                    </div>
                    <div className="job-meta-item">
                      <FaMapMarkerAlt className="job-meta-icon" />
                      {job.workMode}
                    </div>
                    <div className="job-meta-item">
                      <FaClock className="job-meta-icon" />
                      Posted: {job.posted}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="department-section">
            <h3>Opportunities by Department</h3>
            <div className="department-grid">
              {Object.entries(deptCounts).map(([dept, count]) => (
                <div
                  key={dept}
                  className="department-card"
                  style={{ background: deptColors[dept] || "#f1f5f9", color: deptTextColors[dept] || "#475569" }}
                  onClick={() => { setFilter(dept); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
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
            <p style={{ padding: "20px" }}>No opportunities currently available.</p>
          ) : (
            jobs.map((job) => (
            <div className="opening-card" key={job.id} onClick={() => setSelectedJob(job)}>
              <div>
                <span
                  className="dept-badge"
                  style={{ background: job.deptColor, color: job.deptText }}
                >
                  {job.dept}
                </span>
                <h3>{job.title}</h3>
              </div>

              <div className="opening-info">
                <div className="opening-info-item">
                  <FaBriefcase className="job-meta-icon" />
                  {job.type}
                </div>
                <div className="opening-info-item">
                  <FaMapMarkerAlt className="job-meta-icon" />
                  {job.workMode}
                </div>
                <div className="opening-info-item">
                  <FaClock className="job-meta-icon" />
                  {job.posted}
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      )}

      {selectedJob && (
        <div className="emp-job-view-overlay" onClick={() => setSelectedJob(null)}>
          <div className="emp-job-view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="emp-job-view-header">
              <h2>{selectedJob.title}</h2>
              <button className="emp-close-btn" onClick={() => setSelectedJob(null)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="emp-job-view-body">
              <div className="emp-job-summary-box">
                <div className="summary-item">
                  <span className="summary-label"><FaBuilding /> Department</span>
                  <span className="summary-value">{selectedJob.department}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label"><FaBriefcase /> Job Type</span>
                  <span className="summary-value">{selectedJob.job_type || selectedJob.type}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label"><FaMapMarkerAlt /> Work Mode</span>
                  <span className="summary-value">{selectedJob.work_mode || "On-site"}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label"><FaMoneyBillWave /> Salary</span>
                  <span className="summary-value">
                    {selectedJob.currency || "INR"} {Number(selectedJob.salary_min).toLocaleString()} – {Number(selectedJob.salary_max).toLocaleString()}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label"><FaCalendarAlt /> Deadline</span>
                  <span className="summary-value">{selectedJob.deadline || "Not specified"}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label"><FaUserTie /> Hiring Manager</span>
                  <span className="summary-value">{selectedJob.hiring_manager || "HR Team"}</span>
                </div>
              </div>
              
              <div className="emp-job-details-text">
                {selectedJob.description && (
                  <div className="emp-job-section">
                    <h4>Description</h4>
                    <p>{selectedJob.description}</p>
                  </div>
                )}
                {selectedJob.responsibilities && (
                  <div className="emp-job-section">
                    <h4>Responsibilities</h4>
                    {Array.isArray(selectedJob.responsibilities) ? (
                      <ul>
                        {selectedJob.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    ) : (
                      <p style={{whiteSpace: 'pre-line'}}>{selectedJob.responsibilities}</p>
                    )}
                  </div>
                )}
                {selectedJob.skills && (
                  <div className="emp-job-section">
                    <h4>Required Skills</h4>
                    <div className="emp-job-skills">
                      {Array.isArray(selectedJob.skills)
                        ? selectedJob.skills.map((s, i) => <span className="skill-tag" key={i}>{s}</span>)
                        : String(selectedJob.skills).split(',').map((s, i) => s.trim() && <span className="skill-tag" key={i}>{s.trim()}</span>)
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="emp-job-view-footer">
              <button className="emp-apply-btn" onClick={() => {
                alert("Application submitted successfully!");
                setSelectedJob(null);
              }}>
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
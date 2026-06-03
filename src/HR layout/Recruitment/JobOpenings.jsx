import React, { useState } from "react";
import JobFilter from "./JobFilter";
import JobCard from "./JobCard";
import "./JobOpenings.css";

const INITIAL_JOBS = [
  {
    id: 1,
    title: "Senior React Developer",
    department: "Engineering",
    jobType: "Full-time",
    workMode: "On-site",
    experience: "3-5 years",
    openings: 2,
    salaryMin: 600000,
    salaryMax: 900000,
    currency: "INR",
    deadline: "30 Jun 2026",
    status: "Active",
    applicants: 8,
    hiringManager: "Rakesh",
  },
  {
    id: 2,
    title: "UI/UX Designer",
    department: "Design",
    jobType: "Full-time",
    workMode: "Hybrid",
    experience: "1-3 years",
    openings: 1,
    salaryMin: 400000,
    salaryMax: 700000,
    currency: "INR",
    deadline: "15 Jul 2026",
    status: "Active",
    applicants: 5,
    hiringManager: "Priya",
  },
  {
    id: 3,
    title: "Data Scientist",
    department: "Analytics",
    jobType: "Full-time",
    workMode: "Remote",
    experience: "3-5 years",
    openings: 1,
    salaryMin: 700000,
    salaryMax: 1200000,
    currency: "INR",
    deadline: "10 Jul 2026",
    status: "Active",
    applicants: 12,
    hiringManager: "Suresh",
  },
  {
    id: 4,
    title: "HR Executive",
    department: "HR",
    jobType: "Full-time",
    workMode: "On-site",
    experience: "0-1 year",
    openings: 1,
    salaryMin: 250000,
    salaryMax: 400000,
    currency: "INR",
    deadline: "20 Jun 2026",
    status: "Active",
    applicants: 3,
    hiringManager: "Rakesh",
  },
  {
    id: 5,
    title: "Node.js Backend Developer",
    department: "Engineering",
    jobType: "Contract",
    workMode: "Remote",
    experience: "1-3 years",
    openings: 1,
    salaryMin: 500000,
    salaryMax: 800000,
    currency: "INR",
    deadline: "05 Jun 2026",
    status: "Closed",
    applicants: 15,
    hiringManager: "Suresh",
  },
  {
    id: 6,
    title: "Marketing Analyst",
    department: "Marketing",
    jobType: "Full-time",
    workMode: "Hybrid",
    experience: "1-3 years",
    openings: 2,
    salaryMin: 350000,
    salaryMax: 550000,
    currency: "INR",
    deadline: "01 Aug 2026",
    status: "Draft",
    applicants: 0,
    hiringManager: "Meena",
  },
];

const JobOpenings = () => {
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [filters, setFilters] = useState({
    search: "",
    department: "All",
    jobType: "All",
    workMode: "All",
    status: "All",
  });
  const [selectedJob, setSelectedJob] = useState(null);

  // Filter logic
  const filtered = jobs.filter((j) => {
    const s = filters.search.toLowerCase();
    return (
      (s === "" || j.title.toLowerCase().includes(s) || j.department.toLowerCase().includes(s)) &&
      (filters.department === "All" || j.department === filters.department) &&
      (filters.jobType === "All" || j.jobType === filters.jobType) &&
      (filters.workMode === "All" || j.workMode === filters.workMode) &&
      (filters.status === "All" || j.status === filters.status)
    );
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
    }
  };

  const handleEdit = (job) => {
    alert(`Edit job: ${job.title}\n(Connect to your edit form here)`);
  };

  const handleView = (job) => {
    setSelectedJob(job);
  };

  // Stats
  const total  = jobs.length;
  const active = jobs.filter((j) => j.status === "Active").length;
  const closed = jobs.filter((j) => j.status === "Closed").length;
  const draft  = jobs.filter((j) => j.status === "Draft").length;

  return (
    <div className="job-openings-wrapper">

      {/* Stats Row */}
      <div className="job-stats-row">
        <div className="job-stat-card">
          <span className="job-stat-value">{total}</span>
          <span className="job-stat-label">Total Posted</span>
        </div>
        <div className="job-stat-card">
          <span className="job-stat-value active">{active}</span>
          <span className="job-stat-label">Active</span>
        </div>
        <div className="job-stat-card">
          <span className="job-stat-value closed">{closed}</span>
          <span className="job-stat-label">Closed</span>
        </div>
        <div className="job-stat-card">
          <span className="job-stat-value draft">{draft}</span>
          <span className="job-stat-label">Draft</span>
        </div>
      </div>

      {/* Filter Bar */}
      <JobFilter filters={filters} setFilters={setFilters} />

      {/* Results count */}
      <p className="job-results-count">
        Showing <strong>{filtered.length}</strong> of <strong>{total}</strong> jobs
      </p>

      {/* Job Cards Grid */}
      {filtered.length > 0 ? (
        <div className="job-cards-grid">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      ) : (
        <div className="job-empty-state">
          <div className="empty-icon">📂</div>
          <h3>No jobs found</h3>
          <p>Try changing your filters or search term</p>
        </div>
      )}

      {/* View Modal */}
      {selectedJob && (
        <div className="job-view-overlay" onClick={() => setSelectedJob(null)}>
          <div className="job-view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="job-view-header">
              <h2>{selectedJob.title}</h2>
              <button onClick={() => setSelectedJob(null)}>✕</button>
            </div>
            <div className="job-view-body">
              <div className="job-view-grid">
                <div><span>Department</span><strong>{selectedJob.department}</strong></div>
                <div><span>Job Type</span><strong>{selectedJob.jobType}</strong></div>
                <div><span>Work Mode</span><strong>{selectedJob.workMode}</strong></div>
                <div><span>Experience</span><strong>{selectedJob.experience}</strong></div>
                <div><span>Openings</span><strong>{selectedJob.openings}</strong></div>
                <div><span>Applicants</span><strong>{selectedJob.applicants}</strong></div>
                <div><span>Salary</span><strong>{selectedJob.currency} {Number(selectedJob.salaryMin).toLocaleString()} – {Number(selectedJob.salaryMax).toLocaleString()}</strong></div>
                <div><span>Deadline</span><strong>{selectedJob.deadline}</strong></div>
                <div><span>Status</span><strong>{selectedJob.status}</strong></div>
                <div><span>Hiring Manager</span><strong>{selectedJob.hiringManager}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JobOpenings;
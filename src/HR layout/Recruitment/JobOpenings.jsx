import React, { useState } from "react";
import JobFilter from "./JobFilter";
import JobCard from "./JobCard";
import PostJobModal from "./PostJobModal";
import { supabase } from "../../config/supabaseClient";
import "./JobOpenings.css";

const JobOpenings = ({ jobOpenings, setJobOpenings }) => {
  const [filters, setFilters] = useState({
    search: "", department: "All", jobType: "All", workMode: "All", status: "All",
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);

  const filtered = jobOpenings.filter((j) => {
    const s = filters.search.toLowerCase();
    // Normalize fields mapped from backend safely
    const title = j.title || "";
    const department = j.department || "";
    const jobType = j.job_type || j.jobType || "";
    const workMode = j.work_mode || j.workMode || "";
    const status = j.status || "";

    return (
      (s === "" || title.toLowerCase().includes(s) || department.toLowerCase().includes(s)) &&
      (filters.department === "All" || department === filters.department) &&
      (filters.jobType === "All" || jobType === filters.jobType) &&
      (filters.workMode === "All" || workMode === filters.workMode) &&
      (filters.status === "All" || status === filters.status)
    );
  });

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job from database?")) {
      try {
        const { error } = await supabase
          .from("job_openings")
          .delete()
          .eq("id", id);

        if (error) throw error;
        setJobOpenings((prev) => prev.filter((j) => j.id !== id));
      } catch (error) {
        alert("Error executing delete command: " + error.message);
      }
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
  };

  const handleView = (job) => {
    setSelectedJob(job);
  };

  const total  = jobOpenings.length;
  const active = jobOpenings.filter((j) => j.status === "Active").length;
  const closed = jobOpenings.filter((j) => j.status === "Closed").length;
  const draft  = jobOpenings.filter((j) => j.status === "Draft").length;

  return (
    <div className="job-openings-wrapper">
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

      <JobFilter filters={filters} setFilters={setFilters} />

      <p className="job-results-count">
        Showing <strong>{filtered.length}</strong> of <strong>{total}</strong> jobs
      </p>

      {filtered.length > 0 ? (
        <div className="job-cards-grid">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              // Normalizing data format for legacy frontend design inside card
              job={{
                ...job,
                jobType: job.job_type || job.jobType,
                workMode: job.work_mode || job.workMode,
                salaryMin: job.salary_min || job.salaryMin,
                salaryMax: job.salary_max || job.salaryMax,
              }}
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

      {selectedJob && (
        <div className="job-view-overlay" onClick={() => setSelectedJob(null)}>
          <div className="job-view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="job-view-header">
              <h2>{selectedJob.title}</h2>
              <div style={{display: 'flex', gap: '8px'}}>
                <button 
                  style={{width: 'auto', padding: '0 12px', background: 'var(--accent-blue-bg)', color: 'var(--accent-blue-text)', fontWeight: '600'}} 
                  onClick={() => {
                    handleEdit(selectedJob);
                    setSelectedJob(null);
                  }}
                >
                  Edit
                </button>
                <button onClick={() => setSelectedJob(null)}>✕</button>
              </div>
            </div>
            <div className="job-view-body">
              <div className="job-view-grid">
                <div><span>Department</span><strong>{selectedJob.department}</strong></div>
                <div><span>Job Type</span><strong>{selectedJob.job_type || selectedJob.jobType}</strong></div>
                <div><span>Work Mode</span><strong>{selectedJob.work_mode || selectedJob.workMode}</strong></div>
                <div><span>Experience</span><strong>{selectedJob.experience}</strong></div>
                <div><span>Openings</span><strong>{selectedJob.openings}</strong></div>
                <div><span>Applicants</span><strong>{selectedJob.applicants}</strong></div>
                <div><span>Salary</span><strong>{selectedJob.currency} {Number(selectedJob.salary_min || selectedJob.salaryMin).toLocaleString()} – {Number(selectedJob.salary_max || selectedJob.salaryMax).toLocaleString()}</strong></div>
                <div><span>Deadline</span><strong>{selectedJob.deadline}</strong></div>
                <div><span>Status</span><strong>{selectedJob.status}</strong></div>
                <div><span>Hiring Manager</span><strong>{selectedJob.hiringManager || selectedJob.hiring_manager}</strong></div>
              </div>
              
              <div className="job-details-text">
                {selectedJob.description && (
                  <div className="job-section">
                    <h4>Description</h4>
                    <p>{selectedJob.description}</p>
                  </div>
                )}
                {selectedJob.responsibilities && (
                  <div className="job-section">
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
                  <div className="job-section">
                    <h4>Required Skills</h4>
                    <div className="job-skills">
                      {Array.isArray(selectedJob.skills)
                        ? selectedJob.skills.map((s, i) => <span key={i}>{s}</span>)
                        : String(selectedJob.skills).split(',').map((s, i) => s.trim() && <span key={i}>{s.trim()}</span>)
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {editingJob && (
        <PostJobModal
          initialData={editingJob}
          onClose={() => setEditingJob(null)}
          onJobPosted={(updatedJob) => {
            setJobOpenings(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
};

export default JobOpenings;
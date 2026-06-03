import React from "react";

const statusColors = {
  Active: { bg: "#dcfce7", text: "#15803d" },
  Closed: { bg: "#fee2e2", text: "#dc2626" },
  Draft:  { bg: "#fef9c3", text: "#a16207" },
};

const modeIcons = {
  "On-site": "🏢",
  "Remote":  "🏠",
  "Hybrid":  "🔄",
};

const JobCard = ({ job, onEdit, onDelete, onView }) => {
  const status = statusColors[job.status] || statusColors.Active;

  return (
    <div className="job-card">

      {/* Top Row */}
      <div className="job-card-top">
        <div className="job-card-badges">
          <span className="job-status-badge" style={{ background: status.bg, color: status.text }}>
            ● {job.status}
          </span>
          <span className="job-dept-badge">{job.department}</span>
          <span className="job-type-badge">{job.jobType}</span>
        </div>
        <div className="job-card-actions">
          <button className="action-btn view-btn" onClick={() => onView(job)}>View</button>
          <button className="action-btn edit-btn" onClick={() => onEdit(job)}>Edit</button>
          <button className="action-btn delete-btn" onClick={() => onDelete(job.id)}>Delete</button>
        </div>
      </div>

      {/* Title */}
      <h3 className="job-card-title">{job.title}</h3>

      {/* Meta Info */}
      <div className="job-card-meta">
        <span>{modeIcons[job.workMode]} {job.workMode}</span>
        <span>💼 {job.experience}</span>
        <span>👥 {job.openings} opening{job.openings > 1 ? "s" : ""}</span>
        <span>📅 Deadline: {job.deadline}</span>
      </div>

      {/* Salary */}
      <div className="job-card-salary">
        💰 {job.currency} {Number(job.salaryMin).toLocaleString()} – {Number(job.salaryMax).toLocaleString()} / year
      </div>

      {/* Footer */}
      <div className="job-card-footer">
        <div className="job-applicants">
          <span className="applicant-count">{job.applicants}</span> Applicants
        </div>
        <div className="job-posted">Posted by: <strong>{job.hiringManager}</strong></div>
      </div>

    </div>
  );
};

export default JobCard;
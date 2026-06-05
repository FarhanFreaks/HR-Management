import React, { useState } from "react";

const statusColors = {
  Screening:  { bg: "#eff6ff", text: "#1d4ed8" },
  Assessment: { bg: "#f5f3ff", text: "#7c3aed" },
  Interview:  { bg: "#ecfeff", text: "#0e7490" },
  Offer:      { bg: "#fef9c3", text: "#a16207" },
  Hired:      { bg: "#dcfce7", text: "#15803d" },
  Rejected:   { bg: "#fee2e2", text: "#dc2626" },
};

const PIPELINE = ["Screening", "Assessment", "Interview", "Offer", "Hired"];

const CandidateProfile = ({ candidate, onClose, onUpdateStatus, onScheduleInterview }) => {
  const status = statusColors[candidate.status] || statusColors.Screening;
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    mode: "Video Call",
    interviewer: "",
    notes: "",
  });

  const updateForm = (field, value) =>
    setScheduleForm((f) => ({ ...f, [field]: value }));

  const handleReject = () => {
    if (window.confirm(`Reject ${candidate.name}?`)) {
      onUpdateStatus(candidate.id, "Rejected");
      onClose();
    }
  };

  const handleNextStage = () => {
    const currentIndex = PIPELINE.indexOf(candidate.status);
    if (currentIndex === -1 || currentIndex === PIPELINE.length - 1) {
      alert("Candidate is already at the final stage!");
      return;
    }
    const nextStage = PIPELINE[currentIndex + 1];
    onUpdateStatus(candidate.id, nextStage);
    onClose();
  };

  const handleScheduleSubmit = () => {
    if (!scheduleForm.date || !scheduleForm.time || !scheduleForm.interviewer) {
      alert("Please fill Date, Time, and Interviewer name.");
      return;
    }
    // Save interview details on the candidate
    onScheduleInterview(candidate.id, scheduleForm);
    alert(`✅ Interview scheduled for ${candidate.name} on ${scheduleForm.date} at ${scheduleForm.time}!`);
    setShowSchedule(false);
    onClose();
  };

  return (
    <div className="profile-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="profile-modal">

        {/* Header */}
        <div className="profile-header">
          <div className="profile-header-left">
            <div className="profile-avatar-xl" style={{ background: candidate.avatarBg, color: candidate.avatarText }}>
              {candidate.initials}
            </div>
            <div>
              <h2 className="profile-name">{candidate.name}</h2>
              <p className="profile-role">{candidate.role} — {candidate.department}</p>
              <p className="profile-email">✉ {candidate.email} &nbsp;|&nbsp; 📞 {candidate.phone}</p>
            </div>
          </div>
          <div className="profile-header-right">
            <span className="profile-status-badge" style={{ background: status.bg, color: status.text }}>
              {candidate.status}
            </span>
            <button className="profile-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="profile-body">
          <div className="profile-score-box">
            <div className="profile-score-circle">{candidate.score}</div>
            <div>
              <p className="profile-score-title">Match Score</p>
              <p className="profile-score-sub">Based on skills & experience</p>
            </div>
          </div>

          <div className="profile-info-grid">
            <div><span>Experience</span><strong>{candidate.experience}</strong></div>
            <div><span>Location</span><strong>{candidate.location}</strong></div>
            <div><span>Education</span><strong>{candidate.education}</strong></div>
            <div><span>Applied Date</span><strong>{candidate.appliedDate}</strong></div>
            <div><span>Applied For</span><strong>{candidate.appliedFor}</strong></div>
            <div><span>Expected Salary</span><strong>{candidate.expectedSalary}</strong></div>
          </div>

          {/* Show scheduled interview details if exists */}
          {candidate.interview && (
            <div className="profile-section">
              <h4>📅 Scheduled Interview</h4>
              <div className="profile-info-grid">
                <div><span>Date</span><strong>{candidate.interview.date}</strong></div>
                <div><span>Time</span><strong>{candidate.interview.time}</strong></div>
                <div><span>Mode</span><strong>{candidate.interview.mode}</strong></div>
                <div><span>Interviewer</span><strong>{candidate.interview.interviewer}</strong></div>
                {candidate.interview.notes && (
                  <div><span>Notes</span><strong>{candidate.interview.notes}</strong></div>
                )}
              </div>
            </div>
          )}

          <div className="profile-section">
            <h4>Skills</h4>
            <div className="profile-skills">
              {candidate.skills.map((s) => (
                <span key={s} className="profile-skill-tag">{s}</span>
              ))}
            </div>
          </div>

          <div className="profile-section">
            <h4>About</h4>
            <p className="profile-about">{candidate.about}</p>
          </div>

          {candidate.notes && (
            <div className="profile-section">
              <h4>Interview Notes</h4>
              <p className="profile-notes">{candidate.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="profile-footer">
          <button className="profile-btn-reject" onClick={handleReject}>✕ Reject</button>
          <button className="profile-btn-schedule" onClick={() => setShowSchedule(true)}>
            📅 Schedule Interview
          </button>
          {candidate.status !== "Hired" && candidate.status !== "Rejected" && (
            <button className="profile-btn-advance" onClick={handleNextStage}>
              ✓ Move to Next Stage
            </button>
          )}
        </div>
      </div>

      {/* ── Schedule Interview Modal ── */}
      {showSchedule && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowSchedule(false)}>
          <div className="modal-container" style={{ maxWidth: 480 }}>

            <div className="modal-header">
              <div>
                <h2 className="modal-title">📅 Schedule Interview</h2>
                <p className="modal-subtitle">Set up interview for {candidate.name}</p>
              </div>
              <button className="modal-close" onClick={() => setShowSchedule(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-grid">

                <div className="form-group">
                  <label>Interview Date <span className="required">*</span></label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => updateForm("date", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Interview Time <span className="required">*</span></label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => updateForm("time", e.target.value)}
                  />
                </div>

                <div className="form-group full">
                  <label>Interview Mode</label>
                  <div className="radio-group">
                    {["Video Call", "Phone Call", "In-Person"].map((m) => (
                      <label key={m} className={`radio-chip ${scheduleForm.mode === m ? "radio-selected" : ""}`}>
                        <input
                          type="radio"
                          name="mode"
                          value={m}
                          checked={scheduleForm.mode === m}
                          onChange={() => updateForm("mode", m)}
                        />
                        {m === "Video Call" ? "🎥" : m === "Phone Call" ? "📞" : "🏢"} {m}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group full">
                  <label>Interviewer Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Rakesh Kumar"
                    value={scheduleForm.interviewer}
                    onChange={(e) => updateForm("interviewer", e.target.value)}
                  />
                </div>

                <div className="form-group full">
                  <label>Notes (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Any special instructions or topics to cover..."
                    value={scheduleForm.notes}
                    onChange={(e) => updateForm("notes", e.target.value)}
                  />
                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowSchedule(false)}>Cancel</button>
              <div className="footer-right">
                <button className="btn-post" onClick={handleScheduleSubmit}>
                  ✅ Confirm Schedule
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateProfile;
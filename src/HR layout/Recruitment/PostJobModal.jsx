import React, { useState } from "react";
import { supabase } from "../../config/supabaseClient";
import "./PostJobModal.css";

const DEPARTMENTS = ["Engineering", "Product", "Design", "Analytics", "HR", "Finance", "Marketing", "Sales", "Operations", "Legal"];
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const EXPERIENCE = ["0-1 year", "1-3 years", "3-5 years", "5+ years"];
const EDUCATION = ["Any", "Bachelor's", "Master's", "PhD"];
const PRIORITY = ["Low", "Medium", "High", "Urgent"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP"];
const SKILL_SUGGESTIONS = ["React", "Node.js", "Python", "Java", "SQL", "Figma", "AWS", "TypeScript", "MongoDB", "Docker"];

const PostJobModal = ({ onClose, onJobPosted, initialData }) => {
  const [step, setStep] = useState(1);
  const [skillInput, setSkillInput] = useState("");
  
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        jobTitle: initialData.title || "",
        department: initialData.department || "",
        jobType: initialData.job_type || initialData.jobType || "",
        workMode: initialData.work_mode || initialData.workMode || "On-site",
        openings: initialData.openings || 1,
        description: initialData.description || "",
        responsibilities: Array.isArray(initialData.responsibilities) ? initialData.responsibilities.join('\n') : initialData.responsibilities || "",
        skills: Array.isArray(initialData.skills) ? initialData.skills : [],
        experience: initialData.experience || "",
        education: initialData.education || "",
        salaryMin: initialData.salary_min || initialData.salaryMin || "",
        salaryMax: initialData.salary_max || initialData.salaryMax || "",
        currency: initialData.currency || "INR",
        deadline: initialData.deadline || "",
        joiningDate: initialData.joining_date || initialData.joiningDate || "",
        priority: initialData.priority || "Medium",
        hiringManager: initialData.hiring_manager || initialData.hiringManager || "",
        contactEmail: initialData.contact_email || initialData.contactEmail || "",
      };
    }
    return {
      jobTitle: "", department: "", jobType: "", workMode: "On-site",
      openings: 1, description: "", responsibilities: "", skills: [],
      experience: "", education: "", salaryMin: "", salaryMax: "",
      currency: "INR", deadline: "", joiningDate: "", priority: "Medium",
      hiringManager: "", contactEmail: "",
    };
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !form.skills.includes(s)) update("skills", [...form.skills, s]);
    setSkillInput("");
  };

  const removeSkill = (s) => update("skills", form.skills.filter((x) => x !== s));

  const handleSubmit = async () => {
    if (!form.jobTitle || !form.department || !form.jobType) {
      alert("Please fill in Job Title, Department, and Job Type.");
      return;
    }

    // Map your frontend state properties to database snake_case columns
    const dbPayload = {
      title: form.jobTitle,
      department: form.department,
      job_type: form.jobType,
      work_mode: form.workMode,
      openings: Number(form.openings),
      description: form.description,
      responsibilities: form.responsibilities 
        ? form.responsibilities.split('\n').map(r => r.trim()).filter(r => r !== "") 
        : [],
      skills: form.skills,
      experience: form.experience,
      education: form.education,
      salary_min: form.salaryMin ? Number(form.salaryMin) : null,
      salary_max: form.salaryMax ? Number(form.salaryMax) : null,
      currency: form.currency,
      deadline: form.deadline || null,
      joining_date: form.joiningDate || null,
      priority: form.priority,
      hiring_manager: form.hiringManager,
      contact_email: form.contactEmail,
      status: "Active",
      applicants: 0
    };

    try {
      let data, error;
      
      if (initialData && initialData.id) {
        // Update existing job
        const res = await supabase
          .from("job_openings")
          .update(dbPayload)
          .eq("id", initialData.id)
          .select();
        data = res.data;
        error = res.error;
      } else {
        // Insert new job
        const res = await supabase
          .from("job_openings")
          .insert([dbPayload])
          .select();
        data = res.data;
        error = res.error;
      }

      if (error) throw error;

      if (data && data.length > 0) {
        onJobPosted(data[0]); 
        alert(initialData ? "✅ Job updated successfully in Database!" : "✅ Job posted successfully to Supabase Database!");
        onClose();
      }
    } catch (error) {
      alert("Error saving job configuration: " + error.message);
    }
  };

  const totalSteps = 4;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{initialData ? "Edit Job" : "Post New Job"}</h2>
            <p className="modal-subtitle">{initialData ? "Update the details of this job opening" : "Fill in the details to create a new job opening"}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Step Indicator */}
        <div className="step-bar">
          {["Basic Info", "Job Details", "Compensation", "Timeline & Manager"].map((label, i) => (
            <div key={i} className={`step-item ${step === i + 1 ? "step-active" : ""} ${step > i + 1 ? "step-done" : ""}`}>
              <div className="step-circle">{step > i + 1 ? "✓" : i + 1}</div>
              <span className="step-label">{label}</span>
              {i < totalSteps - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="modal-body">
          {step === 1 && (
            <div className="form-grid">
              <div className="form-group full">
                <label>Job Title <span className="required">*</span></label>
                <input type="text" placeholder="e.g. Senior React Developer" value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Department <span className="required">*</span></label>
                <select value={form.department} onChange={(e) => update("department", e.target.value)}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Job Type <span className="required">*</span></label>
                <select value={form.jobType} onChange={(e) => update("jobType", e.target.value)}>
                  <option value="">Select type</option>
                  {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label>Work Mode</label>
                <div className="radio-group">
                  {["On-site", "Remote", "Hybrid"].map((m) => (
                    <label key={m} className={`radio-chip ${form.workMode === m ? "radio-selected" : ""}`}>
                      <input type="radio" name="workMode" value={m} checked={form.workMode === m} onChange={() => update("workMode", m)} />
                      {m === "On-site" ? "🏢" : m === "Remote" ? "🏠" : "🔄"} {m}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Number of Openings</label>
                <input type="number" min="1" value={form.openings} onChange={(e) => update("openings", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={form.priority} onChange={(e) => update("priority", e.target.value)}>
                  {PRIORITY.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-grid">
              <div className="form-group full">
                <label>Job Description <span className="required">*</span></label>
                <textarea rows={4} placeholder="Describe the role..." value={form.description} onChange={(e) => update("description", e.target.value)} />
              </div>
              <div className="form-group full">
                <label>Key Responsibilities</label>
                <textarea rows={3} placeholder="• Lead the frontend team" value={form.responsibilities} onChange={(e) => update("responsibilities", e.target.value)} />
              </div>
              <div className="form-group full">
                <label>Required Skills</label>
                <div className="skill-tags">
                  {form.skills.map((s) => (
                    <span key={s} className="skill-tag">{s}<button onClick={() => removeSkill(s)}>✕</button></span>
                  ))}
                  <input type="text" placeholder="Type skill and press Enter" value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkill(skillInput)}
                    className="skill-input" />
                </div>
                <div className="skill-suggestions">
                  {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0, 6).map((s) => (
                    <button key={s} className="skill-suggest-btn" onClick={() => addSkill(s)}>+ {s}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Experience Required</label>
                <select value={form.experience} onChange={(e) => update("experience", e.target.value)}>
                  <option value="">Select experience</option>
                  {EXPERIENCE.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Education Qualification</label>
                <select value={form.education} onChange={(e) => update("education", e.target.value)}>
                  <option value="">Select education</option>
                  {EDUCATION.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-grid">
              <div className="form-group full">
                <label>Currency</label>
                <div className="radio-group">
                  {CURRENCIES.map((c) => (
                    <label key={c} className={`radio-chip ${form.currency === c ? "radio-selected" : ""}`}>
                      <input type="radio" name="currency" value={c} checked={form.currency === c} onChange={() => update("currency", c)} />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Minimum Salary</label>
                <div className="input-prefix">
                  <span>{form.currency}</span>
                  <input type="number" placeholder="e.g. 500000" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Maximum Salary</label>
                <div className="input-prefix">
                  <span>{form.currency}</span>
                  <input type="number" placeholder="e.g. 900000" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} />
                </div>
              </div>
              {form.salaryMin && form.salaryMax && (
                <div className="form-group full">
                  <div className="salary-preview">
                    💰 Salary Range: <strong>{form.currency} {Number(form.salaryMin).toLocaleString()} – {Number(form.salaryMax).toLocaleString()}</strong> per year
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="form-grid">
              <div className="form-group">
                <label>Application Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Expected Joining Date</label>
                <input type="date" value={form.joiningDate} onChange={(e) => update("joiningDate", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Hiring Manager Name</label>
                <input type="text" placeholder="e.g. Rakesh Kumar" value={form.hiringManager} onChange={(e) => update("hiringManager", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input type="email" placeholder="e.g. hr@company.com" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
              </div>
              <div className="form-group full">
                <div className="summary-box">
                  <h4>📋 Job Summary</h4>
                  <div className="summary-grid">
                    <div><span>Title</span><strong>{form.jobTitle || "—"}</strong></div>
                    <div><span>Department</span><strong>{form.department || "—"}</strong></div>
                    <div><span>Type</span><strong>{form.jobType || "—"}</strong></div>
                    <div><span>Work Mode</span><strong>{form.workMode}</strong></div>
                    <div><span>Openings</span><strong>{form.openings}</strong></div>
                    <div><span>Priority</span><strong>{form.priority}</strong></div>
                    {form.salaryMin && <div><span>Salary</span><strong>{form.currency} {Number(form.salaryMin).toLocaleString()} – {Number(form.salaryMax).toLocaleString()}</strong></div>}
                    {form.skills.length > 0 && <div className="summary-full"><span>Skills</span><strong>{form.skills.join(", ")}</strong></div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <div className="footer-right">
            {step > 1 && <button className="btn-back" onClick={() => setStep(step - 1)}>← Back</button>}
            {step < totalSteps
              ? <button className="btn-next" onClick={() => setStep(step + 1)}>Next →</button>
              : <button className="btn-post" onClick={handleSubmit}>{initialData ? "💾 Update Job" : "🚀 Post Job"}</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJobModal;
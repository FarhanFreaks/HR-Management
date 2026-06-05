import React, { useState } from "react";
import CandidateFilter from "./CandidateFilter";
import CandidateCard from "./CandidateCard";
import CandidateProfile from "./CandidateProfile"; 
import { supabase } from "../../config/supabaseClient";
import "./Candidates.css";

const CandidatesTab = ({ candidates, setCandidates }) => {
  const [filters, setFilters] = useState({
    search: "", status: "All", department: "All", experience: "All",
  });
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Triggered when pipeline state changes (Hired, Rejected, etc.)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const target = candidates.find(c => c.id === id);
      if (!target) return;

      const { data, error } = await supabase
        .from("candidates")
        .update({ status: newStatus })
        .eq("id", id)
        .select();

      if (error) throw error;

      setCandidates((prev) =>
        prev.map((c) => c.id === id ? { ...c, status: newStatus } : c)
      );

      alert(`Status updated to ${newStatus} successfully!`);
    } catch (error) {
      alert("Error saving status change inside database system: " + error.message);
    }
  };

  // Triggered when an Interview is booked
  const handleScheduleInterview = async (id, interviewDetails) => {
    try {
      const target = candidates.find(c => c.id === id);
      if (!target) return;

      const { data, error } = await supabase
        .from("candidates")
        .update({ 
          interview: interviewDetails, 
          status: "Interview" 
        })
        .eq("id", id)
        .select();

      if (error) throw error;

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, interview: interviewDetails, status: "Interview" }
            : c
        )
      );
      
      alert(`🎯 Interview logged to database successfully!`);
    } catch (error) {
      alert("Error saving interview session profile structure: " + error.message);
    }
  };

  const filtered = candidates.filter((c) => {
    const s = filters.search.toLowerCase();
    const name = c.name || "";
    const role = c.role || "";
    const email = c.email || "";
    const department = c.department || "";
    const status = c.status || "Screening";
    const experience = c.experience || "";

    return (
      (s === "" || name.toLowerCase().includes(s) || role.toLowerCase().includes(s) || email.toLowerCase().includes(s)) &&
      (filters.status === "All" || status === filters.status) &&
      (filters.department === "All" || department === filters.department) &&
      (filters.experience === "All" || experience === filters.experience)
    );
  });

  const stats = [
    { label: "Total",     value: candidates.length,                                       color: "#1e293b" },
    { label: "Screening", value: candidates.filter(c => c.status === "Screening").length, color: "#1d4ed8" },
    { label: "Interview", value: candidates.filter(c => c.status === "Interview").length, color: "#0e7490" },
    { label: "Offer",     value: candidates.filter(c => c.status === "Offer").length,     color: "#a16207" },
    { label: "Hired",     value: candidates.filter(c => c.status === "Hired").length,     color: "#15803d" },
    { label: "Rejected",  value: candidates.filter(c => c.status === "Rejected").length,  color: "#dc2626" },
  ];

  return (
    <div className="candidates-wrapper">
      <div className="cand-stats-row">
        {stats.map((s) => (
          <div className="cand-stat-card" key={s.label}>
            <span className="cand-stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="cand-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <CandidateFilter filters={filters} setFilters={setFilters} />

      <p className="cand-results-count">
        Showing <strong>{filtered.length}</strong> of <strong>{candidates.length}</strong> candidates
      </p>

      {filtered.length > 0 ? (
        <div className="cand-cards-grid">
          {filtered.map((c) => (
            <CandidateCard key={c.id} candidate={c} onView={setSelectedCandidate} />
          ))}
        </div>
      ) : (
        <div className="cand-empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
          <h3>No candidates found</h3>
          <p>Try changing your filters or search term</p>
        </div>
      )}

      {selectedCandidate && (
        <CandidateProfile
          candidate={candidates.find(c => c.id === selectedCandidate.id)}
          onClose={() => setSelectedCandidate(null)}
          onUpdateStatus={handleUpdateStatus}
          onScheduleInterview={handleScheduleInterview}
        />
      )}
    </div>
  );
};

export default CandidatesTab;
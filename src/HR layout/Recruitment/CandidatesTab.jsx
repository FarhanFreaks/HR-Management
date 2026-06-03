import React, { useState } from "react";
import CandidateFilter from "./CandidateFilter";
import CandidateCard from "./CandidateCard";
import CandidateProfile from "./CandidateProfile";
import "./Candidates.css";

const ALL_CANDIDATES = [
  {
    id: 1, initials: "RD", name: "Rohini Das", role: "Product Designer",
    department: "Design", email: "rohini@email.com", phone: "+91 98765 43210",
    experience: "3-5 years", location: "Chennai", education: "B.Des, NID",
    appliedDate: "12 May 2026", appliedFor: "UI/UX Designer",
    expectedSalary: "INR 7,00,000", score: 92, status: "Offer",
    avatarBg: "#fde68a", avatarText: "#92400e",
    skills: ["Figma", "Adobe XD", "Prototyping", "User Research", "Sketch"],
    about: "Experienced product designer with 4 years in SaaS products. Passionate about creating user-centric designs.",
    notes: "Excellent portfolio. Strong communication skills. Recommended for offer.",
  },
  {
    id: 2, initials: "SI", name: "Snega Iyer", role: "React Developer",
    department: "Engineering", email: "snega@email.com", phone: "+91 91234 56789",
    experience: "1-3 years", location: "Bangalore", education: "B.Tech, VIT",
    appliedDate: "10 May 2026", appliedFor: "Senior React Developer",
    expectedSalary: "INR 8,00,000", score: 88, status: "Interview",
    avatarBg: "#bfdbfe", avatarText: "#1e40af",
    skills: ["React", "TypeScript", "Node.js", "Redux", "GraphQL"],
    about: "Frontend developer with 2 years of experience building scalable React applications.",
    notes: "Good technical skills. Schedule final round interview.",
  },
  {
    id: 3, initials: "PR", name: "Pooja Reddy", role: "Data Scientist",
    department: "Analytics", email: "pooja@email.com", phone: "+91 99887 76655",
    experience: "3-5 years", location: "Hyderabad", education: "M.Tech, IIT",
    appliedDate: "08 May 2026", appliedFor: "Data Scientist",
    expectedSalary: "INR 12,00,000", score: 81, status: "Hired",
    avatarBg: "#e9d5ff", avatarText: "#6b21a8",
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Tableau"],
    about: "Data scientist with expertise in ML models and data visualization. IIT graduate.",
    notes: "Offer accepted. Joining date: 01 July 2026.",
  },
  {
    id: 4, initials: "AK", name: "Arjun Kumar", role: "Backend Developer",
    department: "Engineering", email: "arjun@email.com", phone: "+91 90000 11111",
    experience: "1-3 years", location: "Pune", education: "B.Tech, BITS",
    appliedDate: "15 May 2026", appliedFor: "Node.js Backend Developer",
    expectedSalary: "INR 6,00,000", score: 76, status: "Assessment",
    avatarBg: "#d1fae5", avatarText: "#065f46",
    skills: ["Node.js", "MongoDB", "Express", "Docker", "AWS"],
    about: "Backend developer passionate about building APIs and microservices.",
    notes: "Sent assessment test on 16 May. Awaiting results.",
  },
  {
    id: 5, initials: "MN", name: "Meena Nair", role: "HR Executive",
    department: "HR", email: "meena@email.com", phone: "+91 88776 55443",
    experience: "0-1 year", location: "Kochi", education: "MBA, XLRI",
    appliedDate: "18 May 2026", appliedFor: "HR Executive",
    expectedSalary: "INR 3,50,000", score: 70, status: "Screening",
    avatarBg: "#fecdd3", avatarText: "#9f1239",
    skills: ["Recruitment", "HRMS", "Onboarding", "Excel", "Communication"],
    about: "Fresh MBA graduate with internship experience in HR operations.",
    notes: "",
  },
  {
    id: 6, initials: "VR", name: "Vikram Raj", role: "Marketing Analyst",
    department: "Marketing", email: "vikram@email.com", phone: "+91 77665 44332",
    experience: "1-3 years", location: "Mumbai", education: "BBA, Symbiosis",
    appliedDate: "05 May 2026", appliedFor: "Marketing Analyst",
    expectedSalary: "INR 5,00,000", score: 65, status: "Rejected",
    avatarBg: "#fed7aa", avatarText: "#c2410c",
    skills: ["Google Analytics", "SEO", "Content Marketing", "Excel"],
    about: "Marketing analyst with experience in digital campaigns and data analysis.",
    notes: "Not a strong fit for the current role requirements.",
  },
];

const CandidatesTab = () => {
  const [filters, setFilters] = useState({
    search: "", status: "All", department: "All", experience: "All",
  });
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const filtered = ALL_CANDIDATES.filter((c) => {
    const s = filters.search.toLowerCase();
    return (
      (s === "" || c.name.toLowerCase().includes(s) || c.role.toLowerCase().includes(s) || c.email.toLowerCase().includes(s)) &&
      (filters.status === "All" || c.status === filters.status) &&
      (filters.department === "All" || c.department === filters.department) &&
      (filters.experience === "All" || c.experience === filters.experience)
    );
  });

  // Stats
  const stats = [
    { label: "Total",      value: ALL_CANDIDATES.length,                                      color: "#1e293b" },
    { label: "Screening",  value: ALL_CANDIDATES.filter(c => c.status === "Screening").length,  color: "#1d4ed8" },
    { label: "Interview",  value: ALL_CANDIDATES.filter(c => c.status === "Interview").length,  color: "#0e7490" },
    { label: "Offer",      value: ALL_CANDIDATES.filter(c => c.status === "Offer").length,      color: "#a16207" },
    { label: "Hired",      value: ALL_CANDIDATES.filter(c => c.status === "Hired").length,      color: "#15803d" },
    { label: "Rejected",   value: ALL_CANDIDATES.filter(c => c.status === "Rejected").length,   color: "#dc2626" },
  ];

  return (
    <div className="candidates-wrapper">

      {/* Stats Row */}
      <div className="cand-stats-row">
        {stats.map((s) => (
          <div className="cand-stat-card" key={s.label}>
            <span className="cand-stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="cand-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter */}
      <CandidateFilter filters={filters} setFilters={setFilters} />

      {/* Results count */}
      <p className="cand-results-count">
        Showing <strong>{filtered.length}</strong> of <strong>{ALL_CANDIDATES.length}</strong> candidates
      </p>

      {/* Cards */}
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

      {/* Profile Modal */}
      {selectedCandidate && (
        <CandidateProfile
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

    </div>
  );
};

export default CandidatesTab;
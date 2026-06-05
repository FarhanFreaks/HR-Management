import React, { useState, useEffect } from "react";
import Header from "./Header";
import Tabs from "./Tabs";
import JobOpenings from "./JobOpenings";
import CandidatesTab from "./CandidatesTab";
import { supabase } from "../../config/supabaseClient";
import "./Recruitment.css";

const DEPT_COLORS = {
  Engineering: { bg: "#fce7f3", text: "#be185d" },
  Product:     { bg: "#dcfce7", text: "#15803d" },
  Design:      { bg: "#fef9c3", text: "#a16207" },
  Analytics:   { bg: "#fce7f3", text: "#9d174d" },
  HR:          { bg: "#f0fdf4", text: "#166534" },
  Finance:     { bg: "#fef3c7", text: "#92400e" },
  Marketing:   { bg: "#ede9fe", text: "#6d28d9" },
  Sales:       { bg: "#ecfdf5", text: "#065f46" },
  Operations:  { bg: "#fff7ed", text: "#c2410c" },
  Legal:       { bg: "#eff6ff", text: "#1d4ed8" },
};

const Recruitment = () => {
  const [activeTab, setActiveTab] = useState("Job openings");
  const [jobOpenings, setJobOpenings] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data from Supabase
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("job_openings")
        .select("*")
        .order("posted_date", { ascending: false });
      if (jobsError) throw jobsError;

      // Fetch Candidates
      const { data: candsData, error: candsError } = await supabase
        .from("candidates")
        .select("*")
        .order("rating", { ascending: false });
      if (candsError) throw candsError;

      setJobOpenings(jobsData || []);
      setCandidates(candsData || []);
    } catch (error) {
      console.error("Error fetching data from Supabase:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading Database...</div>;
  }

  return (
    <div className="recruitment-wrapper">
      <Header setJobOpenings={setJobOpenings} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === "Job openings" && (
        <JobOpenings jobOpenings={jobOpenings} setJobOpenings={setJobOpenings} />
      )}
      {activeTab === "Candidates" && (
        <CandidatesTab candidates={candidates} setCandidates={setCandidates} />
      )}
    </div>
  );
};

export default Recruitment;
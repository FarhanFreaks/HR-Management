import React, { useState } from "react";
import Header from "./Header";
import Tabs from "./Tabs";
import Cards from "./Cards";
import Candidates from "./Candidates";
import Department from "./Department";
import JobOpenings from "./JobOpenings";
import CandidatesTab from "./CandidatesTab";
import "./Recruitment.css";

const Recruitment = () => {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="recruitment-wrapper">
      <Header />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "Overview" && (
        <div className="recruitment-body">
          <Cards />
          <div className="recruitment-mid">
            <Candidates />
          </div>
          <Department />
        </div>
      )}

      {activeTab === "Job openings" && <JobOpenings />}
      {activeTab === "Candidates" && <CandidatesTab />}

    </div>
  );
};

export default Recruitment;
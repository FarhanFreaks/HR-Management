import React from "react";

const TABS = ["Overview", "Job openings", "Candidates"];

const Tabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tabs-wrapper">
      {TABS.map((tab) => (
        <button
          key={tab}
          className={`tab-btn ${activeTab === tab ? "tab-active" : ""}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default Tabs;

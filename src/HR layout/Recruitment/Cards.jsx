import React from "react";

const Cards = ({ stats }) => {
  const cardData = [
    { label: "Active openings",   value: stats.activeOpenings,    sub: "currently hiring",    color: "#22c55e" },
    { label: "Total application", value: stats.totalApplications, sub: "Across all roles",    color: "#f97316" },
    { label: "In Interview",      value: stats.inInterview,       sub: "Scheduled this week", color: "#f97316" },
    { label: "Hired this month",  value: stats.hiredThisMonth,    sub: "Offer accepted",      color: "#3b82f6" },
  ];

  return (
    <div className="cards-row">
      {cardData.map((card) => (
        <div className="stat-card" key={card.label}>
          <p className="stat-label">{card.label}</p>
          <h2 className="stat-value" style={{ color: card.color }}>{card.value}</h2>
          <p className="stat-sub">{card.sub}</p>
        </div>
      ))}
    </div>
  );
};

export default Cards;
import { useState, useEffect } from "react";
import "./Dashboard.css";

const TOP_METRICS = [
  { id: "employees", icon: "👥", label: "Total employees", value: "150", sub: "Across all departments", accent: "blue" },
  { id: "active", icon: "✅", label: "Active", value: "120", sub: "75% of workforce", accent: "green" },
  { id: "leave", icon: "✈️", label: "On leave", value: "20", sub: "Currently away", accent: "red" },
  { id: "payroll", icon: "₹", label: "Monthly payroll", value: "₹1cr", sub: "Total compensation", accent: "amber" },
];

const SECONDARY_METRICS = [
  { id: "positions", icon: "📋", label: "Open positions", value: "4", sub: "Actively hiring", accent: "teal" },
  { id: "leaves", icon: "🗓️", label: "Pending leaves", value: "8", sub: "Awaiting approval", accent: "purple" },
];

const DEPARTMENTS = [
  { name: "Engineering", count: 45, pct: 100, color: "#E24B4A" },
  { name: "Product",     count: 20, pct: 44,  color: "#639922" },
  { name: "Design",      count: 15, pct: 33,  color: "#E24B4A" },
  { name: "Analytics",   count: 20, pct: 44,  color: "#639922" },
  { name: "HR",          count: 15, pct: 33,  color: "#E24B4A" },
  { name: "Marketing",   count: 35, pct: 78,  color: "#534AB7" },
];

function getTodayString() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

// FIX: Added 'style' prop here so the animation delay actually works
function MetricCard({ icon, label, value, sub, accent, animate, style }) {
  return (
    <div 
      className={`metric-card ${animate ? "metric-card--visible" : ""}`} 
      data-accent={accent}
      style={style} // <-- Applied style here
    >
      <div className="metric-card__icon-wrap">
        <span className="metric-card__icon" aria-hidden="true">{icon}</span>
      </div>
      <p className="metric-card__label">{label}</p>
      <p className="metric-card__value">{value}</p>
      <p className="metric-card__sub">{sub}</p>
    </div>
  );
}

function DeptBar({ name, count, pct, color, delay }) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="dept-bar">
      <span className="dept-bar__name">{name}</span>
      <div className="dept-bar__track" role="progressbar" aria-valuenow={count} aria-valuemax={45}>
        <div
          className="dept-bar__fill"
          style={{
            width: filled ? `${pct}%` : "0%",  
            background: color,
          }}
        />
      </div>
      <span className="dept-bar__count">{count}</span>
    </div>
  );
}

function ActivityItem({ dot, text, time }) {
  return (
    <li className="activity-item">
      <span className={`activity-item__dot ${dot}`} aria-hidden="true" />
      <div className="activity-item__body">
        <p className="activity-item__text">{text}</p>
        <p className="activity-item__time">{time}</p>
      </div>
    </li>
  );
}

export default function Dashboard() {
  const [ready, setReady] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // TODO: Connect to supabase backend when available
    // async function fetchActivities() {
    //   try {
    //     setLoading(true);
    //     const { data, error } = await supabase
    //       .from("activities")
    //       .select("*")
    //       .order("id", { ascending: true });
    //
    //     if (error) throw error;
    //     setActivities(data || []);
    //   } catch (error) {
    //     console.error("Error fetching activities:", error.message);
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    // fetchActivities();
    setLoading(false);
  }, []);

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Overview</h1>
        <p className="dashboard__date">{getTodayString()}</p>
      </header>
      
      <section className="metrics-row" aria-label="Key performance indicators">
        {TOP_METRICS.map((m, i) => (
          <MetricCard
            key={m.id}
            {...m}
            animate={ready}
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </section>

      <section className="metrics-row metrics-row--secondary" aria-label="Hiring and leave stats">
        {SECONDARY_METRICS.map((m, i) => (
          <MetricCard
            key={m.id}
            {...m}
            animate={ready}
            style={{ animationDelay: `${(i + 4) * 80}ms` }}
          />
        ))}
        <div className="metrics-row__spacer" aria-hidden="true" />
        <div className="metrics-row__spacer" aria-hidden="true" />
      </section>

      <section className="dashboard__bottom" aria-label="Department overview and activity">
        <div className="chart-card">
          <h2 className="chart-card__title">Headcount by department</h2>
          <div className="chart-card__bars">
            {DEPARTMENTS.map((d, i) => (
              <DeptBar key={d.name} {...d} delay={200 + i * 120} />
            ))}
          </div>
        </div>

        <div className="activity-card">
          <h2 className="activity-card__title">Recent activity</h2>
          <ul className="activity-card__list" aria-label="Recent HR activity">
            {loading ? (
              <p style={{ padding: "1rem", color: "#666" }}>Loading activities...</p>
            ) : activities.length > 0 ? (
              activities.map((a) => (
                <ActivityItem key={a.id} {...a} />
              ))
            ) : (
              <p style={{ padding: "1rem" }}>No recent activity found.</p>
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}
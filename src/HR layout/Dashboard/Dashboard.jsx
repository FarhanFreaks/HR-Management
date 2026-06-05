import { useState, useEffect } from "react";
import "./Dashboard.css";
import { supabase } from "../../config/supabaseClient";

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

function DeptBar({ name, count, pct, color, delay, maxCount }) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="dept-bar">
      <span className="dept-bar__name">{name}</span>
      <div className="dept-bar__track" role="progressbar" aria-valuenow={count} aria-valuemax={maxCount || 45}>
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

  // Dynamic Data States
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    monthlyPayroll: "₹0",
    openPositions: 0,
    pendingLeaves: 0,
  });
  const [departments, setDepartments] = useState([]);
  const [maxDeptCount, setMaxDeptCount] = useState(45);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Fetch employees
        const { data: employeesData } = await supabase
          .from("employees")
          .select("id, status, departments(name)");
        
        const emps = employeesData || [];
        const totalEmployees = emps.length;
        const activeEmployees = emps.filter(e => e.status?.toLowerCase() === "active").length;
        
        // Calculate departments
        const deptCounts = {};
        emps.forEach(e => {
          const deptName = e.departments?.name || "Unassigned";
          deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
        });

        // Convert to array and calculate percentages
        const maxDept = Math.max(...Object.values(deptCounts), 1);
        setMaxDeptCount(maxDept);
        const deptColors = ["#E24B4A", "#639922", "#534AB7", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];
        const deptList = Object.entries(deptCounts)
          .map(([name, count], index) => ({
            name,
            count,
            pct: Math.round((count / maxDept) * 100),
            color: deptColors[index % deptColors.length]
          }))
          .sort((a, b) => b.count - a.count); // sort by count descending

        setDepartments(deptList);

        // 2. Fetch Leave Requests
        const { data: leaveData } = await supabase
          .from("leave_requests")
          .select("status");
        
        const leaves = leaveData || [];
        const pendingLeaves = leaves.filter(l => l.status === "Pending").length;
        const onLeave = leaves.filter(l => l.status === "Approved").length; // Approximation for currently on leave

        // 3. Fetch Payroll for current month
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const { data: payrollData } = await supabase
          .from("payroll_records")
          .select("net_salary")
          .eq("payroll_month", currentMonth)
          .eq("payroll_year", currentYear);
        
        let totalPayroll = 0;
        if (payrollData) {
          totalPayroll = payrollData.reduce((sum, record) => sum + (record.net_salary || 0), 0);
        }
        
        // Format payroll
        let formattedPayroll = `₹${totalPayroll.toLocaleString("en-IN")}`;
        if (totalPayroll >= 10000000) {
          formattedPayroll = `₹${(totalPayroll / 10000000).toFixed(1)}cr`;
        } else if (totalPayroll >= 100000) {
          formattedPayroll = `₹${(totalPayroll / 100000).toFixed(1)}L`;
        } else if (totalPayroll >= 1000) {
          formattedPayroll = `₹${(totalPayroll / 1000).toFixed(1)}k`;
        }

        // Set the metrics state
        setMetrics({
          totalEmployees,
          activeEmployees,
          onLeave,
          monthlyPayroll: formattedPayroll,
          openPositions: 0, // Hardcoded, pending recruitment module
          pendingLeaves
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const TOP_METRICS = [
    { id: "employees", icon: "👥", label: "Total employees", value: String(metrics.totalEmployees), sub: "Across all departments", accent: "blue" },
    { id: "active", icon: "✅", label: "Active", value: String(metrics.activeEmployees), sub: `${metrics.totalEmployees ? Math.round((metrics.activeEmployees / metrics.totalEmployees) * 100) : 0}% of workforce`, accent: "green" },
    { id: "leave", icon: "✈️", label: "On leave", value: String(metrics.onLeave), sub: "Approved leaves", accent: "red" },
    { id: "payroll", icon: "₹", label: "Monthly payroll", value: metrics.monthlyPayroll, sub: "Total compensation", accent: "amber" },
  ];

  const SECONDARY_METRICS = [
    { id: "positions", icon: "📋", label: "Open positions", value: String(metrics.openPositions), sub: "Actively hiring", accent: "teal" },
    { id: "leaves", icon: "🗓️", label: "Pending leaves", value: String(metrics.pendingLeaves), sub: "Awaiting approval", accent: "purple" },
  ];

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
            {departments.length > 0 ? departments.map((d, i) => (
              <DeptBar key={d.name} {...d} maxCount={maxDeptCount} delay={200 + i * 120} />
            )) : (
              <p style={{ padding: "1rem", color: "#666" }}>No department data available.</p>
            )}
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
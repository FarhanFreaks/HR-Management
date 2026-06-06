import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/config/supabaseClient";
import "./Attendance.css";

export default function AttendanceManagement() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const getTodayStr = () => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0];
  };
  const [filterDate, setFilterDate] = useState(getTodayStr());

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    
    // We use the currently selected filterDate for queries and calculations
    const targetDateStr = filterDate;

    const { data: attendanceData, error } = await supabase
      .from("attendance")
      .select(`
        id,
        employee_id,
        date,
        punch_in,
        punch_out,
        status,
        employees (
          emp_id,
          profiles (full_name),
          departments (name)
        )
      `)
      .eq("date", targetDateStr)
      .order("punch_in", { ascending: false });

    const { data: employeesData } = await supabase
      .from("employees")
      .select(`
        id,
        emp_id,
        profiles (full_name),
        departments (name)
      `)
      .eq('status', 'Active');

    if (error) {
      console.error("Error fetching attendance:", error.message);
      setErrorMessage("Unable to load attendance records.");
      setRecords([]);
    } else {
      let fetchedRecords = attendanceData || [];
      
      const now = new Date();
      // Only generate "Absent" records if the selected date is today (or in the past) and it's past 9 AM
      // For simplicity in a prototype, we'll apply it if they query today's date past 9 AM, 
      // or if they query a past date
      const isPastOrToday = new Date(targetDateStr) <= new Date(getTodayStr());
      
      if (isPastOrToday && (targetDateStr !== getTodayStr() || now.getHours() >= 9)) {
        
        const punchedInUserIds = new Set(
          fetchedRecords
            .filter((r) => r.date === targetDateStr)
            .map((r) => r.employee_id)
        );

        const activeEmployees = employeesData || [];
        const missingEmployees = activeEmployees.filter(emp => !punchedInUserIds.has(emp.id));

        const virtualRecords = missingEmployees.map(emp => ({
          id: `virtual-absent-${emp.id}-${targetDateStr}`,
          employee_id: emp.id,
          date: targetDateStr,
          punch_in: null,
          punch_out: null,
          status: "Absent",
          employees: {
            emp_id: emp.emp_id,
            profiles: emp.profiles,
            departments: emp.departments
          }
        }));

        fetchedRecords = [...fetchedRecords, ...virtualRecords];
        fetchedRecords.sort((a, b) => {
          if (a.date !== b.date) return new Date(b.date) - new Date(a.date);
          if (!a.punch_in && !b.punch_in) return 0;
          if (!a.punch_in) return 1;
          if (!b.punch_in) return -1;
          return new Date(b.punch_in) - new Date(a.punch_in);
        });
      }

      setRecords(fetchedRecords);
    }

    setLoading(false);
  }, [filterDate]);

  useEffect(() => {
    fetchAttendance();

    const channel = supabase
      .channel("attendance-management")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance" },
        fetchAttendance
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAttendance]);

  const filteredRecords = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !searchText ||
        record.employees?.profiles?.full_name?.toLowerCase().includes(searchText) ||
        record.employees?.emp_id?.toLowerCase().includes(searchText) ||
        record.employee_id?.toLowerCase().includes(searchText);

      const isComplete = Boolean(record.punch_out);
      const displayStatus = record.status === "Absent" ? "Absent" : (isComplete ? "Completed" : record.status || "Present");
      const matchesStatus = statusFilter === "All" || displayStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const presentCount = records.filter((record) => record.status === "Present").length;
  const completedCount = records.filter((record) => record.punch_out).length;
  const activeCount = records.filter((record) => record.punch_in && !record.punch_out).length;
  const absentCount = records.filter((record) => record.status === "Absent").length;

  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(`${dateString}T00:00:00`).toLocaleDateString([], {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getEmployeeInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "NA";
    return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  };

  const getDisplayStatus = (record) => {
    if (record.status === "Absent") return "Absent";
    if (record.punch_out) return "Completed";
    return record.status || "Present";
  };

  return (
    <div className="attendance-module">
      <div className="attendance-stats-row">
        <div className="stat-card">
          <span className="stat-title">Total Logs</span>
          <span className="stat-value">{records.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title" style={{ color: "#15803D" }}>Present</span>
          <span className="stat-value" style={{ color: "#15803D" }}>{presentCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title" style={{ color: "#B45309" }}>Checked In</span>
          <span className="stat-value" style={{ color: "#B45309" }}>{activeCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title" style={{ color: "#1D4ED8" }}>Completed</span>
          <span className="stat-value" style={{ color: "#1D4ED8" }}>{completedCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title" style={{ color: "#B91C1C" }}>Absent</span>
          <span className="stat-value" style={{ color: "#B91C1C" }}>{absentCount}</span>
        </div>
      </div>

      <section className="attendance-card">
        <div className="attendance-card__header">
          <h2 className="attendance-card__title">Live Attendance Logs</h2>
          <div className="attendance-controls">
            <input
              type="date"
              className="attendance-input"
              style={{ maxWidth: "160px" }}
              value={filterDate}
              onChange={(event) => setFilterDate(event.target.value)}
            />
            <input
              type="text"
              className="attendance-input"
              placeholder="Search ID, name, or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="attendance-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Completed">Completed</option>
              <option value="Absent">Absent</option>
            </select>
            <button className="btn-lop" type="button" onClick={fetchAttendance}>
              Refresh
            </button>
          </div>
        </div>

        <div className="attendance-grid-header">
          <span>ID</span>
          <span>Employee</span>
          <span>Check In</span>
          <span>Check Out</span>
          <span>Status</span>
          <span>Date</span>
        </div>

        <div className="table-scroll">
          {loading ? (
            <div className="empty-state">Loading attendance records...</div>
          ) : errorMessage ? (
            <div className="empty-state">{errorMessage}</div>
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map((record) => {
              const displayStatus = getDisplayStatus(record);
              const employeeName = record.employees?.profiles?.full_name || "Unknown Employee";

              return (
                <div key={record.id} className="attendance-grid-row">
                  <span style={{ color: "var(--text-secondary)" }}>
                    {record.employees?.emp_id || record.employee_id?.slice(0, 8).toUpperCase() || "N/A"}
                  </span>
                  <div className="emp-info">
                    <div className="emp-avatar">{getEmployeeInitials(employeeName)}</div>
                    <div>
                      <div>{employeeName}</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                        {record.employees?.departments?.name || "No department"}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: record.punch_in ? "600" : "400" }}>
                    {formatTime(record.punch_in)}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {formatTime(record.punch_out)}
                  </span>
                  <span
                    className="status-badge"
                    style={{
                      background: displayStatus === "Absent" ? "var(--accent-red, #FEF2F2)" : (displayStatus === "Completed" ? "var(--accent-blue, #EFF6FF)" : "var(--accent-green)"),
                      color: displayStatus === "Absent" ? "#B91C1C" : (displayStatus === "Completed" ? "#1D4ED8" : "#15803D"),
                    }}
                  >
                    {displayStatus}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {formatDate(record.date)}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="empty-state">No attendance records found.</div>
          )}
        </div>
      </section>
    </div>
  );
}

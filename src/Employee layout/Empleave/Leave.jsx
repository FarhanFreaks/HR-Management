import { useState, useEffect } from "react";
import { supabase } from "@/config/supabaseClient";
import "./Leave.css";

const LEAVE_TYPES = [
  { value: "Casual", label: "Casual Leave" },
  { value: "Sick", label: "Sick Leave" },
  { value: "Earned", label: "Earned Leave" },
];
export default function Leave() {
  const [leaveType, setLeaveType] = useState("Casual");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [numDays, setNumDays] = useState("");
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-calculate number of days
  useEffect(() => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (!isNaN(from) && !isNaN(to) && to >= from) {
        const diff = Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1;
        setNumDays(String(diff));
      } else {
        setNumDays("");
      }
    }
  }, [fromDate, toDate]);

  const handleSubmit = async () => {
    if (!fromDate || !toDate || !reason.trim() || !numDays) {
      alert("Please fill in all required fields accurately.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Session expired. Please log in again.");
      }

      const { error } = await supabase.from("leave_requests").insert([
        {
          employee_id: user.id,
          leave_type: leaveType,
          start_date: fromDate,
          end_date: toDate,
          total_days: parseInt(numDays),
          reason: reason,
          status: "Pending",
        },
      ]);

      if (error) throw error;

      setToast(true);
      setTimeout(() => setToast(false), 2800);

      setFromDate("");
      setToDate("");
      setNumDays("");
      setReason("");
      setLeaveType("Casual");
    } catch (error) {
      alert("Error submitting leave: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="leave-module-wrapper">
        <div className="leave-main">
          <div className="form-wrapper">
            <div className="form-card">
              <h1 className="form-title">Leave Request Form</h1>

              {/* Type */}
              <div className="form-row">
                <label className="form-label">Type :</label>
                <div className="form-control">
                  <div className="select-wrap select-small">
                    <select
                      className="select"
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                    >
                      {LEAVE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* From */}
              <div className="form-row">
                <label className="form-label">From:</label>
                <div className="form-control">
                  <input
                    type="date"
                    className="input input-medium"
                    value={fromDate}
                    min={new Date().toISOString().split("T")[0]} // Prevent past dates
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
              </div>

              {/* To */}
              <div className="form-row">
                <label className="form-label">To:</label>
                <div className="form-control">
                  <input
                    type="date"
                    className="input input-medium"
                    value={toDate}
                    min={fromDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>

              {/* No. of Days */}
              <div className="form-row">
                <label className="form-label">No.of.Days:</label>
                <div className="form-control">
                  <input
                    type="number"
                    className="input days-input"
                    value={numDays}
                    readOnly
                    placeholder="—"
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="form-row align-start">
                <label className="form-label pt-9">Reason:</label>
                <div className="form-control">
                  <textarea
                    className="textarea"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter your reason..."
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="submit-wrap">
                <button
                  className="btn-submit"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="legend">
              <span className="legend-item">Casual - Casual Leave</span>
              <span className="legend-item">Sick - Sick Leave</span>
              <span className="legend-item">Earned - Earned Leave</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`toast${toast ? " show" : ""}`}>
        ✓ Leave request submitted successfully!
      </div>
    </>
  );
}

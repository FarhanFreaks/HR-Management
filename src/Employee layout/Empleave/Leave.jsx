import { useState, useEffect } from "react";
import "./Leave.css";

export default function Leave() {
  const [leaveType, setLeaveType] = useState("SL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [numDays, setNumDays] = useState("");
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState(false);

  // Auto-calculate number of days
  useEffect(() => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (!isNaN(from) && !isNaN(to) && to >= from) {
        const diff =
          Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1;

        setNumDays(String(diff));
      } else {
        setNumDays("");
      }
    }
  }, [fromDate, toDate]);

  const handleSubmit = () => {
    if (!fromDate || !toDate || !reason.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    setToast(true);

    setTimeout(() => setToast(false), 2800);

    setFromDate("");
    setToDate("");
    setNumDays("");
    setReason("");
    setLeaveType("SL");
  };

  return (
    <>
      <div className="app">
        {/* Main Content */}
        <main className="main">
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
                      <option value="SL">SL</option>
                      <option value="LL">LL</option>
                      <option value="ML">ML</option>
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
                    min={fromDate}
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
                    min={1}
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="form-row align-start">
                <label className="form-label pt-9">
                  Reason:
                </label>
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
                >
                  Submit
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="legend">
              <span className="legend-item">
                SL - Short Leave
              </span>
              <span className="legend-item">
                LL - Long Leave
              </span>
              <span className="legend-item">
                ML - Medical Leave
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Toast */}
      <div className={`toast${toast ? " show" : ""}`}>
        ✓ Leave request submitted successfully!
      </div>
    </>
  );
}
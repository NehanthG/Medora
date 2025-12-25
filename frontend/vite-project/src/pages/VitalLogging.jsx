import React, { useEffect } from "react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../stores/useAuthStore";
import AISummaryButton from "../components/AIInsights/AISummaryButton";
import AISummaryModal from "../components/AIInsights/AISummaryModal";

export default function VitalLogging() {
  const {
    authUser,
    last7BpReadings,
    last7SugarReadings,
    get7BpReadings,
    get7SugarReadings,
  } = useAuthStore();
  // fetch readings on mount / when user changes
  useEffect(() => {
    if (authUser) {
      get7BpReadings(authUser._id);
      get7SugarReadings(authUser._id);
    }
  }, [authUser, get7BpReadings, get7SugarReadings]);

  const [bpData, setBpData] = useState({ systolic: "", diastolic: "" });
  const [sugarData, setSugarData] = useState({
    sugarType: "",
    sugarValue: "",
  });
  const [showAIModal, setShowAIModal] = useState(false);

  const handleBpLog = async (e) => {
    e.preventDefault();

    if (!bpData.systolic || !bpData.diastolic) {
      toast.error(
        "Systolic or Diastolic field cannot be empty. Please log a value."
      );
      return;
    }

    if (!authUser) {
      toast.error("You must be logged in to log vitals.");
      return;
    }

    try {
      const res = await axiosInstance.post(`vitals/${authUser._id}/log`, {
        type: "BP",
        systolic: bpData.systolic,
        diastolic: bpData.diastolic,
      });

      if (res.data?.success) {
        toast.success("Blood Pressure data successfully logged");
        setBpData({ systolic: "", diastolic: "" });
        // refresh last 7 readings
        if (authUser) await get7BpReadings(authUser._id);
      }
    } catch (error) {
      toast.error("Failed to log data");
      console.log(error);
    }
  };

  const handleSugarLog = async (e) => {
    e.preventDefault();

    if (!sugarData.sugarType || !sugarData.sugarValue) {
      toast.error("Please make sure all values are valid");
      return;
    }

    if (!authUser) {
      toast.error("You must be logged in to log vitals.");
      return;
    }

    try {
      const res = await axiosInstance.post(`vitals/${authUser._id}/log`, {
        type: "Sugar",
        sugarType: sugarData.sugarType,
        sugarValue: sugarData.sugarValue,
      });

      if (res.data?.success) {
        toast.success("Sugar data successfully logged");
        setSugarData({ sugarType: "", sugarValue: "" });
        // refresh last 7 readings
        if (authUser) await get7SugarReadings(authUser._id);
        // also refresh BP in case UI wants to keep both in sync
        if (authUser) await get7BpReadings(authUser._id);
      }
    } catch (error) {
      toast.error("Failed to log data");
      console.log(error);
    }
  };

  const BpForm = () => (
    <form onSubmit={handleBpLog}>
      <div className="mb-2">
        <input
          className="form-control"
          type="number"
          placeholder="Systolic"
          value={bpData.systolic}
          onChange={(e) => setBpData({ ...bpData, systolic: e.target.value })}
        />
      </div>
      <div className="mb-3">
        <input
          className="form-control"
          type="number"
          placeholder="Diastolic"
          value={bpData.diastolic}
          onChange={(e) => setBpData({ ...bpData, diastolic: e.target.value })}
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        style={{ borderRadius: 8 }}
      >
        Log Reading
      </button>
    </form>
  );

  const SugarForm = () => (
    <form onSubmit={handleSugarLog}>
      <div className="mb-2">
        <select
          className="form-select"
          value={sugarData.sugarType}
          onChange={(e) =>
            setSugarData({ ...sugarData, sugarType: e.target.value })
          }
        >
          <option value="">Select...</option>
          <option value="FASTING">Fasting</option>
          <option value="POST_MEAL">Post Lunch</option>
          <option value="RANDOM">Random</option>
        </select>
      </div>
      <div className="mb-3">
        <input
          className="form-control"
          type="number"
          placeholder="Sugar Value"
          value={sugarData.sugarValue}
          onChange={(e) =>
            setSugarData({ ...sugarData, sugarValue: e.target.value })
          }
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        style={{ borderRadius: 8 }}
      >
        Log Reading
      </button>
    </form>
  );

  // Helpers
  const classifyBP = (systolic, diastolic) => {
    if (systolic == null || diastolic == null)
      return { status: "Unknown", range: "-" };
    if (systolic < 120 && diastolic < 80)
      return { status: "Normal", range: "<120 / <80" };
    if (systolic >= 120 && systolic < 130 && diastolic < 80)
      return { status: "Elevated", range: "120-129 / <80" };
    if (
      (systolic >= 130 && systolic < 140) ||
      (diastolic >= 80 && diastolic < 90)
    )
      return { status: "Hypertension Stage 1", range: "130-139 / 80-89" };
    if (systolic >= 140 || diastolic >= 90)
      return { status: "Hypertension Stage 2", range: ">=140 / >=90" };
    return { status: "Unclassified", range: "-" };
  };

  const classifySugar = (type, value) => {
    if (value == null) return { status: "Unknown", range: "-" };
    const v = Number(value);
    if (type === "FASTING") {
      if (v < 100) return { status: "Normal", range: "<100 mg/dL" };
      if (v >= 100 && v <= 125)
        return { status: "Prediabetes", range: "100-125 mg/dL" };
      return { status: "Diabetes", range: ">=126 mg/dL" };
    }
    if (v < 140) return { status: "Normal", range: "<140 mg/dL" };
    if (v >= 140 && v < 200)
      return { status: "Prediabetes", range: "140-199 mg/dL" };
    return { status: "Diabetes", range: ">=200 mg/dL" };
  };

  const statusBadge = (status) => {
    if (!status) return null;
    let bgClass = "bg-secondary";
    if (status.includes("Normal"))
      bgClass = "bg-success-subtle text-success border border-success-subtle";
    else if (status.includes("Elevated") || status.includes("Prediabetes"))
      bgClass =
        "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
    else if (status.includes("Hypertension") || status.includes("Diabetes"))
      bgClass = "bg-danger-subtle text-danger border border-danger-subtle";

    return (
      <span
        className={`badge ${bgClass}`}
        style={{
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "0.75rem",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {status}
      </span>
    );
  };

  const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    };
    return date.toLocaleString(undefined, options);
  };

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <Toaster />
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#2d3748" }}>
              Log Vitals
            </h2>
            <p className="text-secondary mb-0" style={{ fontSize: "1rem" }}>
              Record your blood pressure and blood sugar readings. Recent 7-day
              history is shown below.
            </p>
          </div>
          <AISummaryButton
            onClick={() => setShowAIModal(true)}
            disabled={
              (!last7BpReadings || last7BpReadings.length === 0) &&
              (!last7SugarReadings ||
                Object.keys(last7SugarReadings).length === 0)
            }
          />
        </div>

        {/* Logging forms */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3" style={{ color: "#2d3748" }}>
                  Log Blood Pressure
                </h5>
                {BpForm()}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3" style={{ color: "#2d3748" }}>
                  Log Blood Sugar
                </h5>
                {SugarForm()}
              </div>
            </div>
          </div>
        </div>

        {/* Always display last 7 readings - buttons removed */}

        {/* Styles for table and status indicators */}

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex align-items-center mb-4">
              <div
                className="bg-primary bg-opacity-10 p-2 rounded-3 me-3"
                style={{ color: "#0d6efd" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h4 className="fw-bold mb-0" style={{ color: "#2d3748" }}>
                Last 7 BP Readings
              </h4>
            </div>

            {last7BpReadings && last7BpReadings.length ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle border-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 ps-3">Date & Time</th>
                      <th className="border-0">Systolic</th>
                      <th className="border-0">Diastolic</th>
                      <th className="border-0">Range</th>
                      <th className="border-0 pe-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {last7BpReadings.map((r) => {
                      const cls = classifyBP(r.systolic, r.diastolic);
                      return (
                        <tr key={r._id}>
                          <td className="ps-3 text-secondary">
                            {formatDate(r.recordedAt)}
                          </td>
                          <td className="fw-semibold">{r.systolic}</td>
                          <td className="fw-semibold">{r.diastolic}</td>
                          <td className="text-muted small">{cls.range}</td>
                          <td className="pe-3">{statusBadge(cls.status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <p className="mb-0">No blood pressure readings found.</p>
              </div>
            )}

            <div className="d-flex align-items-center mt-5 mb-4">
              <div
                className="bg-danger bg-opacity-10 p-2 rounded-3 me-3"
                style={{ color: "#dc3545" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h4 className="fw-bold mb-0" style={{ color: "#2d3748" }}>
                Last 7 Sugar Readings
              </h4>
            </div>

            {last7SugarReadings ? (
              <div className="row g-4">
                {[
                  { key: "fasting", label: "Fasting", type: "FASTING" },
                  { key: "postMeal", label: "Post Meal", type: "POST_MEAL" },
                  { key: "random", label: "Random", type: "RANDOM" },
                ].map((section) => (
                  <div className="col-12" key={section.key}>
                    <h6 className="fw-bold text-secondary mb-3 text-uppercase small letter-spacing-1">
                      {section.label}
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-hover align-middle border-0">
                        <thead className="table-light">
                          <tr>
                            <th className="border-0 ps-3">Date & Time</th>
                            <th className="border-0">Value (mg/dL)</th>
                            <th className="border-0">Range</th>
                            <th className="border-0 pe-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="border-top-0">
                          {(last7SugarReadings[section.key] || []).length >
                          0 ? (
                            (last7SugarReadings[section.key] || []).map((r) => {
                              const cls = classifySugar(
                                section.type,
                                r.sugarValue
                              );
                              return (
                                <tr key={r._id}>
                                  <td className="ps-3 text-secondary">
                                    {formatDate(r.recordedAt)}
                                  </td>
                                  <td className="fw-semibold">
                                    {r.sugarValue}
                                  </td>
                                  <td className="text-muted small">
                                    {cls.range}
                                  </td>
                                  <td className="pe-3">
                                    {statusBadge(cls.status)}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan="4"
                                className="text-center py-3 text-muted small"
                              >
                                No {section.label.toLowerCase()} readings found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <p className="mb-0">No blood sugar readings found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Summary Modal */}
      <AISummaryModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        bpReadings={last7BpReadings || []}
        sugarReadings={last7SugarReadings || {}}
      />
    </div>
  );
}
import React, { useEffect } from "react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../stores/useAuthStore";

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

  const statusStyle = (status) => {
    if (!status) return {};
    if (status.includes("Normal")) return { color: "green", fontWeight: 600 };
    if (status.includes("Elevated") || status.includes("Prediabetes"))
      return { color: "orange", fontWeight: 700 };
    if (status.includes("Hypertension") || status.includes("Diabetes"))
      return { color: "red", fontWeight: 800 };
    return { color: "gray" };
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
            <h3>Last 7 BP readings</h3>
            {last7BpReadings && last7BpReadings.length ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Systolic
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Diastolic
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Range
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {last7BpReadings.map((r) => {
                    const cls = classifyBP(r.systolic, r.diastolic);
                    return (
                      <tr key={r._id}>
                        <td
                          style={{
                            padding: "8px 4px",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          {formatDate(r.recordedAt)}
                        </td>
                        <td
                          style={{
                            padding: "8px 4px",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          {r.systolic}
                        </td>
                        <td
                          style={{
                            padding: "8px 4px",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          {r.diastolic}
                        </td>
                        <td
                          style={{
                            padding: "8px 4px",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          {cls.range}
                        </td>
                        <td
                          style={{
                            padding: "8px 4px",
                            borderBottom: "1px solid #f0f0f0",
                            ...statusStyle(cls.status),
                          }}
                        >
                          {cls.status}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p>No BP readings</p>
            )}

            <h3 style={{ marginTop: 24 }}>Last 7 Sugar readings</h3>
            {last7SugarReadings ? (
              <div>
                <h4>Fasting</h4>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Value (mg/dL)
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Range
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(last7SugarReadings.fasting || []).map((r) => {
                      const cls = classifySugar("FASTING", r.sugarValue);
                      return (
                        <tr key={r._id}>
                          <td
                            style={{
                              padding: "8px 4px",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            {formatDate(r.recordedAt)}
                          </td>
                          <td
                            style={{
                              padding: "8px 4px",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            {r.sugarValue}
                          </td>
                          <td
                            style={{
                              padding: "8px 4px",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            {cls.range}
                          </td>
                          <td
                            style={{
                              padding: "8px 4px",
                              borderBottom: "1px solid #f0f0f0",
                              ...statusStyle(cls.status),
                            }}
                          >
                            {cls.status}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <h4 style={{ marginTop: 12 }}>Post Meal</h4>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Value (mg/dL)
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Range
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(last7SugarReadings.postMeal || []).map((r) => {
                      const cls = classifySugar("POST_MEAL", r.sugarValue);
                      return (
                        <tr key={r._id}>
                          <td
                            style={{
                              padding: "8px 4px",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            {formatDate(r.recordedAt)}
                          </td>
                          <td
                            style={{
                              padding: "8px 4px",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            {r.sugarValue}
                          </td>
                          <td
                            style={{
                              padding: "8px 4px",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            {cls.range}
                          </td>
                          <td
                            style={{
                              padding: "8px 4px",
                              borderBottom: "1px solid #f0f0f0",
                              ...statusStyle(cls.status),
                            }}
                          >
                            {cls.status}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <h4 style={{ marginTop: 12 }}>Random</h4>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Value (mg/dL)
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Range
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(last7SugarReadings.random || []).map((r) => {
                      const cls = classifySugar("RANDOM", r.sugarValue);
                      return (
                        <tr key={r._id}>
                          <td
                            style={{
                              padding: "8px 4px",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            {formatDate(r.recordedAt)}
                          </td>
                          <td
                            style={{
                              padding: "8px 4px",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            {r.sugarValue}
                          </td>
                          <td
                            style={{
                              padding: "8px 4px",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            {cls.range}
                          </td>
                          <td
                            style={{
                              padding: "8px 4px",
                              borderBottom: "1px solid #f0f0f0",
                              ...statusStyle(cls.status),
                            }}
                          >
                            {cls.status}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No sugar readings</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

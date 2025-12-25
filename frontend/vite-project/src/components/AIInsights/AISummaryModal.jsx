import React, { useState } from "react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

const AISummaryModal = ({
  isOpen,
  onClose,
  bpReadings = [],
  sugarReadings = {},
}) => {
  const [userQuery, setUserQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that we have data to analyze
    if (!bpReadings.length && !Object.keys(sugarReadings).length) {
      toast.error("No vitals data available for analysis");
      return;
    }

    setIsLoading(true);
    setAiResponse("");

    try {
      const response = await axiosInstance.post("/vitals/ai-summary", {
        query: userQuery.trim() || undefined,
        bpReadings: bpReadings,
        sugarReadings: sugarReadings,
      });

      if (response.data?.success) {
        setAiResponse(response.data.data.summary);
        setHasAnalyzed(true);
      } else {
        toast.error("Failed to get AI analysis");
      }
    } catch (error) {
      console.error("AI Summary error:", error);
      toast.error("Failed to analyze vitals data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUserQuery("");
    setAiResponse("");
    setHasAnalyzed(false);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            className="fw-bold mb-0"
            style={{ color: "#2d3748", fontSize: "1.25rem" }}
          >
            AI Health Insights
          </h3>
          <button
            onClick={handleClose}
            className="btn-close"
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          {/* Query Input Form */}
          {!hasAnalyzed && (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label
                  htmlFor="aiQuery"
                  className="form-label"
                  style={{ fontWeight: "500", color: "#374151" }}
                >
                  Ask a specific question (optional):
                </label>
                <textarea
                  id="aiQuery"
                  className="form-control"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., 'Are my BP readings concerning?' or 'What trends do you see?' (Press Enter to analyze)"
                  rows={3}
                  style={{
                    resize: "vertical",
                    borderRadius: "8px",
                  }}
                  disabled={isLoading}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Analysis will include your last 7 days of BP and sugar
                  readings
                </small>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                  style={{ borderRadius: "8px", minWidth: "120px" }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Analyzing...
                    </>
                  ) : (
                    "Get Insights"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* AI Response */}
          {hasAnalyzed && aiResponse && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold" style={{ color: "#2d3748" }}>
                  AI Analysis Results
                </h5>
                <button
                  onClick={() => {
                    setHasAnalyzed(false);
                    setAiResponse("");
                    setUserQuery("");
                  }}
                  className="btn btn-outline-secondary btn-sm"
                  style={{ borderRadius: "6px" }}
                >
                  New Analysis
                </button>
              </div>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "16px",
                  lineHeight: "1.6",
                  fontSize: "0.95rem",
                  color: "#374151",
                }}
              >
                <ReactMarkdown
                  components={{
                    p: ({ ...props }) => <p className="mb-2" {...props} />,
                    ul: ({ ...props }) => (
                      <ul className="ps-3 mb-2" {...props} />
                    ),
                    li: ({ ...props }) => <li className="mb-1" {...props} />,
                    h1: ({ ...props }) => (
                      <h1 className="h5 fw-bold mb-2" {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <h2 className="h6 fw-bold mb-2" {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <h3 className="h6 fw-bold mb-2" {...props} />
                    ),
                    strong: ({ ...props }) => (
                      <strong className="fw-bold text-dark" {...props} />
                    ),
                  }}
                >
                  {aiResponse}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary mb-3" />
              <p className="text-muted">Analyzing your health data...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="modal-footer"
          style={{
            padding: "16px 24px 20px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={handleClose}
            className="btn btn-secondary"
            style={{ borderRadius: "8px" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISummaryModal;

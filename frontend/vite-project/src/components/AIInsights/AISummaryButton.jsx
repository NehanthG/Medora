import React from "react";

const AISummaryButton = ({ onClick, disabled = false, className = "" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-outline-primary d-inline-flex align-items-center ${className}`}
      style={{
        borderRadius: "8px",
        padding: "10px 16px",
        fontSize: "0.95rem",
        fontWeight: "500",
        transition: "all 0.2s ease",
        border: "2px solid #4f46e5",
        color: "#4f46e5",
        backgroundColor: "white",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "#4f46e5";
          e.currentTarget.style.color = "white";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "white";
          e.currentTarget.style.color = "#4f46e5";
        }
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="me-2"
      >
        <path d="M9 12l2 2 4-4" />
        <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z" />
      </svg>
      Get AI Insights
    </button>
  );
};

export default AISummaryButton;
